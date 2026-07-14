import * as Notifications from "expo-notifications";

function reminderId(id: number) {
  return `claim-reminder-${id}`;
}

export async function ensureNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleClaimReminder(opts: {
  id: number;
  title: string;
  body: string;
  date: string;
}) {
  try {
    const granted = await ensureNotificationPermission();
    if (!granted) return;
    const when = new Date(`${opts.date}T09:00:00`);
    if (when.getTime() <= Date.now()) return;
    await Notifications.scheduleNotificationAsync({
      identifier: reminderId(opts.id),
      content: { title: opts.title, body: opts.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
      },
    });
  } catch {
    // Notifications may be unavailable (e.g. limited in Expo Go); ignore.
  }
}

export async function cancelClaimReminder(id: number) {
  try {
    await Notifications.cancelScheduledNotificationAsync(reminderId(id));
  } catch {
    // ignore
  }
}
