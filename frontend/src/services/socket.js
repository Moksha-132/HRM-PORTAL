import { io } from "socket.io-client";

// Use the environment variable for the backend URL, fallback to window.location.origin
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin.replace(':5173', ':5000');

const socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket'],
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
