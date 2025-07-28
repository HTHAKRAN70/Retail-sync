import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userId, userType) {
    if (this.socket && this.socket.connected) { 
      console.log('Existing socket found and connected. Reusing.');
      return this.socket;
    }

    if (this.socket) { 
      console.log('Existing socket found but not connected. Disconnecting and creating new...');
      this.socket.disconnect();
      this.socket = null;
    }

    console.log('Creating new socket connection');
    this.socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true, 
      query: { userId, userType } 
    });

    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
      this.isConnected = true;
      });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected;
  }
}

const socketService = new SocketService();
export default socketService;