import AppShell from "@/components/layout/AppShell";
import { useAuthContext } from "@/context/authContext";
import AvatarUpload from "@/features/settings/components/AvatarUpload";
import ChangeSettingsPasswordForm from "@/features/settings/components/ChangeSettingsPasswordForm";
import ProfileSettingsForm from "@/features/settings/components/ProfileSettingsForm";
import TwoStepSignIn from "@/features/settings/components/TwoStepSignIn";
import { CheckCircle2, Mail, ShieldCheck } from "lucide-react";

const UserSettings = () => {
  const { user } = useAuthContext();

  if (!user) {
    return null;
  }

  return (
    <AppShell>
      <div className="px-4 py-7 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-7">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Settings
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your profile and account preferences.
            </p>
          </div>

          <div className="border-t border-border">
            <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
              <section className="min-w-0 py-7 lg:pr-10">
                <div className="mb-7">
                  <h2 className="text-base font-semibold text-foreground">
                    Profile
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This information is visible to people you work with.
                  </p>
                </div>

                <AvatarUpload
                  avatarUrl={user.avatarUrl}
                  displayName={user.displayName}
                  username={user.username}
                />
                <ProfileSettingsForm
                  displayName={user.displayName}
                  username={user.username}
                />
              </section>

              <aside className="min-w-0 border-t border-border py-7 lg:border-l lg:border-t-0 lg:pl-8">
                <h2 className="text-base font-semibold text-foreground">
                  Account details
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your sign-in information and verification status.
                </p>

                <dl className="mt-7 space-y-6">
                  <div>
                    <dt className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      <Mail className="size-4 text-muted-foreground" />
                      Email
                    </dt>
                    <dd className="break-all text-sm text-muted-foreground">
                      {user.email}
                    </dd>
                  </div>

                  <div>
                    <dt className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      <ShieldCheck className="size-4 text-muted-foreground" />
                      Email verification
                    </dt>
                    <dd className="flex items-start gap-2 text-sm">
                      <CheckCircle2
                        className={`mt-0.5 size-4 shrink-0 ${user.emailVerified ? "text-emerald-600" : "text-muted-foreground"}`}
                      />
                      <span className="text-muted-foreground">
                        {user.emailVerified
                          ? "Verified - your email is confirmed."
                          : "Not verified - confirm your email to secure your account."}
                      </span>
                    </dd>
                  </div>
                </dl>
              </aside>
            </div>

            <section className="border-t border-border py-7">
              <div className="max-w-xl">
                <h2 className="text-base font-semibold text-foreground">
                  Password
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Change the password you use to sign in to FocusFlow.
                </p>

                {user.isOauthUser ? (
                  <p className="mt-5 text-sm text-muted-foreground">
                    Your password is managed by your connected sign-in provider.
                  </p>
                ) : (
                  <ChangeSettingsPasswordForm />
                )}
              </div>
            </section>

            <section className="border-t border-border py-7">
              <div className="max-w-xl">
                <h2 className="text-base font-semibold text-foreground">
                  Two-step sign-in
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ask for a 6-digit code from your phone after your password.
                </p>

                {user.isOauthUser ? (
                  <p className="mt-5 text-sm text-muted-foreground">
                    You sign in with GitHub, so your account is protected by GitHub's own two-step settings.
                  </p>
                ) : (
                  <TwoStepSignIn enabled={!!user.mfaEnabled} />
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default UserSettings;
