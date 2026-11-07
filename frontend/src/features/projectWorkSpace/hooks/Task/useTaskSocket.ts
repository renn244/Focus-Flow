import { useProjectSocketContext } from "@/context/ProjectSocketContext";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { ColumnWithTasks, TaskWithBoardAndColumn } from "../../type";
import { useAuthContext } from "@/context/authContext";

export const useTaskSocket = (boardId: string | null | undefined) => {
    const { user } = useAuthContext();
    const { socket } = useProjectSocketContext();
    const queryClient = useQueryClient();

    useEffect(() => {
        if(!socket) return;

        // taskCreated
        socket.on('taskCreated', (data: TaskWithBoardAndColumn) => {
            queryClient.setQueryData(['columns', 'byboard', boardId], (oldData: ColumnWithTasks[]) => {
                if(!oldData) return oldData;
                
                return oldData.map(column => {
                    if(column._id !== data.column._id) return column;

                    return {
                        ...column, 
                        tasks: column.tasks ? [...column.tasks, data] : [data]
                    }
                })
            })
        })

        // taskMoved
        socket.on('taskMoved', (data: { updatorUserId: string, task: TaskWithBoardAndColumn, taskCurrentColumnId: string, taskFutureColumnId: string }) => {
            queryClient.setQueryData(['columns', 'byboard', boardId], (oldData: ColumnWithTasks[]) => {
                if(!oldData) return oldData;
                
                // no need to update cache for the user who made the change // because it will cause duplicated data
                if(data.updatorUserId === user?._id) return oldData; 
                
                return oldData.map(column => {
                    if(column._id === data.taskCurrentColumnId) {
                        console.log({ ...column, tasks: column.tasks.filter(task => task._id !== data.task._id) })
                        return { ...column, tasks: column.tasks.filter(task => task._id !== data.task._id) }
                    }

                    if(column._id === data.taskFutureColumnId) {
                        console.log({ ...column, tasks: column.tasks ? [...column.tasks, data.task] : [data.task] })
                        return { ...column, tasks: column.tasks ? [...column.tasks, data.task] : [data.task] }
                    }

                    return column;
                })
            })
        })

        // taskUpdated
        socket.on('taskUpdated', (data: TaskWithBoardAndColumn) => {
            // Keep an open task dialog in sync too (e.g. someone else ticks a checklist item).
            queryClient.setQueryData(['task', data._id], (current: TaskWithBoardAndColumn | undefined) => current ? { ...current, ...data } : current);
            queryClient.setQueryData(['columns', 'byboard', boardId], (oldData: ColumnWithTasks[]) => {
                if(!oldData) return oldData;

                return oldData.map(column => {
                    if(column._id !== data.column._id) return column;
                    
                    return {
                        ...column, 
                        tasks: column.tasks.map(task => task._id === data._id ? data : task)
                    }
                })
            })
        })

        // taskDeleted
        socket.on('taskDeleted', (data: { taskId: string, colId: string }) => {
            queryClient.setQueryData(['columns', 'byboard', boardId], (oldData: ColumnWithTasks[]) => {
                if(!oldData) return oldData;

                return oldData.map(column => {
                    if(column._id !== data.colId) return column;

                    return {
                        ...column, tasks: column.tasks.filter(task => task._id !== data.taskId)
                    }
                })
            })
        })

        return () => {
            socket.off('taskCreated');
            socket.off('taskMoved');
            socket.off('taskUpdated');
            socket.off('taskDeleted');
        }
    }, [socket, boardId])
}
