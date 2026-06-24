import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const socketUrl = 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      autoConnect: true,
      reconnectionAttempts: 5
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🔌 Connected to Socket.IO notification channel');
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket && user) {
      // Register session room
      socket.emit('join_session', {
        userId: user.id || user._id,
        role: user.role
      });

      // Handle alerts
      socket.on('billing_alert', (data) => {
        console.log('📡 billing_alert received:', data);
        const text = data.studentName 
          ? `Invoice generated for student ${data.studentName}: PKR ${data.invoice.amount}`
          : `New invoice generated: PKR ${data.invoice.amount}`;
        addNotification(text, 'billing');
      });

      socket.on('absent_alert', (data) => {
        addNotification(`Absence Alert: ${data.message}`, 'attendance');
      });

      socket.on('attendance_scan', (data) => {
        addNotification(`${data.studentName} checked-in at ${data.time} (${data.status.toUpperCase()})`, 'attendance');
      });

      socket.on('fee_payment_alert', (data) => {
        addNotification(`Admin Alert: PKR ${data.amount} payment received from ${data.studentName} via ${data.paymentMethod}`, 'payment');
      });
    }

    return () => {
      if (socket) {
        socket.off('billing_alert');
        socket.off('absent_alert');
        socket.off('attendance_scan');
        socket.off('fee_payment_alert');
      }
    };
  }, [socket, user]);

  const addNotification = (text, type = 'info') => {
    setNotifications((prev) => [
      { id: Date.now(), text, type, read: false },
      ...prev.slice(0, 19) // Limit to 20 notifications
    ]);
  };

  const clearNotifications = () => setNotifications([]);

  return (
    <SocketContext.Provider value={{ socket, notifications, addNotification, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};
