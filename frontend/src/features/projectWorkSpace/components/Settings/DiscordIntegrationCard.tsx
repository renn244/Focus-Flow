import { useState } from "react";
import { AlertTriangle, CalendarClock, Hash, Send, Unplug } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useDiscordChannels, useDiscordStatus, useDisconnectDiscord, useSendDiscordSummary, useSendDiscordTest, useStartDiscordInstall, useUpdateDiscord,
} from "../../hooks/Integrations/useDiscord";
import type { DiscordChannel, DiscordEvents, DiscordIntegration } from "../../types/discord";

const EVENT_OPTIONS: { key: keyof DiscordEvents; label: string; hint: string }[] = [
  { key: "taskCreated", label: "Task created", hint: "Who made it, its column, assignee and due date" },
  { key: "taskMoved", label: "Task moved or finished", hint: "Every move between columns; finishing is shown in green" },
  { key: "noteCreated", label: "New note", hint: "Posted a minute later, so the note has its real title" },
  { key: "dailySummary", label: "Daily “due today” summary", hint: "8:00 AM, only on days something is due or overdue" },
];

const DiscordLogo = ({ className }: { className?: string }) => (
  <span aria-hidden="true" className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#5865F2] text-white", className)}>
    <svg viewBox="0 0 24 24" className="size-6" fill="currentColor">
      <path d="M20.3 4.4A19.6 19.6 0 0 0 15.4 3l-.6 1.3a18.2 18.2 0 0 0-5.6 0L8.6 3a19.6 19.6 0 0 0-4.9 1.4C.6 9 -.3 13.5.1 18a19.8 19.8 0 0 0 6 3l1.3-2a12.8 12.8 0 0 1-2-1l.5-.4a14.1 14.1 0 0 0 12.2 0l.5.4a12.8 12.8 0 0 1-2 1l1.3 2a19.7 19.7 0 0 0 6-3c.5-5.2-.8-9.7-3.6-13.6ZM8.1 15.3c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm7.8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z" />
    </svg>
  </span>
);

const Toggle = ({ checked, onChange, label, hint }: { checked: boolean; onChange: (value: boolean) => void; label: string; hint: string }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="flex w-full items-center justify-between gap-4 border-t py-3 text-left first:border-t-0 focus-visible:outline-2"
  >
    <span className="min-w-0">
      <span className="block text-sm font-medium">{label}</span>
      <span className="block text-[13px] text-muted-foreground">{hint}</span>
    </span>
    <span className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", checked ? "bg-primary" : "bg-slate-300")}>
      <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-[left]", checked ? "left-[18px]" : "left-0.5")} />
    </span>
  </button>
);

/** Connects the project to a Discord server and controls what the FocusFlow bot posts there. */
const DiscordIntegrationCard = ({ projectId }: { projectId: string }) => {
  const { data: status, isLoading, isError } = useDiscordStatus(projectId);
  const install = useStartDiscordInstall(projectId);
  const integration = status?.integration ?? null;

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-3"><Skeleton className="size-10 rounded-lg" /><Skeleton className="h-5 w-40" /></div>
      </div>
    );
  }
  if (isError || !status) {
    return <p role="alert" className="rounded-xl border bg-card p-5 text-sm text-destructive">The Discord settings could not be loaded.</p>;
  }

  const connect = () => install.mutate(undefined, { onError: (error) => toast.error(error.message) });

  return (
    <section aria-labelledby="discord-heading" className="rounded-xl border bg-card">
      <div className="flex flex-wrap items-center gap-3 p-5">
        <DiscordLogo />
        <div className="min-w-0 flex-1">
          <h3 id="discord-heading" className="flex items-center gap-2 font-semibold">
            Discord
            {integration && !integration.problem && integration.channelId && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">Connected</span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            {integration ? <>Server: <span className="font-medium text-foreground">{integration.guildName}</span></> : "Post task updates and a daily summary to a Discord channel."}
          </p>
        </div>
        {!integration && (
          <Button onClick={connect} disabled={!status.configured || install.isPending} className="bg-[#5865F2] hover:bg-[#4752c4]">
            Add to Discord
          </Button>
        )}
      </div>

      {!status.configured && (
        <p className="border-t px-5 py-3 text-sm text-muted-foreground">
          The Discord bot isn’t set up on this server yet. Ask whoever runs FocusFlow to add the bot’s credentials.
        </p>
      )}
      {status.configured && !status.botOnline && (
        <p className="flex items-center gap-2 border-t bg-amber-50 px-5 py-2.5 text-sm text-amber-900">
          <AlertTriangle className="size-4 shrink-0" /> The bot is offline right now. Updates resume when it reconnects.
        </p>
      )}
      {!integration && status.configured && (
        <p className="border-t px-5 py-3 text-[13px] text-muted-foreground">
          You’ll pick a Discord server where you can manage the server, then choose the channel here.
        </p>
      )}

      {integration && <ConnectedSettings projectId={projectId} integration={integration} onReconnect={connect} reconnecting={install.isPending} />}
    </section>
  );
};

