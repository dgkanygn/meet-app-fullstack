import NotificationsDropdown from "./components/NotificationsDropdown";
import UserDropdown from "./components/UserDropdown";

export default function Topbar() {
  return (
    <header className="h-14 flex items-center px-6 border-b border-border bg-surface shrink-0">
      <div className="ml-auto flex items-center gap-4">
        <NotificationsDropdown />
        <UserDropdown />
      </div>
    </header>
  );
}
