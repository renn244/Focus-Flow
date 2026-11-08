import { COLORS, dailySummaryMessage, escapeMarkdown, taskCreatedMessage, taskMovedMessage } from './discord-messages';
import { dayBounds } from './time';

const task = {
    title: 'Login *page* redesign',
    board: 'Sprint 4',
    column: 'To do',
    assignee: 'Ana Lim',
    dueDate: new Date('2026-11-12T00:00:00Z'),
    priority: 'high',
    checklist: { done: 3, total: 3 },
    url: 'http://localhost:5174/projects/p1?task=t1',
};

describe('discord messages', () => {
    it('escapes Discord formatting in user text', () => {
        expect(escapeMarkdown('a *b* _c_ `d` ~e~ |f| >g')).toBe('a \\*b\\* \\_c\\_ \\`d\\` \\~e\\~ \\|f\\| \\>g');
    });

    it('describes a new task with its details and a link button, and never pings anyone', () => {
        const message = taskCreatedMessage('Demo Student', task, 'UTC');
        const embed = message.embeds[0];

        expect(embed.color).toBe(COLORS.created);
        expect(embed.description).toContain('**Demo Student** created a task');
        expect(embed.description).toContain('Login \\*page\\* redesign');
        expect(embed.fields).toEqual(expect.arrayContaining([
            { name: 'Assignee', value: 'Ana Lim', inline: true },
            { name: 'Due', value: 'Nov 12', inline: true },
            { name: 'Priority', value: 'High', inline: true },
        ]));
        expect(message.components?.[0].components[0]).toEqual({ type: 2, style: 5, label: 'Open in FocusFlow', url: task.url });
        expect(message.allowed_mentions).toEqual({ parse: [] });
    });

    it('marks a move into a finished column as done, in green, with the checklist', () => {
        const done = taskMovedMessage('Ana Lim', task, 'In review', 'Done', true).embeds[0];
        expect(done.color).toBe(COLORS.done);
        expect(done.description).toContain('✅ **Ana Lim** finished a task');
        expect(done.fields).toContainEqual({ name: 'Checklist', value: '3/3', inline: true });

        const moved = taskMovedMessage('Ana Lim', { ...task, checklist: { done: 0, total: 0 } }, 'To do', 'In progress', false).embeds[0];
        expect(moved.color).toBe(COLORS.moved);
        expect(moved.fields?.map((field) => field.name)).toEqual(['Moved', 'Board']);
    });

    it('lists due tasks, flags overdue ones, and caps a long list', () => {
        const many = Array.from({ length: 18 }, (_, index) => ({ title: `Task ${index + 1}`, assignee: index % 2 ? 'Ana' : undefined, overdue: index === 0 }));
        const text = dailySummaryMessage('Capstone', many, 'http://x').embeds[0].description!;

        expect(text).toContain('**Due today in Capstone** · 18 tasks');
        expect(text).toContain('• Task 1 — _unassigned_ **(overdue)**');
        expect(text).toContain('• Task 2 — **Ana**');
        expect(text).not.toContain('Task 16');
        expect(text).toContain('…and 3 more');
    });
});

describe('dayBounds', () => {
    it('finds the calendar day in the given time zone', () => {
        // 23:30 UTC on Nov 7 is already Nov 8 in Manila (UTC+8).
        const { start, end } = dayBounds(new Date('2026-11-07T23:30:00Z'), 'Asia/Manila');
        expect(start.toISOString()).toBe('2026-11-07T16:00:00.000Z');
        expect(end.toISOString()).toBe('2026-11-08T15:59:59.999Z');
    });

    it('works for zones behind UTC', () => {
        const { start } = dayBounds(new Date('2026-11-08T03:00:00Z'), 'America/New_York');
        expect(start.toISOString()).toBe('2026-11-07T05:00:00.000Z');
    });
});
