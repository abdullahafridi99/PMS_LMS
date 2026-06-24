const socketIo = require('socket.io');

let ioInstance = null;

const initializeSocket = (server) => {
  ioInstance = socketIo(server, {
    cors: {
      origin: '*', // In production, replace with specific frontend URL
      methods: ['GET', 'POST']
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log(`🔌 Client connected to Socket.IO: ${socket.id}`);

    // Join room based on user role and details
    socket.on('join_session', (data) => {
      const { userId, role, tenantId } = data;
      
      if (role) {
        socket.join(`role_${role}`);
        console.log(`👤 Socket ${socket.id} joined room: role_${role}`);
      }
      
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`👤 Socket ${socket.id} joined room: user_${userId}`);
      }

      if (tenantId) {
        socket.join(`tenant_${tenantId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

const socketEmitService = {
  notifyUser: (userId, eventName, payload) => {
    if (ioInstance) {
      ioInstance.to(`user_${userId}`).emit(eventName, payload);
      console.log(`📡 Dispatched event "${eventName}" to user_${userId}`);
    }
  },

  notifyRole: (role, eventName, payload) => {
    if (ioInstance) {
      ioInstance.to(`role_${role}`).emit(eventName, payload);
      console.log(`📡 Dispatched event "${eventName}" to role_${role}`);
    }
  },

  broadcast: (eventName, payload) => {
    if (ioInstance) {
      ioInstance.emit(eventName, payload);
      console.log(`📡 Broadcasted event "${eventName}" to all clients`);
    }
  }
};

module.exports = {
  initializeSocket,
  socketEmitService
};
