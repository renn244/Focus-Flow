import { useProjectSocketContext } from "@/context/ProjectSocketContext";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react"
import type { Column, ColumnWithBoardId, ColumnWithTasks } from "../../type";

export const useSortableColumnViewSocket = (boardId: string | null | undefined) => {
    const { socket } = useProjectSocketContext();
    const queryClient = useQueryClient();

    useEffect(() => {
        if(!socket) return;

        socket.on('columnCreated', (newColumn: ColumnWithBoardId) => {
            // cannot use setQueryData because we already invalidate it if it was the one who creted it
            queryClient.invalidateQueries({ queryKey: ['columns', 'byboard', newColumn.boardId] })
        })

        socket.on('columnUpdated', (updatedColumn: ColumnWithBoardId) => {
            const { boardId: updatedBoardId, ...columnUpdatedData } = updatedColumn;

            queryClient.setQueryData(['columns', 'byboard', updatedBoardId], (oldData: ColumnWithTasks[]) => {
                if(!oldData) return oldData;

                return oldData.map(column => column._id === updatedColumn._id ? columnUpdatedData : column);
            })
        })

        socket.on('columnDeleted', (deletedColumn: Column) => {
            // can use the normal boardId because every column id is unique 
            // so even if wrong boardId, it won't delete anything
            queryClient.setQueryData(['columns', 'byboard', boardId], (oldData: ColumnWithTasks[]) => {
                return oldData.filter(column => column._id !== deletedColumn._id);
            })
        })

        socket.on('columnsReordered', (data: { boardId: string, columns: { _id: string, order: number }[] }) => {
            queryClient.setQueryData(['columns', 'byboard', data.boardId], (oldData: ColumnWithTasks[]) => {
                if(!oldData) return oldData;

                // put in map to achieve O(1) lookup time instead of double loop O(n^2)
                const orderMap = new Map(data.columns.map(col => [col._id, col.order]));
                const newData = oldData.map(column => ({
                    ...column, order: orderMap.get(column._id) ?? column.order
                }));

                return newData.sort((a, b) => a.order - b.order);
            })
        })

        return () => {
            socket.off('columnCreated');
            socket.off('columnUpdated');
            socket.off('columnDeleted');
            socket.off('columnsReordered');
        }
    }, [socket, boardId])
}