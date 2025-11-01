import { useEffect, useState } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    setPermission(Notification.permission);
  }, []);

  const requestPermission = () => {
    Notification.requestPermission().then((result) => {
      setPermission(result);
    });
  };

  const showTooCloseNotification = () => {
    if (permission !== 'granted') {
      return;
    }

    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification('SitSmart Alert', {
        body: "You're too close to the screen! Try to maintain a healthy distance.",
        icon: '/secondary_logo.svg', // Make sure this path is correct in your public folder
        vibrate: [200, 100, 200],
      });
    });
  };

  return { permission, requestPermission, showTooCloseNotification };
}