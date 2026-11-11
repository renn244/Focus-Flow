import { describe, expect, it } from 'vitest'
import type { TaskWithBoardAndColumn } from '../type'
import { groupAgenda, hasDueTime, tasksOnDay } from './agenda'

const today = new Date(2026, 2, 10) // Tue 10 Mar 2026, local midnight

const task = (id: string, dueDate?: Date): TaskWithBoardAndColumn => ({
  _id: id,
  title: id,
  description: '',
  priority: 'medium',
  board: { _id: 'b', name: 'Board', projectId: 'p' },
  column: { _id: 'c', title: 'To do', color: '#94a3b8' },
  dueDate: dueDate?.toISOString(),
  createdAt: '',
  updatedAt: '',
})

const at = (days: number, hours = 0) => new Date(2026, 2, 10 + days, hours)

describe('groupAgenda', () => {
  it('sorts dated tasks into overdue, today and the next seven days', () => {
    const groups = groupAgenda(
      [task('later', at(12)), task('today-pm', at(0, 15)), task('overdue', at(-2)), task('tomorrow', at(1)), task('undated')],
      today,
    )

    expect(groups.overdue.map((t) => t._id)).toEqual(['overdue'])
    expect(groups.today.map((t) => t._id)).toEqual(['today-pm'])
    expect(groups.upcoming.map((t) => t._id)).toEqual(['tomorrow'])
    // The first task beyond the week powers the "next up" empty state.
    expect(groups.later?._id).toBe('later')
  })

  it('leaves tasks without a due date out of every group', () => {
    const groups = groupAgenda([task('undated')], today)
    expect([...groups.overdue, ...groups.today, ...groups.upcoming]).toHaveLength(0)
    expect(groups.later).toBeUndefined()
  })
})

describe('tasksOnDay', () => {
  it('returns one day\'s tasks in time order', () => {
    const list = tasksOnDay([task('b', at(1, 16)), task('a', at(1, 9)), task('other', at(2))], at(1))
    expect(list.map((t) => t._id)).toEqual(['a', 'b'])
  })
})

describe('hasDueTime', () => {
  it('treats midnight as "no time set"', () => {
    expect(hasDueTime(at(0).toISOString())).toBe(false)
    expect(hasDueTime(at(0, 15).toISOString())).toBe(true)
  })
})