type ConnectedProps = { projectId: string; integration: DiscordIntegration; onReconnect: () => void; reconnecting: boolean };

const ConnectedSettings = ({ projectId, integration, onReconnect, reconnecting }: ConnectedProps) => {
  const botGone = integration.problem === "bot_removed";
  const channels = useDiscordChannels(projectId, !botGone);
  const update = useUpdateDiscord(projectId);
  const sendTest = useSendDiscordTest(projectId);
  const sendSummary = useSendDiscordSummary(projectId);
  const disconnect = useDisconnectDiscord(projectId);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  const pickChannel = (channelId: string) =>
    update.mutate(
      { channelId },
      {
        onSuccess: (saved) => toast.success(`FocusFlow will post in #${saved.channelName}`, { description: "Send a test message to check it." }),
        onError: (error) => toast.error(error.message),
      }
    );

  const toggle = (key: keyof DiscordEvents, value: boolean) =>
    update.mutate({ events: { [key]: value } }, { onError: (error) => toast.error(error.message) });

  const run = (mutation: typeof sendTest) =>
    mutation.mutate(undefined, { onSuccess: ({ message }) => toast.success(message), onError: (error) => toast.error(error.message) });

  return (
    <>
      <Problem integration={integration} onReconnect={onReconnect} reconnecting={reconnecting} />

      <div className="border-t px-5 py-4">
        <label htmlFor="discord-channel" className="mb-1.5 block text-sm font-medium">Channel</label>
        <div className="flex flex-wrap gap-2">
          <ChannelPicker
            channels={channels.data}
            loading={channels.isLoading}
            value={integration.channelId}
            fallbackName={integration.channelName}
            disabled={botGone || update.isPending}
            onChange={pickChannel}
          />
          <Button variant="outline" onClick={() => run(sendTest)} disabled={!integration.channelId || sendTest.isPending}>
            <Send /> Send test message
          </Button>
        </div>
        {channels.isError && <p className="mt-1.5 text-[13px] text-destructive">{channels.error.message}</p>}
        {channels.data && channels.data.some((channel) => !channel.canPost) && (
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Greyed-out channels don’t let the bot post. In Discord, give it View Channel, Send Messages and Embed Links there.
          </p>
        )}
      </div>

      <div className={cn("border-t px-5 py-2", !integration.channelId && "pointer-events-none opacity-50")} aria-disabled={!integration.channelId}>
        <h4 className="pt-2 text-sm font-medium">What to post</h4>
        {EVENT_OPTIONS.map((option) => (
          <Toggle
            key={option.key}
            checked={integration.events[option.key]}
            onChange={(value) => toggle(option.key, value)}
            label={option.label}
            hint={option.hint}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t px-5 py-3">
        <Button variant="ghost" size="sm" onClick={() => run(sendSummary)} disabled={!integration.channelId || sendSummary.isPending}>
          <CalendarClock /> Post today’s summary now
        </Button>
        <Button variant="ghost" size="sm" className="ml-auto text-red-700 hover:bg-red-50 hover:text-red-800" onClick={() => setConfirmDisconnect(true)}>
          <Unplug /> Disconnect
        </Button>
      </div>

      <Dialog open={confirmDisconnect} onOpenChange={setConfirmDisconnect}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disconnect Discord?</DialogTitle>
            <DialogDescription>
              FocusFlow stops posting to {integration.channelName ? `#${integration.channelName}` : "Discord"}. If no other project uses
              {" "}{integration.guildName}, the bot also leaves that server.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDisconnect(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={disconnect.isPending}
              onClick={() =>
                disconnect.mutate(undefined, {
                  onSuccess: () => {
                    setConfirmDisconnect(false);
                    toast.success("Discord disconnected");
                  },
                  onError: (error) => toast.error(error.message),
                })
              }
            >
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const Problem = ({ integration, onReconnect, reconnecting }: { integration: DiscordIntegration; onReconnect: () => void; reconnecting: boolean }) => {
  const channel = integration.channelName ? `#${integration.channelName}` : "the channel";
  const text = {
    bot_removed: `The bot was removed from ${integration.guildName}, so nothing is being posted.`,
    channel_missing: "The channel was deleted. Pick another one below.",
    no_access: `The bot can’t see ${channel}. In Discord, let it View Channel there, or pick another channel.`,
    no_permission: `The bot isn’t allowed to post in ${channel}. Give it Send Messages and Embed Links there, or pick another channel.`,
  };
  if (!integration.problem) {
    return integration.channelId ? null : (
      <p className="flex items-center gap-2 border-t bg-blue-50 px-5 py-2.5 text-sm text-blue-900">
        <Hash className="size-4 shrink-0" /> Pick the channel FocusFlow should post in.
      </p>
    );
  }
  return (
    <div role="alert" className="flex flex-wrap items-center gap-2 border-t bg-amber-50 px-5 py-2.5 text-sm text-amber-900">
      <AlertTriangle className="size-4 shrink-0" />
      <span className="min-w-0 flex-1">{text[integration.problem]}</span>
      {integration.problem === "bot_removed" && (
        <Button size="sm" variant="outline" className="h-7 bg-white" onClick={onReconnect} disabled={reconnecting}>Add it again</Button>
      )}
    </div>
  );
};

type ChannelPickerProps = {
  channels?: DiscordChannel[];
  loading: boolean;
  value: string | null;
  fallbackName: string | null;
  disabled: boolean;
  onChange: (channelId: string) => void;
};

const ChannelPicker = ({ channels, loading, value, fallbackName, disabled, onChange }: ChannelPickerProps) => {
  const groups = new Map<string, DiscordChannel[]>();
  for (const channel of channels ?? []) {
    const key = channel.category ?? "";
    groups.set(key, [...(groups.get(key) ?? []), channel]);
  }

  return (
    <Select value={value ?? undefined} onValueChange={onChange} disabled={disabled || loading}>
      <SelectTrigger id="discord-channel" className="w-full min-w-0 sm:w-64">
        <SelectValue placeholder={loading ? "Loading channels…" : "Choose a channel"}>
          {value && <span className="flex items-center gap-1.5"><Hash className="size-3.5 text-muted-foreground" />{channels?.find((item) => item.id === value)?.name ?? fallbackName}</span>}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {[...groups.entries()].map(([category, items]) => (
          <SelectGroup key={category || "none"}>
            {category && <SelectLabel className="text-[11px] uppercase tracking-wide">{category}</SelectLabel>}
            {items.map((channel) => (
              <SelectItem key={channel.id} value={channel.id} disabled={!channel.canPost}>
                <Hash className="size-3.5 text-muted-foreground" />
                {channel.name}
                {!channel.canPost && <span className="text-xs text-muted-foreground">· bot can’t post</span>}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
        {channels?.length === 0 && <p className="px-2 py-1.5 text-sm text-muted-foreground">No text channels found.</p>}
      </SelectContent>
    </Select>
  );
};

export default DiscordIntegrationCard;
