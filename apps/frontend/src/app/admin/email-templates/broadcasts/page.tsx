import BroadcastList from "@/features/email-template/components/admin/BroadcastList";
import EmailPageHeader from "@/features/email-template/components/admin/EmailPageHeader";

export default function BroadcastsPage() {
  return (
    <div className="space-y-6 p-8">
      <EmailPageHeader

        title="ประวัติการส่ง"
        description="รายการ broadcast ที่ส่งไปแล้ว พร้อมสถานะการส่งของแต่ละครั้ง"
      />
      <BroadcastList />
    </div>
  );
}
