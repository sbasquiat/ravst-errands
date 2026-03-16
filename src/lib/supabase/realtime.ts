"use client";

import { useEffect, useRef } from "react";
import { createClient } from "./client";
import type { RealtimeChannel } from "@supabase/supabase-js";

type SubscriptionEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

interface UseRealtimeOptions {
  table: string;
  schema?: string;
  event?: SubscriptionEvent;
  filter?: string;
  onInsert?: (payload: Record<string, unknown>) => void;
  onUpdate?: (payload: Record<string, unknown>) => void;
  onDelete?: (payload: Record<string, unknown>) => void;
  onChange?: (payload: Record<string, unknown>, eventType: string) => void;
  enabled?: boolean;
}

/**
 * Generic hook to subscribe to Supabase Realtime changes on a table
 */
export function useRealtimeSubscription({
  table,
  schema = "public",
  event = "*",
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
  enabled = true,
}: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();
    const channelName = `${table}-${filter ?? "all"}-${Date.now()}`;

    const channelConfig: {
      event: SubscriptionEvent;
      schema: string;
      table: string;
      filter?: string;
    } = {
      event,
      schema,
      table,
    };

    if (filter) {
      channelConfig.filter = filter;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes" as "system",
        channelConfig as unknown as { event: string },
        (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => {
          const data = payload.new || payload.old;

          if (payload.eventType === "INSERT" && onInsert) {
            onInsert(data);
          } else if (payload.eventType === "UPDATE" && onUpdate) {
            onUpdate(data);
          } else if (payload.eventType === "DELETE" && onDelete) {
            onDelete(data);
          }

          if (onChange) {
            onChange(data, payload.eventType);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filter, enabled]);
}

/**
 * Subscribe to real-time chat messages for an errand
 */
export function useRealtimeChat(
  errandId: string,
  onNewMessage: (message: Record<string, unknown>) => void
) {
  useRealtimeSubscription({
    table: "chat_messages",
    event: "INSERT",
    filter: `errand_id=eq.${errandId}`,
    onInsert: onNewMessage,
  });
}

/**
 * Subscribe to real-time errand status changes
 */
export function useRealtimeErrandStatus(
  errandId: string,
  onStatusChange: (errand: Record<string, unknown>) => void
) {
  useRealtimeSubscription({
    table: "errands",
    event: "UPDATE",
    filter: `id=eq.${errandId}`,
    onUpdate: onStatusChange,
  });
}

/**
 * Subscribe to all errand changes for a customer (dashboard)
 */
export function useRealtimeCustomerErrands(
  customerId: string | undefined,
  onErrandChange: (errand: Record<string, unknown>, eventType: string) => void
) {
  useRealtimeSubscription({
    table: "errands",
    filter: customerId ? `customer_id=eq.${customerId}` : undefined,
    onChange: onErrandChange,
    enabled: !!customerId,
  });
}

/**
 * Subscribe to available jobs for runners (pending errands)
 */
export function useRealtimeAvailableJobs(
  onJobChange: (errand: Record<string, unknown>, eventType: string) => void
) {
  useRealtimeSubscription({
    table: "errands",
    onChange: onJobChange,
  });
}

/**
 * Subscribe to errand timeline updates
 */
export function useRealtimeTimeline(
  errandId: string,
  onTimelineUpdate: (entry: Record<string, unknown>) => void
) {
  useRealtimeSubscription({
    table: "errand_timeline",
    event: "INSERT",
    filter: `errand_id=eq.${errandId}`,
    onInsert: onTimelineUpdate,
  });
}
