import { Button } from "@/components/ui/button";
import MainNav from "@/components/common/Nav/MainNav";
import { useAuthContext } from "@/context/authContext";
import AvatarUpload from "@/features/settings/components/AvatarUpload";
import ChangeSettingsPasswordForm from "@/features/settings/components/ChangeSettingsPasswordForm";
import ProfileSettingsForm from "@/features/settings/components/ProfileSettingsForm";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ChevronLeft, Mail, ShieldCheck } from "lucide-react";

const UserSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <MainNav />
      <main className="px-4 py-7 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/projects" })}
            className="mb-6 -ml-2 text-slate-600"
          >
            <ChevronLeft className="size-4" />
            Back to projects
          </Button>

          <div className="mb-7">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Settings
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your profile and account preferences.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
              <section className="p-6 sm:p-8">
                <div className="mb-7">
                  <h2 className="text-base font-semibold text-slate-950">
                    Profile
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
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

              <aside className="border-t border-slate-200 bg-slate-50/70 p-6 sm:p-8 lg:border-l lg:border-t-0">
                <h2 className="text-base font-semibold text-slate-950">
                  Account details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your sign-in information and verification status.
                </p>

                <dl className="mt-7 space-y-6">
                  <div>
                    <dt className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Mail className="size-4 text-slate-400" />
                      Email
                    </dt>
                    <dd className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                      {user.email}
                    </dd>
                  </div>

                  <div>
                    <dt className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                      <ShieldCheck className="size-4 text-slate-400" />
                      Email verification
                    </dt>
                    <dd className="flex items-start gap-2 rounded-md border border-slate-200 bg-white p-3 text-sm">
                      <CheckCircle2
                        className={`mt-0.5 size-4 shrink-0 ${user.emailVerified ? "text-emerald-600" : "text-slate-400"}`}
                      />
                      <span className="text-slate-600">
                        {user.emailVerified
                          ? "Verified - your email is confirmed."
                          : "Not verified - confirm your email to secure your account."}
                      </span>
                    </dd>
                  </div>
                </dl>
              </aside>
            </div>

            <section className="border-t border-slate-200 p-6 sm:p-8">
              <div className="max-w-xl">
                <h2 className="text-base font-semibold text-slate-950">
                  Password
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Change the password you use to sign in to FocusFlow.
                </p>

                {user.isOauthUser ? (
                  <p className="mt-5 text-sm text-slate-600">
                    Your password is managed by your connected sign-in provider.
                  </p>
                ) : (
                  <ChangeSettingsPasswordForm />
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserSettings;
