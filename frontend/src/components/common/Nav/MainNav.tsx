import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/authContext";
import { Link } from "@tanstack/react-router";
import { Bell, Settings } from "lucide-react";
import { type ComponentProps, type PropsWithChildren } from "react";
import UserDropDown from "./UserDropDown";
import { cn } from "@/lib/utils";

type MainNavProps = {
  className?: string;
} & PropsWithChildren &
  ComponentProps<"div">;

const MainNav = ({ children, className, ...props }: MainNavProps) => {
  const { user } = useAuthContext();

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/projects" className="text-2xl font-bold text-slate-900">
            Project Dashboard
          </Link>
          <div {...props} className={cn("flex items-center gap-2", className)}>
            {children}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/settings" aria-label="Open settings">
              <Settings className="w-4 h-4" />
            </Link>
          </Button>
          <UserDropDown
            userEmail={user?.email || ""}
            userName={user?.displayName || user?.username || ""}
            avatarUrl={user?.avatarUrl || ""}
          />
        </div>
      </div>
    </div>
  );
};

export default MainNav;
