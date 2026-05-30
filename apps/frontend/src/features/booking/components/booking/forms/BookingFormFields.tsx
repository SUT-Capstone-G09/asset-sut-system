"use client";

import { useState, useRef, useEffect } from "react";
import {
  useFormContext,
  Controller,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  User,
  Clock,
  Briefcase,
  Plus,
  Trash2,
  Banknote,
  Search,
  X,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookingFormValues } from "../../../schemas/booking-schema";
import { cn } from "@/lib/utils";
import ImageUpload from "@/features/areas/components/admin/forms/ImageUpload";
import { mockExpenses } from "../../../data/expenses";
import { mockRooms } from "../../../data/rooms";

const getHoursFromTimeSlot = (timeSlot: string): number => {
  try {
    const match = timeSlot.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
    if (match) {
      const startHour = parseInt(match[1], 10);
      const startMin = parseInt(match[2], 10);
      const endHour = parseInt(match[3], 10);
      const endMin = parseInt(match[4], 10);
      const diffMin = endHour * 60 + endMin - (startHour * 60 + startMin);
      return Math.max(1, diffMin / 60);
    }
  } catch (e) {
    console.error("Error parsing time slot:", e);
  }
  return 3; // Default fallback
};

interface BookingFormFieldsProps {
  isEdit?: boolean;
  type: "classroom" | "meeting";
}

const CLASSROOM_CATEGORIES = ["ห้องบรรยาย", "ห้องปฏิบัติการ", "ห้องสัมมนา"];
const MEETING_CATEGORIES = [
  "ห้องประชุมขนาดเล็ก",
  "ห้องประชุมขนาดกลาง",
  "ห้องประชุมขนาดใหญ่",
];

const BUILDINGS = [
  "อาคารเรียนรวม 1",
  "อาคารเรียนรวม 2",
  "อาคารบริหาร ชั้น 3",
  "อาคารสโมสรพนักงาน",
  "ห้องสมุดกลาง (SUT Library) ชั้น 2",
  "อาคารศูนย์บริการคอมพิวเตอร์",
];

const START_HOURS = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
  "19:00", "20:00", "21:00"
];

const END_HOURS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00", "22:00"
];

const CLASSROOM_EQUIPMENT = [
  "เครื่องฉายโปรเจคเตอร์",
  "ไมโครโฟนไร้สาย",
  "กระดานไวท์บอร์ด",
  "ระบบคอมพิวเตอร์ลูกข่าย",
  "ระบบไฮบริด (Zoom/Teams)",
  "ระบบควบคุมจอภาพนักเรียน",
];

const MEETING_EQUIPMENT = [
  "จอภาพอัจฉริยะ Smart Screen",
  "ระบบประชุมทางไกล Video Conference",
  "เครื่องชงกาแฟอัตโนมัติ",
  "ไมโครโฟนประชุมรายบุคคล",
  "เครื่องฉายโปรเจคเตอร์คู่",
  "ระบบบันทึกเสียงและวิดีโอ",
  "กระดานกระจกเขียนความคิดสร้างสรรค์",
];

