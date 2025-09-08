import { useProjectSocketContext } from "@/context/ProjectSocketContext";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { TeamMemberUser } from "../type";

export const useActiveMemberSocket = (projectId: string | null) => {
    const { socket } = useProjectSocketContext();
    const queryClient = useQueryClient();

    useEffect(() =>{
        if(!socket) return;

        socket.on('userJoined', (member: TeamMemberUser) => {
            queryClient.setQueryData(['teamMembers', 'activeMembers', projectId], (oldData: TeamMemberUser[] | undefined) => {
                if(!oldData) return [member];

                return [...oldData, member];
            })
        })

        socket.on('userLeft', ({ userId }: { userId: string }) => {
            queryClient.setQueryData(['teamMembers', 'activeMembers', projectId], (oldData: TeamMemberUser[] | undefined) => {
                if(!oldData) return [];

                return oldData.filter(member => member._id !== userId);
            })
        })

        return () => {
            socket.off('userJoined');
            socket.off('userLeft');
        }
    }, [projectId, socket])
}