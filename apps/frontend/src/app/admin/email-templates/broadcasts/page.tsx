import BroadcastList from "@/features/email-template/components/admin/BroadcastList";

export default function BroadcastsPage() {
  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">ประวัติการส่ง</h1>
        <p className="mt-0.5 text-sm text-gray-400">
          รายการ broadcast ที่ส่งไปแล้ว พร้อมสถานะการส่งของแต่ละครั้ง
        </p>
      </div>
      <BroadcastList />
    </div>
  );
}
