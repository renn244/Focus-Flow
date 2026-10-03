import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { TeamMemberWithUser } from "@/features/teamMember/type";
import { ChevronsUpDown, UserRound } from "lucide-react";
import { forwardRef, type ComponentPropsWithoutRef, useState } from "react";

type TaskAssigneeComboboxProps = Omit<ComponentPropsWithoutRef<"button">, "children" | "className" | "disabled" | "onChange" | "value"> & {
    members: TeamMemberWithUser[];
    value?: string | null;
    onValueChange: (value?: string) => void;
    disabled?: boolean;
    className?: string;
};

const getMemberName = (member: TeamMemberWithUser) => member.user.displayName || member.user.username;

const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

const TaskAssigneeCombobox = forwardRef<HTMLButtonElement, TaskAssigneeComboboxProps>(({
    members,
    value,
    onValueChange,
    disabled,
    className,
    ...buttonProps
}, ref) => {
    const [open, setOpen] = useState(false);
    const selectedMember = members.find((member) => member.user._id === value);
    const selectedName = selectedMember ? getMemberName(selectedMember) : undefined;

    const selectMember = (memberId?: string) => {
        onValueChange(memberId);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-label="Assign a team member"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn("w-full justify-between font-normal", className)}
                    ref={ref}
                    {...buttonProps}
                >
                    <span className="flex min-w-0 items-center gap-2">
                        {selectedMember && selectedName ? (
                            <Avatar className="size-5">
                                <AvatarImage src={selectedMember.user.avatarUrl} alt={selectedName} />
                                <AvatarFallback className="text-[9px] font-medium">{getInitials(selectedName)}</AvatarFallback>
                            </Avatar>
                        ) : (
                            <UserRound className="size-4 shrink-0 text-muted-foreground" />
                        )}
                        <span className="truncate">{selectedName || "Unassigned"}</span>
                    </span>
                    <ChevronsUpDown data-icon="inline-end" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search team members..." />
                    <CommandList
                        className="overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        onWheelCapture={(event) => event.stopPropagation()}
                    >
                        <CommandEmpty>No team member found.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem value="unassigned" onSelect={() => selectMember()}>
                                <UserRound className="size-4 text-muted-foreground" />
                                <span>Unassigned</span>
                            </CommandItem>
                            {members.map((member) => {
                                const memberName = getMemberName(member);

                                return (
                                    <CommandItem
                                        key={member._id}
                                        value={`${memberName} ${member.user.username} ${member.user.email}`}
                                        onSelect={() => selectMember(member.user._id)}
                                    >
                                        <Avatar className="size-6">
                                            <AvatarImage src={member.user.avatarUrl} alt={memberName} />
                                            <AvatarFallback className="text-[10px] font-medium">{getInitials(memberName)}</AvatarFallback>
                                        </Avatar>
                                        <span className="min-w-0 truncate">{memberName}</span>
                                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">@{member.user.username}</span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
});

TaskAssigneeCombobox.displayName = "TaskAssigneeCombobox";
export default TaskAssigneeCombobox;
