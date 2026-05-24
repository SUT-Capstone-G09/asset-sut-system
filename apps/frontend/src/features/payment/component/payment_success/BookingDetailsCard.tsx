import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  ImageIcon,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
} from "lucide-react";

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
    <Card className="shadow-sm border-slate-100 overflow-hidden pt-0">
      <CardHeader className="border-b border-orange-600 pb-6 pt-6 bg-orange-500">
        <div className="flex items-center gap-3 ">
          <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
          <CardTitle className="text-white">รายละเอียดการจอง</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Room Name */}
        <div className="pb-4 border-b border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">
            ห้องที่จองไว้
          </p>
          <p className="text-lg font-bold text-slate-800">{roomName}</p>
        </div>

        {/* Location */}
        <div className="flex gap-3">
          <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">สถานที่</p>
            <p className="text-md text-slate-700">{location}</p>
          </div>
        </div>

        {/* Date */}
        <div className="flex gap-3">
          <Calendar className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">วันที่จอง</p>
            <p className="text-md text-slate-700">{bookingDate}</p>
          </div>
        </div>

        {/* Time */}
        <div className="flex gap-3">
          <Clock className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">เวลา</p>
            <p className="text-md text-slate-700">{bookingTime}</p>
          </div>
        </div>

        {/* Pricing Details */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">อัตราต่อชั่วโมง</span>
            <span className="font-medium text-slate-700">
              ฿{hourlyRate.toLocaleString("th-TH")}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">จำนวนชั่วโมง</span>
            <span className="font-medium text-slate-700">{hours} ชั่วโมง</span>
          </div>
          <div className="flex justify-between items-center pt-7 border-t border-slate-100">
            <span className="text-lg font-bold text-slate-800">
              รวมทั้งสิ้น
            </span>
            <span className="text-2xl font-bold text-orange-500">
              ฿{totalPrice.toLocaleString("th-TH")}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        {/* <div className="pt-4">
          <Badge className="w-full justify-center bg-orange-100 text-orange-700 hover:bg-orange-100 py-2 text-sm">
            <Clock className="w-4 h-4 mr-2" />
            รอการตรวจสอบการชำระเงินจากเจ้าหน้าที่
          </Badge>
        </div> */}
      </CardContent>
    </Card>
  );
}
