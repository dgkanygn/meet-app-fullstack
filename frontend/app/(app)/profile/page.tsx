"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import ContactCard from "@/components/profile/ContactCard";
import UserInvite from "@/components/ui/UserInvite";
import { useSession } from "@/lib/context/SessionContext";
import { useConnections } from "@/lib/hooks/useConnections";

export default function ProfilePage() {
  const { profile, isLoading: profileLoading } = useSession();
  const {
    connections,
    isLoading: connectionsLoading,
    error: connectionsError,
    removeConnection,
  } = useConnections("Accepted");

  const [removeError, setRemoveError] = useState<string | null>(null);

  async function handleRemove(id: string) {
    setRemoveError(null);
    try {
      await removeConnection(id);
    } catch (err) {
      setRemoveError(
        err instanceof Error ? err.message : "Bağlantı kaldırılamadı."
      );
    }
  }

  if (profileLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <p className="text-sm text-muted">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 sm:space-y-12">
      <div className="flex flex-col items-center space-y-4 text-center">
        <Avatar name={profile?.username ?? "?"} size="2xl" />
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold break-words text-foreground">
            {profile?.fullName}
          </h1>
          <p className="mb-2 text-muted">@{profile?.username}</p>
          {profile?.bio && (
            <p className="mx-auto max-w-md text-sm break-words text-foreground/80">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-10 sm:space-y-12">
        <UserInvite />

        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Bağlantılar
          </h2>

          {connectionsLoading && (
            <p className="text-sm text-muted">Yükleniyor...</p>
          )}

          {!connectionsLoading && connectionsError && (
            <p className="text-sm text-error">{connectionsError}</p>
          )}

          {removeError && <p className="mb-3 text-sm text-error">{removeError}</p>}

          {!connectionsLoading && !connectionsError && connections.length === 0 && (
            <p className="text-sm text-muted">
              Henüz bağlantın yok. Yukarıdan kullanıcı arayarak istek gönderebilirsin.
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {connections.map((conn) => {
              // Bağlantının karşı tarafını göster.
              const isRequester = conn.requesterId === profile?.id;
              const contact = isRequester
                ? {
                    id: conn.addresseeId,
                    fullName: conn.addresseeFullName,
                    username: conn.addresseeUsername,
                  }
                : {
                    id: conn.requesterId,
                    fullName: conn.requesterFullName,
                    username: conn.requesterUsername,
                  };

              return (
                <ContactCard
                  key={conn.id}
                  contact={contact}
                  onRemove={() => handleRemove(conn.id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
