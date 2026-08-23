"use client";

import {
  HubConnection,
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
} from "@microsoft/signalr";
import { BASE_URL, getAccessToken } from "@/lib/apiClient";

/**
 * Hub bağlantısı kurar.
 *
 * Token query string ile gönderilir çünkü WebSocket el sıkışmasında özel
 * header taşınamaz; backend Program.cs'de bu iki hub yolu için
 * `access_token` query parametresini okuyacak şekilde yapılandırılmıştır.
 */
export function createHubConnection(
  hubPath: string,
  query: Record<string, string> = {}
): HubConnection {
  const qs = new URLSearchParams(query).toString();
  const url = `${BASE_URL}${hubPath}${qs ? `?${qs}` : ""}`;

  return new HubConnectionBuilder()
    .withUrl(url, {
      accessTokenFactory: () => getAccessToken() ?? "",
      transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .configureLogging(LogLevel.Warning)
    .build();
}