export default function BookingFormFields({
  isEdit = false,
  type,
}: BookingFormFieldsProps) {
  const {
    register,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<BookingFormValues>();

  const { fields, append, prepend, remove, update } = useFieldArray({
    control,
    name: "expenses",
  });

  // Get initial values from getValues
  const initialTimeSlot = getValues("timeSlot") || "";
  const initialMatch = initialTimeSlot ? initialTimeSlot.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/) : null;

  const [startHour, setStartHour] = useState(initialMatch ? initialMatch[1] : "");
  const [endHour, setEndHour] = useState(initialMatch ? initialMatch[2] : "");

  const watchedRoomNumber = useWatch({ control, name: "roomNumber" });
  const watchedRoomName = useWatch({ control, name: "roomName" });
  const watchedRequesterType = useWatch({ control, name: "requesterType" });
  const watchedTimeSlot = useWatch({ control, name: "timeSlot" });
  const watchedHousekeeperPrice = useWatch({ control, name: "housekeeperPrice" });
  const watchedHousekeeperCount = useWatch({ control, name: "housekeeperCount" });

  // Automatically map roomName to building/category if a matching room is typed
  useEffect(() => {
    if (!watchedRoomName) return;
    const foundRoom = mockRooms.find(
      (r) =>
        r.roomName.toLowerCase() === watchedRoomName.toLowerCase() ||
        r.roomNumber.toLowerCase() === watchedRoomName.toLowerCase()
    );
    if (foundRoom) {
      setValue("building", foundRoom.building);
      setValue("category", foundRoom.category);
      setValue("roomNumber", foundRoom.roomNumber);
    }
  }, [watchedRoomName]);

  // Sync external timeSlot to local startHour/endHour states
  useEffect(() => {
    if (watchedTimeSlot) {
      const match = watchedTimeSlot.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
      if (match) {
        setStartHour(match[1]);
        setEndHour(match[2]);
      }
    } else {
      setStartHour("");
      setEndHour("");
    }
  }, [watchedTimeSlot]);

  const handleTimeChange = (start: string, end: string) => {
    if (start && end) {
      const startVal = parseInt(start.split(":")[0], 10);
      const endVal = parseInt(end.split(":")[0], 10);
      if (endVal <= startVal) {
        const newEnd = `${String(startVal + 1).padStart(2, "0")}:00`;
        setEndHour(newEnd);
        setValue("timeSlot", `${start} - ${newEnd} น.`);
      } else {
        setValue("timeSlot", `${start} - ${end} น.`);
      }
    } else if (start) {
      setValue("timeSlot", `${start} - --:-- น.`);
    } else if (end) {
      setValue("timeSlot", `--:-- - ${end} น.`);
    }
  };

  // 1. Automatically calculate and update the Room Fee expense
  useEffect(() => {
    if (!watchedRoomNumber && !watchedRoomName) return;

    const room = mockRooms.find(
      (r) =>
        r.roomNumber === watchedRoomNumber ||
        r.roomName === watchedRoomName,
    );

    const isInternal =
      watchedRequesterType === "student" ||
      watchedRequesterType === "staff";

    const hours = getHoursFromTimeSlot(watchedTimeSlot || "");
    const useDaily = hours > 4;

    const hourlyRate = isInternal
      ? (room?.rates?.hourlyInternal ?? 150)
      : (room?.rates?.hourlyExternal ?? 400);
    const dailyRate = isInternal
      ? (room?.rates?.dailyInternal ?? 1000)
      : (room?.rates?.dailyExternal ?? 2500);

    const rateName = useDaily ? "ค่าห้องรายวัน" : `ค่าห้องรายชั่วโมง (${hourlyRate} บาท/ชม. x ${hours} ชม.)`;

    const amount = useDaily ? dailyRate : hourlyRate * hours;

    // Find if there is an existing room fee in fields
    const roomExpenseIndex = fields.findIndex((f) => f.name.startsWith("ค่าห้อง"));

    if (roomExpenseIndex !== -1) {
      if (fields[roomExpenseIndex].name !== rateName || fields[roomExpenseIndex].amount !== amount) {
        update(roomExpenseIndex, { name: rateName, amount });
      }
    } else {
      prepend({ name: rateName, amount });
    }
  }, [watchedRoomNumber, watchedRoomName, watchedRequesterType, watchedTimeSlot]);

  // 2. Automatically calculate and update the Housekeeper Fee expense
  useEffect(() => {
    const price = Number(watchedHousekeeperPrice) || 0;
    const count = Number(watchedHousekeeperCount) || 0;
    const amount = price * count;

    const housekeeperExpenseIndex = fields.findIndex((f) => f.name.startsWith("ค่าแม่บ้าน"));

    if (amount > 0) {
      const name = `ค่าแม่บ้าน (${price} บาท/คน x ${count} คน)`;
      if (housekeeperExpenseIndex !== -1) {
        if (fields[housekeeperExpenseIndex].name !== name || fields[housekeeperExpenseIndex].amount !== amount) {
          update(housekeeperExpenseIndex, { name, amount });
        }
      } else {
        prepend({ name, amount });
      }
    } else {
      if (housekeeperExpenseIndex !== -1) {
        remove(housekeeperExpenseIndex);
      }
    }
  }, [watchedHousekeeperPrice, watchedHousekeeperCount]);

  const watchedExpenses = useWatch({
    control,
    name: "expenses",
    defaultValue: [],
  });

  const totalExpenses = (watchedExpenses || []).reduce(
    (sum: number, item: any) => sum + (Number(item?.amount) || 0),
    0,
  );

  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [expenseSearchQuery, setExpenseSearchQuery] = useState("");

  const filteredMockExpenses = mockExpenses.filter((exp) => {
    const displayName = exp.itemName.startsWith("ค่า")
      ? exp.itemName
      : `ค่า${exp.itemName}`;
    return (
      displayName.toLowerCase().includes(expenseSearchQuery.toLowerCase()) ||
      exp.category.toLowerCase().includes(expenseSearchQuery.toLowerCase())
    );
  });

  const themeColor = "#f26522";
  const themeBg = "bg-[#f26522]/10";
  const themeRing = "focus-visible:ring-[#f26522]/30";

  const categoriesList =
    type === "classroom" ? CLASSROOM_CATEGORIES : MEETING_CATEGORIES;
  const equipmentList =
    type === "classroom" ? CLASSROOM_EQUIPMENT : MEETING_EQUIPMENT;

  return (
    <div className="space-y-10">
      {/* Section: Image */}
      <div className="space-y-4 text-left">
        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">
          รูปภาพประกอบ (ห้องหรือสถานที่จอง)
        </Label>

        <Controller
          name="image"
          control={control}
          render={({ field }) => (
            <ImageUpload
              value={field.value}
              onChange={field.onChange}
              error={errors.image?.message}
            />
          )}
        />
      </div>

      {/* Section: Status (Only for Edit Mode) */}
      {isEdit && (
        <div className="space-y-4 text-left">
          <div
            className="flex items-center gap-2.5 mb-2"
            style={{ color: themeColor }}
          >
            <div
              className={cn(
                "size-8 rounded-[7px] flex items-center justify-center shadow-sm border border-slate-100",
                themeBg,
              )}
            >
              <Clock size={18} strokeWidth={2.5} />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">
              สถานะการจอง
            </h3>
          </div>

          <div className="w-full sm:w-1/2 space-y-2.5">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    className={cn(
                      "rounded-[7px] h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-1 transition-all",
                      themeRing,
                      errors.status && "border-red-500",
                    )}
                  >
                    <SelectValue placeholder="เลือกสถานะการจอง" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">รออนุมัติ (Pending)</SelectItem>
                    <SelectItem value="pending_payment">รอชำระเงิน (Pending Payment)</SelectItem>
                    <SelectItem value="verifying_payment">รอตรวจสอบการชำระเงิน (Verifying Payment)</SelectItem>
                    <SelectItem value="approved">อนุมัติแล้ว (Approved)</SelectItem>
                    <SelectItem value="rejected">ปฏิเสธ (Rejected)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <Separator className="bg-slate-100 mt-6" />
        </div>
      )}

      {/* Section: Area Info */}
      <div className="space-y-6 text-left">
        <div
          className="flex items-center gap-2.5 mb-2"
          style={{ color: themeColor }}
        >
          <div
            className={cn(
              "size-8 rounded-[7px] flex items-center justify-center shadow-sm border border-slate-100",
              themeBg,
            )}
          >
            <Building2 size={18} strokeWidth={2.5} />
          </div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">
            ข้อมูลสถานที่
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 ml-1">
                ชื่อพื้นที่
              </Label>
              <Input
                {...register("roomName")}
                placeholder="เช่น ห้องบรรยาย B1101"
                className={cn(
                  "rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all",
                  themeRing,
                  errors.roomName &&
                    "border-red-500 focus-visible:ring-red-500/30",
                )}
              />
              {errors.roomName && (
                <p className="text-[10px] font-bold text-red-500 ml-1">
                  {errors.roomName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 ml-1">
                อาคาร / สถานที่
              </Label>
              <Controller
                name="building"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={cn(
                        "rounded-[7px] h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-1 transition-all",
                        themeRing,
                        errors.building && "border-red-500",
                      )}
                    >
                      <SelectValue placeholder="เลือกอาคาร" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUILDINGS.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.building && (
                <p className="text-[10px] font-bold text-red-500 ml-1">
                  {errors.building.message}
                </p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 ml-1">
                ประเภทพื้นที่
              </Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={cn(
                        "rounded-[7px] h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-1 transition-all",
                        themeRing,
                        errors.category && "border-red-500",
                      )}
                    >
                      <SelectValue placeholder="เลือกประเภท" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesList.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-[10px] font-bold text-red-500 ml-1">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-slate-100" />

      {/* Section: Requester Info */}
      <div className="space-y-6 text-left">
        <div
          className="flex items-center gap-2.5 mb-2"
          style={{ color: themeColor }}
        >
          <div
            className={cn(
              "size-8 rounded-[7px] flex items-center justify-center shadow-sm border border-slate-100",
              themeBg,
            )}
          >
            <User size={18} strokeWidth={2.5} />
          </div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">
            ข้อมูลผู้ยื่นขอจอง
          </h3>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 ml-1">
                ชื่อผู้ขอใช้งาน
              </Label>
              <Input
                {...register("requesterName")}
                placeholder="ระบุชื่อจริง-นามสกุล"
                className={cn(
                  "rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all",
                  themeRing,
                  errors.requesterName && "border-red-500",
                )}
              />
              {errors.requesterName && (
                <p className="text-[10px] font-bold text-red-500 ml-1">
                  {errors.requesterName.message}
                </p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 ml-1">
                ประเภทผู้ใช้งาน
              </Label>
              <Controller
                name="requesterType"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={cn(
                        "rounded-[7px] h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-1 transition-all",
                        themeRing,
                        errors.requesterType && "border-red-500",
                      )}
                    >
                      <SelectValue placeholder="เลือกประเภท" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">นักศึกษา</SelectItem>
                      <SelectItem value="staff">
                        เจ้าหน้าที่ / อาจารย์
                      </SelectItem>
                      <SelectItem value="external">บุคคลภายนอก</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.requesterType && (
                <p className="text-[10px] font-bold text-red-500 ml-1">
                  {errors.requesterType.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 ml-1">
                รหัสประจำตัวผู้ขอ
              </Label>
              <Input
                {...register("requesterId")}
                placeholder="รหัสนักศึกษา หรือรหัสพนักงาน"
                className={cn(
                  "rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all",
                  themeRing,
                  errors.requesterId && "border-red-500",
                )}
              />
              {errors.requesterId && (
                <p className="text-[10px] font-bold text-red-500 ml-1">
                  {errors.requesterId.message}
                </p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 ml-1">
                เบอร์โทรศัพท์ติดต่อ
              </Label>
              <Input
                {...register("contactPhone")}
                placeholder="เช่น 081-xxxxxxx"
                className={cn(
                  "rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all",
                  themeRing,
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 ml-1">
                อีเมลผู้ขอใช้
              </Label>
              <Input
                {...register("contactEmail")}
                placeholder="email@g.sut.ac.th"
                className={cn(
                  "rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all",
                  themeRing,
                  errors.contactEmail && "border-red-500",
                )}
              />
              {errors.contactEmail && (
                <p className="text-[10px] font-bold text-red-500 ml-1">
                  {errors.contactEmail.message}
                </p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 ml-1">
                จำนวนผู้เข้าร่วม (คน)
              </Label>
              <Input
                type="number"
                {...register("attendees")}
                placeholder="ระบุจำนวนคน"
                className={cn(
                  "rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all",
                  themeRing,
                  errors.attendees && "border-red-500",
                )}
              />
              {errors.attendees && (
                <p className="text-[10px] font-bold text-red-500 ml-1">
                  {errors.attendees.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-slate-100" />

      {/* Section: Booking Time Slot & Purpose */}
      <div className="space-y-6 text-left">
        <div
          className="flex items-center gap-2.5 mb-2"
          style={{ color: themeColor }}
        >
          <div
            className={cn(
              "size-8 rounded-[7px] flex items-center justify-center shadow-sm border border-slate-100",
              themeBg,
            )}
          >
            <Clock size={18} strokeWidth={2.5} />
          </div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">
            ข้อมูลช่วงเวลา & จุดประสงค์
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 ml-1">
                วันที่ต้องการจอง
              </Label>
              <Input
                type="date"
                {...register("date")}
                className={cn(
                  "rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all",
                  themeRing,
                  errors.date && "border-red-500",
                )}
              />
              {errors.date && (
                <p className="text-[10px] font-bold text-red-500 ml-1">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-slate-500 ml-1">
                ช่วงเวลาที่จอง
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={startHour}
                  onValueChange={(val) => {
                    setStartHour(val);
                    let newEndHour = endHour;
                    if (endHour) {
                      const startVal = parseInt(val.split(":")[0], 10);
                      const endVal = parseInt(endHour.split(":")[0], 10);
                      if (endVal <= startVal) {
                        newEndHour = "";
                        setEndHour("");
                      }
                    }
                    handleTimeChange(val, newEndHour);
                  }}
                >
                  <SelectTrigger className="h-12 bg-slate-50 border-transparent rounded-[7px] focus:ring-1 focus:ring-[#f26522]/30 text-xs font-bold text-slate-700">
                    <SelectValue placeholder="เวลาเริ่ม" />
                  </SelectTrigger>
                  <SelectContent>
                    {START_HOURS.map((hr) => (
                      <SelectItem key={hr} value={hr} className="text-xs font-bold">
                        {hr} น.
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={endHour}
                  onValueChange={(val) => {
                    setEndHour(val);
                    handleTimeChange(startHour, val);
                  }}
                >
                  <SelectTrigger className="h-12 bg-slate-50 border-transparent rounded-[7px] focus:ring-1 focus:ring-[#f26522]/30 text-xs font-bold text-slate-700">
                    <SelectValue placeholder="เวลาสิ้นสุด" />
                  </SelectTrigger>
                  <SelectContent>
                    {END_HOURS.filter((hr) => {
                      if (!startHour) return true;
                      const startVal = parseInt(startHour.split(":")[0], 10);
                      const hrVal = parseInt(hr.split(":")[0], 10);
                      return hrVal > startVal;
                    }).map((hr) => (
                      <SelectItem key={hr} value={hr} className="text-xs font-bold">
                        {hr} น.
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.timeSlot && (
                <p className="text-[10px] font-bold text-red-500 ml-1">
                  {errors.timeSlot.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            <Label className="text-xs font-bold text-slate-500 ml-1">
              วัตถุประสงค์ในการขอใช้พื้นที่
            </Label>
            <Textarea
              {...register("purpose")}
              placeholder="กรอกวัตถุประสงค์ในการขอใช้พื้นที่ เช่น ทำกิจกรรม, ประชุม, นำเสนอโครงงาน..."
              className={cn(
                "rounded-[7px] min-h-[90px] bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all p-4 resize-none",
                themeRing,
                errors.purpose &&
                  "border-red-500 focus-visible:ring-red-500/30",
              )}
            />
            {errors.purpose && (
              <p className="text-[10px] font-bold text-red-500 ml-1">
                {errors.purpose.message}
              </p>
            )}
          </div>


          <div className="space-y-2.5">
            <Label className="text-xs font-bold text-slate-500 ml-1">
              หมายเหตุเพิ่มเติม
            </Label>
            <Textarea
              {...register("notes")}
              placeholder="ระบุข้อความถึงผู้อนุมัติ (ถ้ามี)..."
              className={cn(
                "rounded-[7px] min-h-[90px] bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all p-4 resize-none",
                themeRing,
              )}
            />
          </div>

          <Separator className="bg-slate-100 my-6" />

          {/* Attached Documents Section (Visible in both Create and Edit modes) */}
          <div className="space-y-4 text-left">
            <div
              className="flex items-center gap-2.5 mb-2"
              style={{ color: themeColor }}
            >
              <div
                className={cn(
                  "size-8 rounded-[7px] flex items-center justify-center shadow-sm border border-slate-100",
                  themeBg,
                )}
              >
                <FileText size={18} strokeWidth={2.5} />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">
                เอกสารแนบจากผู้ขอใช้พื้นที่
              </h3>
            </div>

            <Controller
              name="attachedDocuments"
              control={control}
              render={({ field }) => {
                const docs = field.value || [];
                const fileInputRef = useRef<HTMLInputElement>(null);

                const handleFileChange = (
                  e: React.ChangeEvent<HTMLInputElement>,
                ) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    const newDocNames = Array.from(files).map((f) => f.name);
                    field.onChange([...docs, ...newDocNames]);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }
                };

                const handleRemoveDoc = (indexToRemove: number) => {
                  field.onChange(
                    docs.filter((_, idx) => idx !== indexToRemove),
                  );
                };

                return (
                  <div className="space-y-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple
                      accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt,.png,.jpg,.jpeg"
                      className="hidden"
                    />

                    {/* Upload Button Box */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 hover:border-[#f26522]/30 bg-slate-50 hover:bg-white p-6 rounded-[7px] flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group shadow-inner"
                    >
                      <div className="size-10 rounded-[7px] bg-white shadow-md flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <Plus size={20} className="text-[#f26522]" />
                      </div>
                      <span className="text-xs font-bold text-slate-600 group-hover:text-slate-800">
                        คลิกเพื่อแนบเอกสารเพิ่มเติม
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        รองรับ PDF, Word, Excel, PowerPoint, Text (สูงสุด 20MB)
                      </span>
                    </div>

                    {/* Attached Documents List */}
                    {docs.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {docs.map((doc: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-[7px] bg-slate-50 border border-slate-100 hover:bg-white hover:border-[#f26522]/20 hover:shadow-sm transition-all group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText
                                size={14}
                                className="text-[#6d6e70] group-hover:text-[#f26522] transition-colors shrink-0"
                              />
                              <span className="text-xs font-bold text-slate-600 truncate">
                                {doc}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDoc(idx)}
                              className="size-6 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center cursor-pointer shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="ลบเอกสาร"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }}
            />
          </div>

          {isEdit && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-2.5"
                    style={{ color: themeColor }}
                  >
                    <div
                      className={cn(
                        "size-8 rounded-[7px] flex items-center justify-center shadow-sm border border-slate-100",
                        themeBg,
                      )}
                    >
                      <Banknote size={18} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">
                      ค่าใช้จ่าย (Expenses)
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddExpenseModalOpen(true)}
                    className="text-xs font-bold text-[#f26522] hover:text-[#d8561d] transition-colors flex items-center gap-1 cursor-pointer focus:outline-none bg-transparent border-none py-1 px-2 rounded hover:bg-slate-50"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    เพิ่มรายการ
                  </button>
                </div>

                 {/* Housekeeper Pricing & Headcount Inputs */}
                 <div className="bg-slate-50/50 p-4 border border-slate-100/80 rounded-xl space-y-3 mb-4 text-left">
                   <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-[#f26522]" />
                     <span className="text-xs font-extrabold text-slate-700">ตั้งค่าค่าบริการแม่บ้าน (Housekeeper Settings)</span>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5 text-left">
                       <Label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">ราคาค่าแม่บ้านต่อคน (฿)</Label>
                       <Input
                         type="number"
                         min="0"
                         placeholder="เช่น 450"
                         {...register("housekeeperPrice")}
                         className={cn(
                           "rounded-[7px] h-10 bg-white border-slate-200 focus-visible:ring-1 transition-all text-xs font-bold text-slate-700",
                           themeRing
                         )}
                       />
                     </div>
                     <div className="space-y-1.5 text-left">
                       <Label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">จำนวนแม่บ้าน (คน)</Label>
                       <Input
                         type="number"
                         min="0"
                         placeholder="เช่น 2"
                         {...register("housekeeperCount")}
                         className={cn(
                           "rounded-[7px] h-10 bg-white border-slate-200 focus-visible:ring-1 transition-all text-xs font-bold text-slate-700",
                           themeRing
                         )}
                       />
                     </div>
                   </div>
                 </div>

                <div className="space-y-3.5 bg-slate-50/30 border border-slate-100/80 rounded-[7px] p-4 text-left">
                  {fields.length > 0 ? (
                    <div className="space-y-4">
                      {fields.map((field, index) => {
                        const isReadOnlyExpense = field.name.startsWith("ค่าห้อง") || field.name.startsWith("ค่าแม่บ้าน");
                        return (
                          <div
                            key={field.id}
                            className="flex items-center justify-between gap-4 group"
                          >
                            {/* Expense Name label */}
                            <span className="text-xs font-bold text-slate-500 truncate flex-1 select-none">
                              {field.name}
                            </span>

                            {/* Expense Input */}
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "flex items-center rounded-lg border border-slate-200 bg-white focus-within:ring-1 focus-within:ring-[#f26522]/30 focus-within:border-[#f26522] transition-all overflow-hidden w-[160px] h-10 shadow-sm",
                                isReadOnlyExpense && "bg-slate-50/80 border-slate-200/60"
                              )}>
                                <input
                                  type="number"
                                  readOnly={isReadOnlyExpense}
                                  {...register(
                                    `expenses.${index}.amount` as const,
                                  )}
                                  className={cn(
                                    "w-full h-full px-3 outline-none border-none text-left font-bold text-slate-700 bg-transparent text-xs",
                                    isReadOnlyExpense && "text-slate-400 cursor-not-allowed"
                                  )}
                                  placeholder="0"
                                />
                                <div className="h-full px-3 bg-slate-50 border-l border-slate-100 flex items-center text-[10px] font-bold text-slate-400 select-none">
                                  บาท
                                </div>
                              </div>

                              {/* Delete/Remove button */}
                              {!isReadOnlyExpense ? (
                                <button
                                  type="button"
                                  onClick={() => remove(index)}
                                  className="size-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center cursor-pointer shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:bg-red-50 focus:text-red-500"
                                  title="ลบรายการ"
                                >
                                  <Trash2 size={13} />
                                </button>
                              ) : (
                                <div className="size-8 shrink-0" />
                              )}
                            </div>
                          </div>
                        );
                      })}

                      <div className="flex items-center justify-between pt-4 border-t border-dashed border-slate-200">
                        <span className="text-xs font-black text-slate-700 select-none">
                          ยอดรวมสุทธิ (Total)
                        </span>
                        <span className="text-sm font-black text-slate-800">
                          {totalExpenses.toLocaleString()} บาท
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs font-bold text-slate-400 select-none">
                      ไม่มีรายการค่าใช้จ่าย
                    </div>
                  )}
                </div>

                {/* Modal Popup Dialog for Selecting Expenses */}
                <Dialog
                  open={isAddExpenseModalOpen}
                  onOpenChange={setIsAddExpenseModalOpen}
                >
                  <DialogContent className="w-[95vw] max-w-[420px] p-6 bg-white rounded-[24px] border-none shadow-2xl flex flex-col gap-4 overflow-hidden transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                    <DialogHeader className="text-left pb-2 border-b border-slate-100 relative pr-6">
                      <DialogTitle className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <Banknote
                          className="text-[#f26522]"
                          size={18}
                          strokeWidth={2.5}
                        />
                        เลือกรายการค่าใช้จ่ายเพิ่มเติม
                      </DialogTitle>
                    </DialogHeader>

                    {/* Search Field */}
                    <div className="relative">
                      <Search
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        size={14}
                      />
                      <input
                        type="text"
                        placeholder="ค้นหารายการ หรือหมวดหมู่..."
                        value={expenseSearchQuery}
                        onChange={(e) => setExpenseSearchQuery(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f26522]/10 focus:border-[#f26522] focus:bg-white transition-all font-bold"
                      />
                    </div>

                    {/* Expenses List */}
                    <div className="max-h-[260px] overflow-y-auto custom-scrollbar space-y-2 pr-1 text-left">
                      {filteredMockExpenses.length > 0 ? (
                        filteredMockExpenses.map((exp) => {
                          const displayName = exp.itemName.startsWith("ค่า")
                            ? exp.itemName
                            : `ค่า${exp.itemName}`;
                          return (
                            <button
                              key={exp.id}
                              type="button"
                              onClick={() => {
                                append({
                                  name: displayName,
                                  amount: exp.pricePerUnit,
                                });
                                setIsAddExpenseModalOpen(false);
                                setExpenseSearchQuery("");
                              }}
                              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-[#f26522]/20 hover:bg-[#f26522]/5 hover:shadow-sm transition-all group text-left cursor-pointer"
                            >
                              <div className="min-w-0 flex-1 pr-3">
                                <p className="text-xs font-black text-slate-700 group-hover:text-[#f26522] transition-colors truncate">
                                  {displayName}
                                </p>
                                <p className="text-[9px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">
                                  {exp.category}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-black text-slate-800 bg-slate-50 group-hover:bg-[#f26522]/10 group-hover:text-[#f26522] px-2.5 py-1 rounded-lg transition-colors">
                                  ฿{exp.pricePerUnit.toLocaleString()}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-xs font-bold text-slate-400">
                          ไม่พบรายการค่าใช้จ่าย
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
