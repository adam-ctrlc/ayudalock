import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "@/lib/api/notifications";
import { qk } from "@/lib/queries/keys";

export function useNotifications() {
  return useQuery({
    queryKey: qk.notifications,
    queryFn: ({ signal }) => listNotifications(signal),
  });
}

export function useUnreadCount() {
  const query = useNotifications();
  return (query.data ?? []).filter((n) => !n.read).length;
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onMutate: async (id: number) => {
      await qc.cancelQueries({ queryKey: qk.notifications });
      const prev = qc.getQueryData<AppNotification[]>(qk.notifications);
      qc.setQueryData<AppNotification[]>(qk.notifications, (old) =>
        old?.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.notifications, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.notifications }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: qk.notifications });
      const prev = qc.getQueryData<AppNotification[]>(qk.notifications);
      qc.setQueryData<AppNotification[]>(qk.notifications, (old) =>
        old?.map((n) => ({ ...n, read: true })),
      );
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.notifications, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.notifications }),
  });
}
