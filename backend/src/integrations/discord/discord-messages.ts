/**
 * Builds the messages the bot posts. Plain Discord API objects, no client needed,
 * so they're easy to test and the same shape discord.js accepts in `channel.send`.
 */

export type DiscordEmbed = {
    color?: number;
    description?: string;
    title?: string;
    url?: string;
    fields?: { name: string; value: string; inline?: boolean }[];
    footer?: { text: string };
    timestamp?: string;
};

export type DiscordMessage = {
    embeds: DiscordEmbed[];
    components?: { type: 1; components: { type: 2; style: 5; label: string; url: string }[] }[];
    /** Never ping anyone from an update. */
    allowed_mentions: { parse: [] };
};

export const COLORS = { created: 0x2563eb, moved: 0x8b5cf6, done: 0x22c55e, note: 0x0ea5e9, summary: 0xf59e0b, test: 0x5865f2 };

const MAX_SUMMARY_LINES = 15;

/** Discord treats *, _, ~, `, | and > as formatting; titles typed by users shouldn't trigger it. */
export const escapeMarkdown = (text: string) => text.replace(/([\\*_~`|>])/g, '\\$1');

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

const linkButton = (label: string, url: string): DiscordMessage['components'] => [
    { type: 1, components: [{ type: 2, style: 5, label, url }] },
];

const message = (embed: DiscordEmbed, button?: { label: string; url: string }): DiscordMessage => ({
    embeds: [embed],
    ...(button ? { components: linkButton(button.label, button.url) } : {}),
    allowed_mentions: { parse: [] },
});

const formatDate = (date: Date, timeZone: string) =>
    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone }).format(date);

export type TaskInfo = {
    title: string;
    board: string;
    column: string;
    assignee?: string;
    dueDate?: Date | null;
    priority?: string;
    checklist?: { done: number; total: number };
    url: string;
};

export const taskCreatedMessage = (actor: string, task: TaskInfo, timeZone: string) => {
    const fields = [
        { name: 'Column', value: escapeMarkdown(task.column), inline: true },
        { name: 'Board', value: escapeMarkdown(task.board), inline: true },
        { name: 'Assignee', value: task.assignee ? escapeMarkdown(task.assignee) : 'Unassigned', inline: true },
    ];
    if (task.dueDate) fields.push({ name: 'Due', value: formatDate(task.dueDate, timeZone), inline: true });
    if (task.priority) fields.push({ name: 'Priority', value: task.priority[0].toUpperCase() + task.priority.slice(1), inline: true });

    return message(
        {
            color: COLORS.created,
            description: `🆕 **${escapeMarkdown(actor)}** created a task\n**${escapeMarkdown(clip(task.title, 200))}**`,
            fields,
        },
        { label: 'Open in FocusFlow', url: task.url },
    );
};

export const taskMovedMessage = (actor: string, task: TaskInfo, from: string, to: string, finished: boolean) => {
    const fields = [
        { name: 'Moved', value: `${escapeMarkdown(from)} → ${escapeMarkdown(to)}`, inline: true },
        { name: 'Board', value: escapeMarkdown(task.board), inline: true },
    ];
    if (task.checklist && task.checklist.total > 0) {
        fields.push({ name: 'Checklist', value: `${task.checklist.done}/${task.checklist.total}`, inline: true });
    }

    return message(
        {
            color: finished ? COLORS.done : COLORS.moved,
            description: `${finished ? '✅' : '➡️'} **${escapeMarkdown(actor)}** ${finished ? 'finished' : 'moved'} a task\n**${escapeMarkdown(clip(task.title, 200))}**`,
            fields,
        },
        { label: 'Open in FocusFlow', url: task.url },
    );
};

export const noteCreatedMessage = (actor: string, title: string, url: string) =>
    message(
        { color: COLORS.note, description: `📝 **${escapeMarkdown(actor)}** created the note **${escapeMarkdown(clip(title, 200))}**` },
        { label: 'Open note', url },
    );

export type SummaryTask = { title: string; assignee?: string; overdue: boolean };

export const dailySummaryMessage = (projectName: string, tasks: SummaryTask[], boardUrl: string) => {
    const lines = tasks.slice(0, MAX_SUMMARY_LINES).map((task) =>
        `• ${escapeMarkdown(clip(task.title, 90))} — ${task.assignee ? `**${escapeMarkdown(task.assignee)}**` : '_unassigned_'}${task.overdue ? ' **(overdue)**' : ''}`,
    );
    if (tasks.length > MAX_SUMMARY_LINES) lines.push(`…and ${tasks.length - MAX_SUMMARY_LINES} more`);

    return message(
        {
            color: COLORS.summary,
            description: `📅 **Due today in ${escapeMarkdown(projectName)}** · ${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}\n\n${lines.join('\n')}`,
        },
        { label: 'Open board', url: boardUrl },
    );
};

export const testMessage = (projectName: string, actor: string, url: string) =>
    message(
        {
            color: COLORS.test,
            description: `👋 **${escapeMarkdown(actor)}** connected this channel to **${escapeMarkdown(projectName)}**. Updates from FocusFlow will show up here.`,
        },
        { label: 'Open project', url },
    );
