/** Minutes a time zone is ahead of UTC at a given moment (e.g. +480 for Asia/Manila). */
const offsetMinutes = (date: Date, timeZone: string) => {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', {
            timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
        }).formatToParts(date).map((part) => [part.type, part.value]),
    );
    const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
    return Math.round((asUtc - date.getTime()) / 60000);
};

/** Start and end of the calendar day containing `date`, in the given time zone. */
export const dayBounds = (date: Date, timeZone: string) => {
    const local = new Date(date.getTime() + offsetMinutes(date, timeZone) * 60000);
    const midnightUtc = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
    const start = new Date(midnightUtc - offsetMinutes(new Date(midnightUtc), timeZone) * 60000);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
    return { start, end };
};
