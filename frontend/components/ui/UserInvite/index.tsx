"use client";

import { useState, useRef, useEffect } from "react";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import { X, Search, Link as LinkIcon } from "lucide-react";

// Mock API responses for search
const MOCK_USERS = [
  { id: "1", fullname: "Ahmet Yılmaz", username: "ahmetyilmaz", email: "ahmet@example.com" },
  { id: "2", fullname: "Ayşe Demir", username: "aysedemir", email: "ayse@example.com" },
  { id: "3", fullname: "Mehmet Kaya", username: "mehmetkaya", email: "mehmet@example.com" },
  { id: "4", fullname: "Elif Yücel", username: "elifyucel", email: "elif@example.com" },
  { id: "5", fullname: "Can Özkan", username: "canozkan", email: "can@example.com" },
];

export default function UserInvite() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<typeof MOCK_USERS>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredUsers = MOCK_USERS.filter(
    (user) =>
      (user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.fullname.toLowerCase().includes(query.toLowerCase())) &&
      !selectedUsers.find((u) => u.id === user.id)
  );

  const handleSelect = (user: typeof MOCK_USERS[0]) => {
    setSelectedUsers([...selectedUsers, user]);
    setQuery("");
    setIsOpen(false);
  };

  const handleRemove = (id: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== id));
  };

  const handleInvite = async () => {
    if (selectedUsers.length === 0) return;
    setIsSending(true);
    // Simulate API request
    await new Promise((r) => setTimeout(r, 1000));
    setIsSending(false);
    setSelectedUsers([]);
    alert("Bağlantı daveti başarıyla gönderildi!");
  };

  return (
    <div className="bg-surface border border-border rounded-[8px] p-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <LinkIcon size={18} className="text-muted" />
        <h2 className="text-sm font-semibold text-foreground">Kullanıcıya Bağlantı Gönder</h2>
      </div>

      <div className="w-full flex flex-col gap-3">
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 bg-accent/10 border border-accent/20 px-2.5 py-1.5 rounded-[6px]"
              >
                <Avatar name={user.username} size="sm" />
                <span className="text-xs font-medium text-accent">{user.fullname}</span>
                <button
                  onClick={() => handleRemove(user.id)}
                  className="text-accent hover:text-accent/80 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start gap-3" ref={wrapperRef}>
          <div className="relative flex-1 w-full">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="İsim, kullanıcı adı veya e-posta ara..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-[6px] bg-background text-foreground placeholder:text-muted border border-border focus:border-foreground transition-colors duration-150 outline-none"
              />
            </div>

            {isOpen && query.length > 0 && (
              <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-surface border border-border rounded-[8px] shadow-[var(--shadow-floating)] z-20 max-h-60 overflow-y-auto py-1">
                {filteredUsers.length > 0 ? (
                  <div className="flex flex-col px-1">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSelect(user)}
                        className="flex items-center gap-3 p-2 hover:bg-border/50 rounded-[6px] transition-colors cursor-pointer text-left"
                      >
                        <Avatar name={user.username} size="md" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.fullname}</p>
                          <p className="text-xs text-muted">@{user.username}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted">
                    Kullanıcı bulunamadı.
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={handleInvite}
            disabled={selectedUsers.length === 0 || isSending}
            isLoading={isSending}
            className="w-full sm:w-auto shrink-0"
          >
            Gönder
          </Button>
        </div>
      </div>
    </div>
  );
}
