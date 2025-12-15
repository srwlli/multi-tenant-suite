/**
 * useWebSocket Hook
 * WebSocket real-time data with auto-reconnect
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  WebSocketConfig,
  UseWebSocketOptions,
  UseWebSocketResult,
  DataStatus,
} from "./types";

const DEFAULT_RECONNECT_DELAY = 1000; // 1 second
const DEFAULT_MAX_RECONNECT_DELAY = 30000; // 30 seconds
const MAX_MESSAGE_BUFFER = 100;

/**
 * Hook for WebSocket real-time data streams
 * Supports auto-reconnect with exponential backoff
 */
export function useWebSocket<T = unknown>(
  config: WebSocketConfig,
  options: UseWebSocketOptions<T> = {}
): UseWebSocketResult<T> {
  const {
    connectOnMount = true,
    transform,
    onMessage,
    onOpen,
    onClose,
    onError,
  } = options;

  const {
    url,
    protocols,
    reconnect = true,
    maxReconnectAttempts = 0,
    reconnectDelay = DEFAULT_RECONNECT_DELAY,
    maxReconnectDelay = DEFAULT_MAX_RECONNECT_DELAY,
    heartbeatInterval = 0,
  } = config;

  // State
  const [lastMessage, setLastMessage] = useState<T | undefined>();
  const [messages, setMessages] = useState<T[]>([]);
  const [status, setStatus] = useState<DataStatus>("idle");

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Clear reconnect timeout
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Clear heartbeat interval
  const clearHeartbeatInterval = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Calculate reconnect delay with exponential backoff
  const getReconnectDelay = useCallback(() => {
    const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
    return Math.min(delay, maxReconnectDelay);
  }, [reconnectDelay, maxReconnectDelay]);

  // Connect function
  const connect = useCallback(() => {
    // Don't connect if already connected or connecting
    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    // Clear any pending reconnect
    clearReconnectTimeout();

    setStatus("connecting");

    try {
      wsRef.current = new WebSocket(url, protocols);

      wsRef.current.onopen = (event) => {
        if (!mountedRef.current) return;

        setStatus("connected");
        reconnectAttemptsRef.current = 0;

        // Set up heartbeat
        if (heartbeatInterval > 0) {
          heartbeatIntervalRef.current = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: "ping" }));
            }
          }, heartbeatInterval);
        }

        onOpen?.(event);
      };

      wsRef.current.onmessage = (event) => {
        if (!mountedRef.current) return;

        try {
          const rawData = JSON.parse(event.data);
          const transformedData = transform
            ? transform(rawData)
            : (rawData as T);

          setLastMessage(transformedData);
          setMessages((prev) =>
            [transformedData, ...prev].slice(0, MAX_MESSAGE_BUFFER)
          );

          onMessage?.(transformedData);
        } catch {
          // If not JSON, use raw data
          const data = event.data as T;
          setLastMessage(data);
          setMessages((prev) => [data, ...prev].slice(0, MAX_MESSAGE_BUFFER));
          onMessage?.(data);
        }
      };

      wsRef.current.onclose = (event) => {
        if (!mountedRef.current) return;

        setStatus("disconnected");
        clearHeartbeatInterval();

        onClose?.(event);

        // Attempt reconnect if enabled
        if (reconnect && !event.wasClean) {
          const shouldReconnect =
            maxReconnectAttempts === 0 ||
            reconnectAttemptsRef.current < maxReconnectAttempts;

          if (shouldReconnect) {
            const delay = getReconnectDelay();
            reconnectAttemptsRef.current++;

            reconnectTimeoutRef.current = setTimeout(() => {
              if (mountedRef.current) {
                connect();
              }
            }, delay);
          }
        }
      };

      wsRef.current.onerror = (event) => {
        if (!mountedRef.current) return;
        setStatus("error");
        onError?.(event);
      };
    } catch {
      setStatus("error");
    }
  }, [
    url,
    protocols,
    reconnect,
    maxReconnectAttempts,
    heartbeatInterval,
    transform,
    onOpen,
    onMessage,
    onClose,
    onError,
    clearReconnectTimeout,
    clearHeartbeatInterval,
    getReconnectDelay,
  ]);

  // Disconnect function
  const disconnect = useCallback(() => {
    clearReconnectTimeout();
    clearHeartbeatInterval();

    if (wsRef.current) {
      wsRef.current.close(1000, "Client disconnect");
      wsRef.current = null;
    }

    setStatus("disconnected");
  }, [clearReconnectTimeout, clearHeartbeatInterval]);

  // Send function
  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      if (typeof data === "string") {
        wsRef.current.send(data);
      } else {
        wsRef.current.send(JSON.stringify(data));
      }
    }
  }, []);

  // Send JSON function
  const sendJson = useCallback(
    (data: unknown) => {
      send(JSON.stringify(data));
    },
    [send]
  );

  // Connect on mount
  useEffect(() => {
    if (connectOnMount) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [connectOnMount, connect, disconnect]);

  return {
    lastMessage,
    messages,
    status,
    isConnected: status === "connected",
    send,
    sendJson,
    connect,
    disconnect,
  };
}
