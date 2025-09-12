import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthContext } from './authContext';

export type ProjectSocketContextType = { socket: Socket | undefined; }

const initialContextState: ProjectSocketContextType = { socket: undefined };

const SocketContext = createContext<ProjectSocketContextType>(initialContextState);

export const useProjectSocketContext = () => {
    return useContext(SocketContext);
}

type ProjectSocketProviderType = {
    projectId: string;
} & PropsWithChildren;

export const ProjectSocketProvider = ({
    children,
    projectId
}: ProjectSocketProviderType) => {
    const [socket, setSocket] = useState<Socket | undefined>(undefined);
    const [connected, setConnected] = useState(false);
    const { user } = useAuthContext();

    useEffect(() => {
        if(!user || !projectId) return;

        const socket = io('http://localhost:5000', {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            transports: ['websocket'],
            query: { userId: user._id, projectId: projectId }
        })

        setSocket(socket);

        socket.on('connect', () => {
            setConnected(true);
            console.log('Socket connected');
        })

        socket.on('disconnect', () => {
            setConnected(false);
            // toast.error('offline!');
        })

        return () => {
            socket.close();
        }
    }, [user, projectId])

    const value = { socket }

    // if it still not connected we should return null
    // because the guard are reliant on socket connection specially for the projectIdToUserId Mapping.
    // it will lead to issues if the socket is not yet connected and we are already requesting.
    if(!connected) return null;

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    )
}