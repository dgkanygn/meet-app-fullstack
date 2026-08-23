"use client";

import { useEffect, useRef, useState } from "react";
import { X, Search, Link as LinkIcon, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import { profileService } from "@/lib/services/profileService";
import { connectionService } from "@/lib/services/connectionService";
import type { ProfileSearchResponse } from "@/lib/types";

/** Backend en az 2 karakterde sonuç döndürüyor. */
const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

const STATUS_LABELS: Record<string, string> = {
  Pending: "İstek gönderildi",
  Accepted: "Zaten bağlısınız",
  Rejected: "Reddedildi",
  Blocked: "Engellendi",
};

interface UserInviteProps {
  /** Bağlantı isteği başarıyla gönderildiğinde tetiklenir. */
  onSent?: () => void;
}

export default function UserInvite({ onSent }: UserInviteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfileSearchResponse[]>([]);
  /** Elimizdeki sonuçların ait olduğu arama terimi. */
  const [searchedTerm, setSearchedTerm] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [selected, setSelected] = useState<ProfileSearchResponse[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklayınca sonuç listesini kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce'lu arama — her tuş vuruşunda istek atmamak için.
  // Sonuçların hangi terime ait olduğunu tutuyoruz; "aranıyor" durumu
  // buradan türetiliyor, efekt içinde senkron setState yapılmıyor.
  const term = query.trim();
  const isTermSearchable = term.length >= MIN_QUERY_LENGTH;
  const isSearching = isTermSearchable && searchedTerm !== term;

  useEffect(() => {
    if (!isTermSearchable) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const data = await profileService.search(term);
        if (!cancelled) setResults(data);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearchedTerm(term);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term, isTermSearchable]);

  const visibleResults = (searchedTerm === term ? results : []).filter(
    (user) => !selected.some((s) => s.id === user.id)
  );

  function handleSelect(user: ProfileSearchResponse) {
    // Zaten bağlantısı olan kullanıcı tekrar seçilemez.
    if (user.connectionStatus) return;
    setSelected((prev) => [...prev, user]);
    setQuery("");
    setIsOpen(false);
    setSuccessMessage(null);
  }

  function handleRemove(id: string) {
    setSelected((prev) => prev.filter((u) => u.id !== id));
  }

  async function handleInvite() {
    if (selected.length === 0) return;

    setIsSending(true);
    setError(null);
    setSuccessMessage(null);

    const outcomes = await Promise.allSettled(
      selected.map((user) => connectionService.create(user.id))
    );

    const failed = outcomes.filter((o) => o.status === "rejected");
    const sentCount = outcomes.length - failed.length;

    if (sentCount > 0) {
      setSuccessMessage(`${sentCount} bağlantı isteği gönderildi.`);
      onSent?.();
    }
    if (failed.length > 0) {
      const first = failed[0] as PromiseRejectedResult;
      setError(
        first.reason instanceof Error
          ? first.reason.message
          : "Bazı istekler gönderilemedi."
      );
    }

    setSelected([]);
    setIsSending(false);
  }

  return (
    <div className="space-y-4 rounded-[8px] border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <LinkIcon size={18} className="shrink-0 text-muted" />
        <h2 className="text-sm font-semibold text-foreground">
          Kullanıcıya Bağlantı Gönder
        </h2>
      </div>

      <div className="flex w-full flex-col gap-3">
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 rounded-[6px] border border-accent/20 bg-accent/10 px-2.5 py-1.5"
              >
                <Avatar name={user.username} size="sm" />
                <span className="max-w-[140px] truncate text-xs font-medium text-accent">
                  {user.fullName}
                </span>
                <button
                  onClick={() => handleRemove(user.id)}
                  className="cursor-pointer text-accent transition-colors hover:text-accent/80"
                  aria-label={`${user.fullName} seçimini kaldır`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div
          className="flex flex-col items-start gap-3 sm:flex-row"
          ref={wrapperRef}
        >
          <div className="relative w-full flex-1">
            <div className="relative">
              <Search
                size={16}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                placeholder="İsim, kullanıcı adı veya e-posta ara..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                autoComplete="off"
                className="w-full rounded-[6px] border border-border bg-background py-2 pr-3 pl-9 text-sm text-foreground outline-none transition-colors duration-150 placeholder:text-muted focus:border-foreground"
              />
            </div>

            {isOpen && isTermSearchable && (
              <div className="absolute top-[calc(100%+4px)] right-0 left-0 z-20 max-h-60 overflow-y-auto rounded-[8px] border border-border bg-surface py-1 shadow-[var(--shadow-floating)]">
                {isSearching && (
                  <div className="p-4 text-center text-sm text-muted">
                    Aranıyor...
                  </div>
                )}

                {!isSearching && visibleResults.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted">
                    Kullanıcı bulunamadı.
                  </div>
                )}

                {!isSearching && visibleResults.length > 0 && (
                  <div className="flex flex-col px-1">
                    {visibleResults.map((user) => {
                      const statusLabel = user.connectionStatus
                        ? STATUS_LABELS[user.connectionStatus]
                        : null;

                      return (
                        <button
                          key={user.id}
                          onClick={() => handleSelect(user)}
                          disabled={!!user.connectionStatus}
                          className="flex items-center gap-3 rounded-[6px] p-2 text-left transition-colors hover:bg-border/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"
                        >
                          <Avatar name={user.username} size="md" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              {user.fullName}
                            </p>
                            <p className="truncate text-xs text-muted">
                              @{user.username}
                            </p>
                          </div>
                          {statusLabel && (
                            <span className="shrink-0 text-xs text-muted">
                              {statusLabel}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={handleInvite}
            disabled={selected.length === 0 || isSending}
            isLoading={isSending}
            className="w-full shrink-0 sm:w-auto"
          >
            Gönder
          </Button>
        </div>

        {error && <p className="text-sm text-error">{error}</p>}
        {successMessage && (
          <p className="flex items-center gap-1.5 text-sm text-foreground">
            <Check size={14} className="text-accent" />
            {successMessage}
          </p>
        )}
      </div>
    </div>
  );
}
