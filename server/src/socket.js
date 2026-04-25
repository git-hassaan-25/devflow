import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        // Client sends { projectId } immediately after connecting
        socket.on('join:project', ({ projectId }) => {
            socket.join(`project:${projectId}`);
        });

        socket.on('leave:project', ({ projectId }) => {
            socket.leave(`project:${projectId}`);
        });
    });

    return io;
};

// Called from controllers after DB writes
export const emitToProject = (projectId, event, payload) => {
    if (!io) return;
    io.to(`project:${projectId}`).emit(event, payload);
};