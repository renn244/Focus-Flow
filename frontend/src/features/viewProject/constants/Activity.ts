import { CheckCircle2, FileText, Flag, MessageSquare, Settings, UserPlus } from "lucide-react";


export const activityColors = {
    task: "bg-green-100 text-green-600",
    team: "bg-purple-100 text-purple-600",
    status_changed: "bg-orange-100 text-orange-600", // later
    comment_added: "bg-cyan-100 text-cyan-600", // later on
    milestone: "bg-pink-100 text-pink-600", // later on
} as const;

export const activityIcons = {
    task: CheckCircle2,
    team: UserPlus,
    status_changed: Settings, // later on
    comment_added: MessageSquare, // later on
    file_uploaded: FileText, // later on
    milestone: Flag,
}