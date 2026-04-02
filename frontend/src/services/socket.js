import { io } from "socket.io-client";

const isDev = import.meta.env.DEV;
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || (isDev ? '/' : window.location.origin);

const socket = io(SOCKET_URL, {
    autoConnect: false,
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
});

// Logging for development
socket.on('connect', () => {
    console.log('🔌 [Socket.io] Connected to server:', socket.id);
});

socket.on('disconnect', (reason) => {
    console.log('🔌 [Socket.io] Disconnected:', reason);
});

socket.on('connect_error', (error) => {
    console.error('🔌 [Socket.io] Connection error:', error);
});

export default socket;
