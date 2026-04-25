import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export function useSocket(projectId, handlers) {
    const socketRef = useRef(null);

    useEffect(() => {
        if (!projectId) return;

        const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
        socketRef.current = socket;

        socket.emit('join:project', { projectId });

        if (handlers.onTaskCreated)
            socket.on('task:created', handlers.onTaskCreated);
        if (handlers.onTaskUpdated)
            socket.on('task:updated', handlers.onTaskUpdated);
        if (handlers.onTaskDeleted)
            socket.on('task:deleted', handlers.onTaskDeleted);

        return () => {
            socket.emit('leave:project', { projectId });
            socket.disconnect();
        };
    }, [projectId]);
}