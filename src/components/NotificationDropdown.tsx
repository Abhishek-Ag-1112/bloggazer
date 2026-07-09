import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Notification } from '../types';
import { Bell, MessageSquare, Check, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const NotificationDropdown: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!user) return;

    // Set up a real-time listener for notifications
    const q = query(
      collection(db, 'notifications'),
      where('recipient_id', '==', user.id),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          created_at: data.created_at ? data.created_at.toDate().toISOString() : new Date().toISOString()
        };
      }) as Notification[];

      // Sort notifications in-memory by created_at desc to avoid composite index requirements
      const sorted = fetched.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setNotifications(sorted.slice(0, 20)); // Limit to most recent 20
    }, (error) => {
      console.error("Notifications listener error: ", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleNotificationClick = async (notif: Notification) => {
    setIsOpen(false);
    try {
      if (!notif.read) {
        await updateDoc(doc(db, 'notifications', notif.id), {
          read: true
        });
      }
      navigate(`/blog/${notif.blog_slug}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;

    const batch = writeBatch(db);
    unread.forEach(n => {
      batch.update(doc(db, 'notifications', n.id), { read: true });
    });

    try {
      await batch.commit();
      toast.success("All notifications marked as read.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update notifications.");
    }
  };

  return (
    <div className="relative select-none" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer text-gray-700 dark:text-gray-300"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-800 backdrop-blur-lg bg-white/95 dark:bg-gray-950/95 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
            <span className="font-bold text-gray-900 dark:text-white">Notifications</span>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="flex items-center space-x-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                title="Mark all as read"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-150 dark:divide-gray-850">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.map(notif => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full flex items-start space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/40 text-left transition-colors cursor-pointer
                    ${!notif.read ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''}`}
                >
                  <div className={`p-2 rounded-lg mt-0.5
                    ${!notif.read 
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm text-gray-800 dark:text-gray-200 line-clamp-2
                      ${!notif.read ? 'font-semibold' : ''}`}>
                      <strong className="text-gray-900 dark:text-white">{notif.sender_name}</strong> mentioned you in a comment.
                    </p>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
                      {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {!notif.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
