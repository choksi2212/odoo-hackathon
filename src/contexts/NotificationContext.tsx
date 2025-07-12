
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'answer' | 'comment' | 'mention';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Answer',
      message: 'Someone answered your question about React hooks',
      time: '2 min ago',
      read: false,
      type: 'answer',
    },
    {
      id: '2',
      title: 'Upvote Received',
      message: 'Your answer received an upvote',
      time: '1 hour ago',
      read: false,
      type: 'comment',
    },
    {
      id: '3',
      title: 'Question Mentioned',
      message: 'You were mentioned in a question',
      time: '3 hours ago',
      read: true,
      type: 'mention',
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'time' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      time: 'Just now',
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const randomTypes: Array<'answer' | 'comment' | 'mention'> = ['answer', 'comment', 'mention'];
      const randomType = randomTypes[Math.floor(Math.random() * randomTypes.length)];
      
      const messages = {
        answer: 'Someone answered your question',
        comment: 'New comment on your answer',
        mention: 'You were mentioned in a discussion'
      };

      // Randomly add a notification (10% chance every 30 seconds)
      if (Math.random() < 0.1) {
        addNotification({
          title: randomType === 'answer' ? 'New Answer' : randomType === 'comment' ? 'New Comment' : 'New Mention',
          message: messages[randomType],
          type: randomType,
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
