import { writable, get } from 'svelte/store';

export const notificationsEnabled = writable<boolean>(
  typeof localStorage !== 'undefined' ? localStorage.getItem('gym_notif') === 'true' : false
);

export const reminderHour = writable<number>(
  typeof localStorage !== 'undefined' ? parseInt(localStorage.getItem('gym_notif_hour') || '18') : 18
);

export async function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function toggleNotifications(enabled: boolean) {
  notificationsEnabled.set(enabled);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('gym_notif', String(enabled));
  }
}

export function setReminderHour(hour: number) {
  reminderHour.set(hour);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('gym_notif_hour', String(hour));
  }
}

let checkInterval: ReturnType<typeof setInterval> | null = null;

export function startReminderCheck(getTrainedToday: () => boolean) {
  if (checkInterval) return;
  checkInterval = setInterval(() => {
    const enabled = get(notificationsEnabled);
    if (!enabled) return;
    if (Notification.permission !== 'granted') return;

    const now = new Date();
    const hour = get(reminderHour);
    if (now.getHours() < hour) return;

    // Already sent today?
    const sentDate = localStorage.getItem('gym_notif_sent');
    const today = now.toISOString().split('T')[0];
    if (sentDate === today) return;

    // Check if trained today
    if (getTrainedToday()) return;

    // Send notification
    new Notification('GYM Tracker', {
      body: 'No has entrenado hoy. Tu cuerpo te lo agradecera!',
      icon: '/icon-192.png',
      tag: 'gym-reminder'
    });
    localStorage.setItem('gym_notif_sent', today);
  }, 30 * 60 * 1000); // Every 30 minutes
}

export function stopReminderCheck() {
  if (checkInterval) { clearInterval(checkInterval); checkInterval = null; }
}
