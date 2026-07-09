"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getSocketUrl } from "@/lib/socket-url";

export interface OrderSocketPayload {
  orderId: string;
  order?: unknown;
}

interface UseOrderSocketOptions {
  onOrderCreated?: (payload: OrderSocketPayload) => void;
  onOrderUpdated?: (payload: OrderSocketPayload) => void;
  onOrderDeleted?: (payload: OrderSocketPayload) => void;
  enabled?: boolean;
}

export function useOrderSocket({
  onOrderCreated,
  onOrderUpdated,
  onOrderDeleted,
  enabled = true,
}: UseOrderSocketOptions = {}) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const onOrderCreatedRef = useRef(onOrderCreated);
  const onOrderUpdatedRef = useRef(onOrderUpdated);
  const onOrderDeletedRef = useRef(onOrderDeleted);

  useEffect(() => {
    onOrderCreatedRef.current = onOrderCreated;
    onOrderUpdatedRef.current = onOrderUpdated;
    onOrderDeletedRef.current = onOrderDeleted;
  });

  useEffect(() => {
    if (!enabled) return;

    const socket = io(getSocketUrl(), {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("order:created", (payload: OrderSocketPayload) => {
      onOrderCreatedRef.current?.(payload);
    });

    socket.on("order:updated", (payload: OrderSocketPayload) => {
      onOrderUpdatedRef.current?.(payload);
    });

    socket.on("order:deleted", (payload: OrderSocketPayload) => {
      onOrderDeletedRef.current?.(payload);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [enabled]);

  return { connected, socket: socketRef.current };
}
