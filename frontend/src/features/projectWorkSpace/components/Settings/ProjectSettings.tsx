import DiscordIntegrationCard from "./DiscordIntegrationCard";

/** Project settings for owners and admins. For now: connected apps. */
const ProjectSettings = ({ projectId }: { projectId: string }) => (
  <div className="app-content">
    <div className="mx-auto max-w-3xl">
      <h2 className="text-lg font-semibold">Integrations</h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">Connect this project to the apps your team already uses. Only owners and admins can change these.</p>
      <DiscordIntegrationCard projectId={projectId} />
    </div>
  </div>
);

export default ProjectSettings;
