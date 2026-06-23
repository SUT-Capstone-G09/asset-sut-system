import { Calendar, Clock, MapPin, ReceiptText } from "lucide-react";
import { SectionHeader } from "../SectionHeader";

interface BookingDetailsProps {
  roomName: string;
  location: string;
  bookingDate: string;
  bookingTime: string;
  hourlyRate: number;
  hours: number;
  totalPrice: number;
}

export function BookingDetailsCard({
  roomName,
  location,
  bookingDate,
  bookingTime,
  hourlyRate,
  hours,
  totalPrice,
}: BookingDetailsProps) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
      <SectionHeader icon={<ReceiptText size={14} />} label="รายละเอียดการจอง" />

      {/* Room Name */}
      <div>
        <h3 className="text-lg font-bold text-brand-primary">{roomName}</h3>
        <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
          <MapPin size={13} className="text-brand-primary shrink-0" />
          {location}
        </p>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-100 shrink-0">
            <Calendar className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium">วันที่จอง</span>
            <span className="text-sm font-bold text-gray-800">
              {bookingDate}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-100 shrink-0">
            <Clock className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium">เวลา</span>
            <span className="text-sm font-bold text-gray-800">
              {bookingTime}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Details */}
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>อัตราต่อชั่วโมง</span>
          <span className="font-semibold text-gray-800">
            ฿{hourlyRate.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>จำนวนชั่วโมง</span>
          <span className="font-semibold text-gray-800">{hours} ชั่วโมง</span>
        </div>
      </div>

      <hr className="border-gray-100" />

      <div className="flex justify-between items-center">
        <span className="text-base font-bold text-brand-primary">
          รวมทั้งสิ้น
        </span>
        <span className="text-2xl font-black text-brand-primary">
          ฿{totalPrice.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </section>
  );
}
