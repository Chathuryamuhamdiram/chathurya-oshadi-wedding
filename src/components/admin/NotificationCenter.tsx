"use client";

import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell } from "lucide-react";
import { 
  getUnreadNotificationsAction, 
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction 
} from "@/app/admin/actions/notifications";

// Hardcoded user ID for now since auth isn't fully implemented
const MOCK_USER_ID = "99d3e2e3-4ce5-4388-8f47-c42ccf263d9d";

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Optional: Set up a polling interval here
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    // In a real app, pass the actual logged-in user's ID
    const { count, notifications: notifs } = await getUnreadNotificationsAction(MOCK_USER_ID);
    setUnreadCount(count);
    setNotifications(notifs);
  };

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsReadAction(id);
    fetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsReadAction(MOCK_USER_ID);
    fetchNotifications();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className="relative p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-colors">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
        )}
      </PopoverTrigger>
      
      <PopoverContent align="end" className="w-80 bg-[#0f1423] border border-white/10 p-0 shadow-2xl rounded-2xl overflow-hidden mt-2">
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#141b2d]">
          <h3 className="font-serif text-white tracking-widest text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-[10px] uppercase tracking-widest text-emerald-400 hover:text-emerald-300 font-sans transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-white/30 text-sm font-sans">
              No new notifications
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-white/5">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`p-4 flex gap-3 transition-colors ${!notif.isRead ? 'bg-white/[0.02]' : ''}`}
                >
                  <div className="mt-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-white">{notif.title}</p>
                    <p className="text-xs text-white/50 leading-relaxed">{notif.message}</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <button 
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-white/20 hover:text-white transition-colors h-fit p-1"
                      title="Mark as read"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
