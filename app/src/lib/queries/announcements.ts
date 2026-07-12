import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addComment,
  createAnnouncement,
  deleteAnnouncement,
  listAnnouncements,
  listComments,
  toggleLike,
  type Announcement,
} from "@/lib/api/announcements";

const key = ["announcements"] as const;
const commentsKey = (id: number) => ["announcements", id, "comments"] as const;

export function useAnnouncements() {
  return useQuery({
    queryKey: key,
    queryFn: ({ signal }) => listAnnouncements(signal),
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAnnouncement(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => toggleLike(id),
    onMutate: async (id: number) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Announcement[]>(key);
      qc.setQueryData<Announcement[]>(key, (old) =>
        old?.map((a) =>
          a.id === id
            ? {
                ...a,
                liked: !a.liked,
                likes_count: (a.likes_count ?? 0) + (a.liked ? -1 : 1),
              }
            : a,
        ),
      );
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSuccess: (data, id) => {
      qc.setQueryData<Announcement[]>(key, (old) =>
        old?.map((a) =>
          a.id === id
            ? { ...a, liked: data.liked, likes_count: data.likes_count }
            : a,
        ),
      );
    },
  });
}

export function useComments(announcementId: number, enabled: boolean) {
  return useQuery({
    queryKey: commentsKey(announcementId),
    queryFn: ({ signal }) => listComments(announcementId, signal),
    enabled,
  });
}

export function useAddComment(announcementId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { body: string; parentId?: number }) =>
      addComment(announcementId, args.body, args.parentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentsKey(announcementId) });
      qc.invalidateQueries({ queryKey: key });
    },
  });
}
