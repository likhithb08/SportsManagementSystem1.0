import React, { useEffect, useState } from 'react';

const Notifications = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await fetch(`http://localhost:5000/api/notifications/${userId}`);
      const data = await res.json();
      setNotifications(data);
      setNotificationCount(data.filter(notif => !notif.read).length); // Assuming unread notifications are not marked as 'read'
    };
    fetchNotifications();
  }, [userId]);

  return (
    <div className="relative">
      <div className="p-1 bg-white shadow rounded-lg flex items-center">
        <h2 className="font-bold text-lg mb-2">N</h2>
        {notificationCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notificationCount}
          </span>
        )}
      </div>

      <div className="mt-4">
        {notifications.length === 0 ? (
          <p>No Notif</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((notif) => (
              <li key={notif._id} className="text-sm text-gray-700">
                {notif.message} <span className="text-xs text-gray-400">({new Date(notif.timestamp).toLocaleString()})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
