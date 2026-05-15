import { useState, useEffect, useRef } from "react";

export interface StreamEvent {
  type?: string;
  content?: string;
  message?: string;
  provider?: string;
  prompt?: string;
  promptIndex?: number;
  totalPrompts?: number;
  mentioned?: boolean;
  score?: number;
  status?: string;
  done?: boolean;
}

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

export function useScanStream(scanId: string | undefined) {
  const [logs, setLogs] = useState<StreamEvent[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    if (!scanId) return undefined;

    setLogs([]);
    setIsComplete(false);
    setError(null);
    retryCountRef.current = 0;

    let es: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    function connect() {
      if (disposed) return;

      const token = localStorage.getItem("emailToken");
      const streamUrl = token
        ? `/api/scans/${scanId}/stream?token=${encodeURIComponent(token)}`
        : `/api/scans/${scanId}/stream`;
      es = new EventSource(streamUrl);

      es.onopen = () => {
        retryCountRef.current = 0;
      };

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);

          const event: StreamEvent = {
            ...data,
            content: data.message || data.content,
            status: data.type,
          };

          if (data.type === "completed") {
            setLogs((prev) => [...prev, event]);
            setIsComplete(true);
            es?.close();
          } else if (data.type === "error") {
            setError(data.message || "Scan failed");
            setLogs((prev) => [...prev, event]);
            setIsComplete(true);
            es?.close();
          } else {
            setLogs((prev) => [...prev, event]);
          }
        } catch {
          setLogs((prev) => [...prev, { content: e.data }]);
        }
      };

      es.onerror = () => {
        es?.close();

        if (disposed) return;

        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          retryTimer = setTimeout(connect, RETRY_DELAY_MS);
        } else {
          pollForCompletion();
        }
      };
    }

    function pollForCompletion() {
      if (disposed) return;

      fetch(`/api/scans/${scanId}`)
        .then((res) => res.json())
        .then((data) => {
          if (disposed) return;
          if (data?.scan?.status === "completed") {
            setIsComplete(true);
          } else if (data?.scan?.status === "failed") {
            setError("Scan failed");
            setIsComplete(true);
          } else {
            retryTimer = setTimeout(pollForCompletion, 3000);
          }
        })
        .catch(() => {
          if (!disposed) {
            retryTimer = setTimeout(pollForCompletion, 3000);
          }
        });
    }

    connect();

    return () => {
      disposed = true;
      es?.close();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [scanId]);

  return { logs, isComplete, error };
}
