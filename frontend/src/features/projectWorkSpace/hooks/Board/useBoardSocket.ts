import { useProjectSocketContext } from "@/context/ProjectSocketContext"
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { Board, BoardWithColumns } from "../../type";
import useSelectBoardStore from "../../store/useSelectBoard";

export const useBoardSocket = (projectId: string | null) => {
    const setSelectedBoardId = useSelectBoardStore((state) => state.setSelectedBoardId);

    const { socket } = useProjectSocketContext();
    const queryClient = useQueryClient();
    
    useEffect(() => {
        if(!socket) return;

        socket.on('boardCreated', (newBoard: Board) => {
            queryClient.setQueryData(['boards', projectId], (oldBoards: BoardWithColumns[]) => {
                return oldBoards ? [...oldBoards, newBoard] : [newBoard];
            })
        })

        socket.on('boardUpdated', (updatedBoard: BoardWithColumns) => {
            queryClient.setQueryData(['boards', projectId], (oldBoards: BoardWithColumns[]) => {
                if (!oldBoards) return oldBoards;
                return oldBoards.map((board) => (board._id === updatedBoard._id ? updatedBoard : board));
            })

            queryClient.setQueryData(['board', updatedBoard._id], () => updatedBoard);
        })

        socket.on('boardDeleted', (deletedBoard: Board) => {
            queryClient.setQueryData(['boards', projectId], (oldBoards: BoardWithColumns[]) => {
                return oldBoards ? oldBoards.filter((board) => board._id !== deletedBoard._id) : [];
            })

            // if the deleted board is the selected board, reset the selected board
            setSelectedBoardId(null);
        })

        return () => {
            socket.off('boardCreated');
            socket.off('boardUpdated');
            socket.off('boardDeleted');
        }
    }, [socket, projectId])
}
