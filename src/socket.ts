import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  transports: ['websocket'], // forçar websocket localmente
  withCredentials: true,
});

export default socket;
