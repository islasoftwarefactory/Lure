import { AnnouncementBar } from '@/components/AnnouncementBar';
import { AccountPageComponent } from '@/components/account-page';

export default function LoggedPage() {
  return (
    <div>
      <AnnouncementBar />
      <AccountPageComponent />
    </div>
  );
}