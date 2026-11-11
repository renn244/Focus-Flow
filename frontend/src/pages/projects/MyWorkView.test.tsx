import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RouterProvider, createMemoryHistory, createRootRoute, createRouter } from '@tanstack/react-router'
import { AuthContext, type AuthContextType } from '@/context/authContext'
import type { TaskWithBoardAndColumn } from '@/features/projectWorkSpace/type'
import type { ProjectWithOwner } from '@/features/projects/type'
import { useMyTasks } from '@/features/projectWorkSpace/hooks/Task/useMyTasks'
import { useNavProjects } from '@/features/projects/hooks/useNavProjects'
import { MyWorkView } from './ProjectsDashboard'

vi.mock('@/features/projectWorkSpace/hooks/Task/useMyTasks', () => ({ useMyTasks: vi.fn() }))
vi.mock('@/features/projects/hooks/useNavProjects', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/projects/hooks/useNavProjects')>()),
  useNavProjects: vi.fn(),
}))

const NOW = new Date(2026, 2, 10, 9, 0) // Tue 10 Mar 2026, 09:00

const auth: AuthContextType = {
  isAuthenticated: true,
  isLoading: false,
  checkAuth: async () => undefined,
  user: { _id: 'u1', username: 'alex', email: 'alex@example.com', emailVerified: true, displayName: 'Alex Rivera', isOauthUser: false },
}

const project = { _id: 'p1', name: 'Capstone app', color: 'bg-blue-500', openTasks: 3 } as ProjectWithOwner

const task = (id: string, title: string, dueDate: Date, priority: 'low' | 'medium' | 'high' = 'medium'): TaskWithBoardAndColumn => ({
  _id: id,
  title,
  description: '',
  priority,
  board: { _id: 'b1', name: 'Sprint 3', projectId: 'p1' },
  column: { _id: 'c1', title: 'To do', color: '#94a3b8' },
  dueDate: dueDate.toISOString(),
  createdAt: '',
  updatedAt: '',
})

type QueryState<T> = { data?: T; isLoading?: boolean; isError?: boolean; isFetching?: boolean; refetch?: () => void }

const mockTasks = (state: QueryState<TaskWithBoardAndColumn[]>) =>
  vi.mocked(useMyTasks).mockReturnValue({ isLoading: false, isError: false, isFetching: false, refetch: vi.fn(), ...state } as unknown as ReturnType<typeof useMyTasks>)

const mockProjects = (projects: ProjectWithOwner[]) =>
  vi.mocked(useNavProjects).mockReturnValue({ data: projects, isLoading: false } as unknown as ReturnType<typeof useNavProjects>)

/** MyWorkView links and navigates, so it needs a router around it. */
const renderView = (ui: ReactNode = <MyWorkView />) => {
  const rootRoute = createRootRoute({ component: () => <AuthContext.Provider value={auth}>{ui}</AuthContext.Provider> })
  const router = createRouter({ routeTree: rootRoute, history: createMemoryHistory({ initialEntries: ['/'] }) })
  return render(<RouterProvider router={router as never} />)
}

describe('My work dashboard', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: NOW, shouldAdvanceTime: true })
    mockProjects([project])
  })
  afterEach(() => vi.useRealTimers())

  it('shows a loading state while tasks load', async () => {
    mockTasks({ isLoading: true })
    renderView()

    expect(await screen.findByText('Loading your agenda…')).toBeInTheDocument()
    expect(screen.getByText('Loading your tasks').closest('[role="status"]')).toHaveAttribute('aria-busy', 'true')
  })

  it('shows an error with a working "Try again"', async () => {
    const refetch = vi.fn()
    mockTasks({ isError: true, refetch })
    renderView()

    expect(await screen.findByText("Your tasks couldn't load.")).toBeInTheDocument()
    await userEvent.setup({ advanceTimers: vi.advanceTimersByTime }).click(screen.getByRole('button', { name: /try again/i }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('points a new user to creating a project when there is nothing yet', async () => {
    mockTasks({ data: [] })
    mockProjects([])
    renderView()

    expect(await screen.findByText('Nothing is due today.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /create a project/i })).toHaveAttribute('href', '/projects/all')
  })

  it('lists dated tasks by today, overdue and the coming week', async () => {
    mockTasks({
      data: [
        task('t1', 'Fix the date picker', new Date(2026, 2, 9), 'high'),
        task('t2', 'Build the sign-up flow', new Date(2026, 2, 10, 15, 0)),
        task('t3', 'Write onboarding copy', new Date(2026, 2, 12)),
      ],
    })
    renderView()

    // The summary line counts each group.
    expect(await screen.findByText(/Hi Alex\./)).toHaveTextContent('Hi Alex. 1 due today, 1 overdue, 1 more this week.')

    // Today's list shows the timed task with its time.
    expect(screen.getByText('Build the sign-up flow')).toBeInTheDocument()
    expect(screen.getByText('15:00')).toBeInTheDocument()
    expect(screen.queryByText('Fix the date picker')).not.toBeInTheDocument()

    // Switching to Overdue shows the late task instead.
    await userEvent.setup({ advanceTimers: vi.advanceTimersByTime }).click(screen.getByRole('button', { name: /^overdue/i }))
    expect(screen.getByText('Fix the date picker')).toBeInTheDocument()
    expect(screen.queryByText('Build the sign-up flow')).not.toBeInTheDocument()
  })
})
