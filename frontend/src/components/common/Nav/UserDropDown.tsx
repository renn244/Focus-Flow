import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";

type UserDropDownProps = {
  avatarUrl?: string;
  userName: string;
  userEmail: string;
};

const UserDropDown = ({
  avatarUrl,
  userName,
  userEmail,
}: UserDropDownProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logout = async () => {
    localStorage.removeItem("access_token");
    await queryClient.invalidateQueries({ queryKey: ["user"] });
    navigate({ to: "/login" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Account menu" title="Account" className="rounded-full outline-offset-4 focus-visible:outline-2 focus-visible:outline-blue-400">
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatarUrl || undefined} alt={userName || "User"} />
          <AvatarFallback className="bg-blue-100 text-blue-800">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 max-w-[calc(100vw-2rem)]">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="truncate text-sm font-medium leading-5">{userName}</p>
            <p className="truncate text-xs leading-5 text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/settings">
              <User className="size-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings">
              <Settings className="size-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="size-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropDown;
