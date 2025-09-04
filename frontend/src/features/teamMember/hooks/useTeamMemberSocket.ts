import { useEffect } from "react";
import type { TeamMemberWithUser } from "../type";
import { useQueryClient } from "@tanstack/react-query";
import { useProjectSocketContext } from "@/context/ProjectSocketContext";

export const useTeamMemberSocket = (projectId: string | null) => {
    const { socket } = useProjectSocketContext();
    const queryClient = useQueryClient();

    useEffect(() => {
        if(!socket || !projectId) return;

        socket.on('memberAdded', async (addedMember: TeamMemberWithUser) => {
            await queryClient.setQueryData(
                ['teamMembers', projectId], (oldData: TeamMemberWithUser[]) => oldData ? [...oldData, addedMember] : [addedMember]
            )
        })

        socket.on('memberUpdated', async (updatedMember: TeamMemberWithUser) => {
            await queryClient.setQueryData(['teamMembers', projectId], (oldData: TeamMemberWithUser[]) => {
                if(!oldData) return oldData;
                
                return oldData.map(member => member._id === updatedMember._id ? updatedMember : member)
            })
        })

        socket.on('memberRemoved', async (deletedMember: TeamMemberWithUser) => {
            await queryClient.setQueryData(['teamMembers', projectId], (oldData: TeamMemberWithUser[]) => {
                if(!oldData) return oldData;

                return oldData.filter(member => member._id !== deletedMember._id)
            })
        })

        return () => {
            socket.off('memberAdded');
            socket.off('memberUpdated');
            socket.off('memberRemoved');
        }
    }, [socket, projectId])
}


