export type NotificationUserType = "fan" | "creator" | "investor";

export interface NotificationRecipient {
  id: number;
  full_name: string | null;
  username: string | null;
  image: string | null;
  user_type: NotificationUserType;
}

export interface NotificationRecipientsPagination {
  docs: NotificationRecipient[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  offset: number;
  prevPage: number | null;
  nextPage: number | null;
}

export interface NotificationMediaPayload {
  url: string;
  mime_type: string;
  file_name: string;
  size_bytes?: number;
  width?: number;
  height?: number;
}

export interface NotificationAudience {
  all_creators: boolean;
  all_fans: boolean;
  user_ids: number[];
}

export interface SendPushNotificationPayload {
  title: string;
  message: string;
  media: NotificationMediaPayload[];
  audience: NotificationAudience;
}

export interface SendPushNotificationResult {
  recipient_count: number;
  saved_notification_count: number;
  push_token_count: number;
  queued_push_batches: number;
}

export interface NotificationMediaUpload {
  name: string;
  mimeType: string;
  preview: string;
  progress: number;
  size: number;
  status: "uploading" | "complete" | "error";
  url?: string;
  width?: number;
  height?: number;
}

export interface NotificationApiResponse<T> {
  error: boolean;
  message: string;
  response: T;
}
