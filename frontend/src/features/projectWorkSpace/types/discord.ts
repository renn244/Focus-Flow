export type DiscordEvents = {
  taskCreated: boolean;
  /** Moves between columns, including finishing a task. */
  taskMoved: boolean;
  noteCreated: boolean;
  /** The 8 AM list of tasks due today or overdue. */
  dailySummary: boolean;
};

export type DiscordProblem = "bot_removed" | "channel_missing" | "no_access" | "no_permission";

export type DiscordIntegration = {
  guildId: string;
  guildName: string;
  channelId: string | null;
  channelName: string | null;
  events: DiscordEvents;
  problem: DiscordProblem | null;
};

export type DiscordStatus = {
  /** Bot credentials are set on the server. */
  configured: boolean;
  botOnline: boolean;
  integration: DiscordIntegration | null;
};

export type DiscordChannel = { id: string; name: string; category: string | null; canPost: boolean };
