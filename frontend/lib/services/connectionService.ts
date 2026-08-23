import { api } from "@/lib/apiClient";
import type { ConnectionResponse, ConnectionStatus } from "@/lib/types";

export const connectionService = {
  getConnections(status?: ConnectionStatus): Promise<ConnectionResponse[]> {
    const qs = status ? `?status=${status}` : "";
    return api.get<ConnectionResponse[]>(`/api/connections${qs}`);
  },

  create(addresseeId: string): Promise<ConnectionResponse> {
    return api.post<ConnectionResponse>("/api/connections", { addresseeId });
  },

  update(id: string, status: ConnectionStatus): Promise<ConnectionResponse> {
    return api.put<ConnectionResponse>(`/api/connections/${id}`, { status });
  },

  delete(id: string): Promise<void> {
    return api.delete(`/api/connections/${id}`);
  },
};
