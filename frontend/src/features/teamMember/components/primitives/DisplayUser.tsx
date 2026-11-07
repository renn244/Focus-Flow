import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProjectIdStore } from "@/features/projectWorkSpace/store/useProjectId";
import { cn } from "@/lib/utils";
import type { User } from "@/types/User";
import { motion } from 'framer-motion';
import type { ComponentProps } from "react";
import { useGetUserInfo } from "../../hooks/useGetUserInfo";
import ListLoading from "@/components/common/ListLoading";

type DisplayUserProps = {
    userId: User['_id'];
    className?: string;
    userOnClick: (e: any) => void | undefined;
} & ComponentProps<"div">;

const DisplayUser = ({ userId, className, userOnClick, ...props }: DisplayUserProps) => {
    const projectId = useProjectIdStore((state) => state.projectId);
    
    const { data: user, isLoading } = useGetUserInfo(userId, projectId);

    if (isLoading) {
        return <ListLoading label="Loading member profile" rows={1} avatar className={className} />;
    }

    return (
        <div 
        className={cn('flex items-center justify-between p-2 rounded-md border transition-colors', className)}
        {...props}
        >
            <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={userOnClick}
            className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.displayName} />
                    <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-medium text-gray-900">{user.displayName}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                </div>
            </motion.div>
        </div>
    )
} 

export default DisplayUser
