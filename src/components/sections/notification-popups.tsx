"use client";

import { useState, useEffect } from "react";
import { X, Bell } from "lucide-react";

// Type for notifications
interface Notification {
  id: number;
  title: string;
  message: string;
  dotColor: string;
}

// Initial data for notifications
const notificationsData: Notification[] = [
  { id: 1, title: "Shop Online", message: "+5% off no pagamento via PIX", dotColor: "bg-[#222222]" },
  { id: 2, title: "Frete Grátis", message: "Em compras acima de R$1000", dotColor: "bg-[#222222]" },
];

// Single Notification Card Component
const NotificationCard = ({ notification, onClose }: { notification: Notification; onClose: () => void; }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Animation duration
  };

  return (
    <div
      className={`transition-all duration-300 ease-out overflow-hidden ${isClosing ? "max-h-0 opacity-0 !mb-0" : "max-h-[60px] opacity-100 mb-[6px] md:mb-2"}`}
      aria-hidden={isClosing}
    >
      <div className="group backdrop-blur-xl rounded-[14px] relative w-fit bg-white/50">
        <div className="flex w-fit min-h-[42px] h-[42px] md:min-h-[47px] md:h-[47px] pl-[10px] pr-[12px] rounded-[14px] gap-[6px] items-center">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${notification.dotColor}`} />
          </div>
          <div className="flex flex-col gap-[5px]">
            <p className="text-text-secondary text-[0.5625rem] inline-flex items-center h-[9px] tracking-[-0.02em]">
              {notification.title}
            </p>
            <p className="text-text-secondary text-xs h-[9px] inline-flex items-center tracking-[-0.02em] font-normal">
              {notification.message}
            </p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="hidden absolute right-0 top-0 w-[18px] h-[18px] ease-in rounded-full bg-white translate-x-1/3 -translate-y-1/3 md:flex items-center justify-center text-black transition-opacity opacity-0 group-hover:opacity-100 invisible group-hover:visible font-thin"
          aria-label="Close notification"
        >
          <X size={8} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

// Main Notification Popups Section Component
const NotificationPopups = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    setNotifications(notificationsData);
  }, []);

  const closeNotification = (id: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((n) => n.id !== id)
    );
  };
  
  const remainingNotificationsCount = notifications.length;

  if (remainingNotificationsCount === 0) {
    return null;
  }

  return (
    <div className="fixed top-24 left-[5px] md:left-[30px] w-fit flex flex-col items-start font-suisse z-40">
      <div className={`transition-all duration-300 ease-out grid ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onClose={() => closeNotification(notification.id)}
            />
          ))}
        </div>
      </div>
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative w-fit text-[#222222] text-xs py-[5px] md:py-1 pl-1 pr-[6px] md:pr-2 flex justify-center items-center gap-1.5 cursor-pointer rounded-lg bg-white h-[28px] md:max-w-fit md:max-h-[21.5px] -translate-y-2 md:-translate-y-1.5"
      >
        <span className="inline-flex justify-center items-center h-[18px] w-[18px] md:h-[15px] md:w-[15px] bg-[#DBDBDB] rounded-full">
          <Bell className="w-[11px] h-[11px] text-[#222222]/80" strokeWidth={2} />
        </span>
        <span className="h-4 text-[10px] tracking-[-0.02em] leading-[1.1] w-fit inline-flex justify-center items-center font-medium text-[#2A2826]">
          {remainingNotificationsCount} Notificaç{remainingNotificationsCount > 1 ? 'ões' : 'ão'}
        </span>
      </button>
    </div>
  );
};

export default NotificationPopups;