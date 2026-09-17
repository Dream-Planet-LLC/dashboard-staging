"use client";

import authenticatedAxios from "@/lib/authenticatedApi";
import {
  NotificationApiResponse,
  NotificationRecipient,
  NotificationRecipientsPagination,
  SendPushNotificationPayload,
  SendPushNotificationResult,
} from "@/types/notifications";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

const RECIPIENTS_PER_PAGE = 20;

interface LoadRecipientsOptions {
  page?: number;
  searchString?: string;
  append?: boolean;
}

const apiErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) return fallback;

  const status = error.response?.status;
  const message = (error.response?.data as { message?: string } | undefined)
    ?.message;

  if (status === 400 && message) return message;
  if (status === 401) return "Your session has expired.";
  if (status && status >= 500) return "The notification service is unavailable. Please try again.";
  if (!error.response) return "Unable to reach the notification service. Please try again.";

  return message || fallback;
};

const usePushNotifications = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [recipients, setRecipients] = useState<NotificationRecipient[]>([]);
  const [pagination, setPagination] =
    useState<NotificationRecipientsPagination | null>(null);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [recipientsLoadingMore, setRecipientsLoadingMore] = useState(false);
  const [recipientsError, setRecipientsError] = useState<string | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const requestIdRef = useRef(0);
  const requestControllerRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      requestControllerRef.current?.abort();
    },
    [],
  );

  const loadRecipients = useCallback(
    async ({
      page = 1,
      searchString = "",
      append = false,
    }: LoadRecipientsOptions = {}) => {
      requestControllerRef.current?.abort();
      const controller = new AbortController();
      requestControllerRef.current = controller;
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      if (append) setRecipientsLoadingMore(true);
      else setRecipientsLoading(true);
      setRecipientsError(null);

      try {
        if (!baseUrl) throw new Error("Notification API is not configured");

        const response = await authenticatedAxios.post<
          NotificationApiResponse<NotificationRecipientsPagination>
        >(
          `${baseUrl}/admin/notifications/recipients`,
          {
            page,
            perPage: RECIPIENTS_PER_PAGE,
            searchString: searchString.trim(),
          },
          { signal: controller.signal },
        );

        if (requestId !== requestIdRef.current) return;

        const nextPage = response.data.response;
        setPagination(nextPage);
        setRecipients((current) => {
          if (!append) return nextPage.docs;

          const recipientsById = new Map(
            current.map((recipient) => [recipient.id, recipient]),
          );
          nextPage.docs.forEach((recipient) => {
            recipientsById.set(recipient.id, recipient);
          });
          return Array.from(recipientsById.values());
        });
      } catch (error) {
        if (axios.isCancel(error) || requestId !== requestIdRef.current) return;

        if (!append) {
          setRecipients([]);
          setPagination(null);
        }

        if (axios.isAxiosError(error) && error.response?.status === 401) return;
        setRecipientsError(
          error instanceof Error && !axios.isAxiosError(error)
            ? error.message
            : apiErrorMessage(error, "Unable to load notification recipients."),
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setRecipientsLoading(false);
          setRecipientsLoadingMore(false);
        }
      }
    },
    [baseUrl],
  );

  const sendNotification = useCallback(
    async (payload: SendPushNotificationPayload) => {
      setSendLoading(true);

      try {
        if (!baseUrl) throw new Error("Notification API is not configured");

        const response = await authenticatedAxios.post<
          NotificationApiResponse<SendPushNotificationResult>
        >(`${baseUrl}/admin/notifications/send`, payload);

        return response.data.response;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          throw error;
        }

        if (error instanceof Error && !axios.isAxiosError(error)) throw error;
        throw new Error(
          apiErrorMessage(error, "Unable to send the notification. Please try again."),
        );
      } finally {
        setSendLoading(false);
      }
    },
    [baseUrl],
  );

  return {
    loadRecipients,
    pagination,
    recipients,
    recipientsError,
    recipientsLoading,
    recipientsLoadingMore,
    sendLoading,
    sendNotification,
  };
};

export default usePushNotifications;
