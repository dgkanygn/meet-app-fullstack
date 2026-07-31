import Avatar from "@/components/ui/Avatar";
import ContactCard from "@/components/profile/ContactCard";
import UserInvite from "@/components/ui/UserInvite";

// Mock user data
const user = {
  fullname: "Doğukan",
  username: "dogukan",
  description: "Yazılım Geliştirici",
};

// Mock contacts
const contacts = [
  { id: "1", fullname: "Ahmet Yılmaz", username: "ahmetyilmaz" },
  { id: "2", fullname: "Ayşe Demir", username: "aysedemir" },
  { id: "3", fullname: "Mehmet Kaya", username: "mehmetkaya" },
  { id: "4", fullname: "Elif Yücel", username: "elifyucel" },
  { id: "5", fullname: "Can Özkan", username: "canozkan" },
];

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col items-center text-center space-y-4">
        <Avatar name={user.username} size="2xl" />
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{user.fullname}</h1>
          <p className="text-muted mb-2">@{user.username}</p>
          <p className="text-sm text-foreground/80 max-w-md mx-auto">{user.description}</p>
        </div>
      </div>
      
      <div className="space-y-12">
        <UserInvite />
        
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Kişiler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
