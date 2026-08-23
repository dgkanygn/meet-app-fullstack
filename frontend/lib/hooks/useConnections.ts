"use client";

import { useCallback, useEffect, useState } from "react";
import { connectionService } from "@/lib/services/connectionService";
import type { ConnectionResponse, ConnectionStatus } from "@/lib/types";

export function useConnections(status?: ConnectionStatus) {
  const [connections, setConnections] = useState<ConnectionResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const requestKey = `${status ?? "all"}:${reloadKey}`;
  const isLoading = loadedKey !== requestKey;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await connectionService.getConnections(status);
        if (cancelled) return;
        setConnections(data);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoadedKey(requestKey);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, requestKey]);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  async function sendRequest(addresseeId: string) {
    const conn = await connectionService.create(addresseeId);
    setConnections((prev) => [...prev, conn]);
    return conn;
  }

  async function respondToRequest(id: string, newStatus: ConnectionStatus) {
    const conn = await connectionService.update(id, newStatus);
    setConnections((prev) =>
      // Filtreli listede (ör. yalnızca "Accepted") artık eşleşmeyen kayıt düşer.
      status && conn.status !== status
        ? prev.filter((c) => c.id !== id)
        : prev.map((c) => (c.id === id ? conn : c))
    );
    return conn;
  }

  async function removeConnection(id: string) {
    await connectionService.delete(id);
    setConnections((prev) => prev.filter((c) => c.id !== id));
  }

  return {
    connections,
    isLoading,
    error,
    refresh,
    sendRequest,
    respondToRequest,
    removeConnection,
  };
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Bilinmeyen bir hata oluştu.";
}
