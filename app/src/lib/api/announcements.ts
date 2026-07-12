import { API_URL, apiRequest } from "@/lib/api/client";

export type AnnouncementCategory = "general" | "relief" | "advisory" | "price";

export type Announcement = {
  id: number;
  title: string;
  body: string;
  category: AnnouncementCategory;
  likes_count: number;
  comments_count: number;
  liked: boolean;
  author?: { name: string | null; role: string | null };
  created_at: string | null;
};

export type AnnouncementComment = {
  id: number;
  parent_id?: number | null;
  body: string;
  author?: { id?: number; name: string | null; role: string | null };
  replies?: AnnouncementComment[];
  created_at: string | null;
};

export async function listAnnouncements(signal?: AbortSignal) {
  const res = await apiRequest<{ data: Announcement[] }>("/announcements", {
    signal,
  });
  return res.data;
}

export async function createAnnouncement(body: {
  title: string;
  body: string;
  category?: AnnouncementCategory;
}) {
  const res = await apiRequest<{ data: Announcement }>("/announcements", {
    method: "POST",
    body,
  });
  return res.data;
}

export function deleteAnnouncement(id: number) {
  return apiRequest<{ message: string }>(`/announcements/${id}`, {
    method: "DELETE",
  });
}

export function toggleLike(id: number) {
  return apiRequest<{ liked: boolean; likes_count: number }>(
    `/announcements/${id}/like`,
    { method: "POST" },
  );
}

export async function listComments(id: number, signal?: AbortSignal) {
  const res = await apiRequest<{ data: AnnouncementComment[] }>(
    `/announcements/${id}/comments`,
    { signal },
  );
  return res.data;
}

export async function addComment(id: number, body: string, parentId?: number) {
  const res = await apiRequest<{ data: AnnouncementComment }>(
    `/announcements/${id}/comments`,
    { method: "POST", body: { body, parent_id: parentId ?? null } },
  );
  return res.data;
}

export function deleteComment(commentId: number) {
  return apiRequest<{ message: string }>(
    `/announcement-comments/${commentId}`,
    { method: "DELETE" },
  );
}

export function announcementShareLink(id: number) {
  return `${API_URL.replace(/\/api\/?$/, "")}/a/${id}`;
}
