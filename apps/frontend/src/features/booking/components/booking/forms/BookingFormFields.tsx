"use client";

import { useState, useRef, useEffect } from "react";
import {
  useFormContext,
  Controller,
  useWatch,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  X,
  FileText,
  Plus,
} from "lucide-react";
import { BookingFormValues } from "../../../schemas/booking-schema";
import { cn } from "@/lib/utils";
import ImageUpload from "@/features/areas/components/admin/forms/ImageUpload";
import { getLocations, AdminLocationDTO } from "../../../services/locationService";
import { getHoursFromTimeSlot } from "../../../utils/time";

interface BookingFormFieldsProps {
  isEdit?: boolean;
  recurrenceMode?: "this" | "following" | "all";
  type: string;
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
  recurrenceMode,
  type,
}: BookingFormFieldsProps) {
  const {
    register,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<BookingFormValues>();

  // Get initial values from getValues
  const initialTimeSlot = getValues("timeSlot") || "";
  const initialMatch = initialTimeSlot ? initialTimeSlot.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/) : null;

  const [startHour, setStartHour] = useState(initialMatch ? initialMatch[1] : "");
  const [endHour, setEndHour] = useState(initialMatch ? initialMatch[2] : "");

  const watchedRoomNumber = useWatch({ control, name: "roomNumber" });
  const watchedRoomName = useWatch({ control, name: "roomName" });
  const watchedRequesterType = useWatch({ control, name: "requesterType" });
  const watchedTimeSlot = useWatch({ control, name: "timeSlot" });
  const watchedRepeat = useWatch({ control, name: "repeat" });
  const watchedFrequency = useWatch({ control, name: "repeatFrequency" });
  const watchedCustomUnit = useWatch({ control, name: "repeatCustomUnit" });
  const watchedStatus = useWatch({ control, name: "status" });
  const watchedBuilding = useWatch({ control, name: "building" });

  const [locations, setLocations] = useState<AdminLocationDTO[]>([]);

  useEffect(() => {
    getLocations()
      .then((data) => setLocations(data))
      .catch((err) => console.error("Failed to load locations for mapping:", err));
  }, []);

  const dynamicBuildings = Array.from(
    new Set([
      ...locations.map((loc) => loc.building).filter(Boolean),
      ...(watchedBuilding ? [watchedBuilding] : []),
    ])
  ) as string[];

  // Automatically map roomName to building/category if a matching room is typed
  useEffect(() => {
    if (!watchedRoomName) return;
    const foundRoom = locations.find(
      (r) =>
        r.name.toLowerCase() === watchedRoomName.toLowerCase() ||
        (r.room_number && String(r.room_number).toLowerCase() === watchedRoomName.toLowerCase())
    );
    if (foundRoom) {
      setValue("building", foundRoom.building ?? "");
      setValue("category", foundRoom.type);
      setValue("roomNumber", foundRoom.room_number ? String(foundRoom.room_number) : "");
    }
  }, [watchedRoomName, locations]);

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
                    <SelectItem value="approved">อนุมัติ (Approved)</SelectItem>
                    <SelectItem value="rejected">ปฏิเสธ (Rejected)</SelectItem>
                    <SelectItem value="cancelled">ยกเลิก (Cancelled)</SelectItem>
                    <SelectItem value="completed">เสร็จสิ้น (Completed)</SelectItem>
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
                ชื่อพื้นที่ / ห้อง
              </Label>
              <Controller
                name="roomName"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      const foundRoom = locations.find((r) => r.name === val);
                      if (foundRoom) {
                        setValue("building", foundRoom.building ?? "");
                        setValue("category", foundRoom.type);
                        setValue("roomNumber", foundRoom.room_number ? String(foundRoom.room_number) : "");
                        if (foundRoom.image_url) {
                          setValue("image", foundRoom.image_url);
                        }
                      }
                    }}
                    value={field.value}
                  >
                    <SelectTrigger
                      className={cn(
                        "rounded-[7px] h-12 bg-slate-50 border-transparent focus:bg-white focus:ring-1 transition-all",
                        themeRing,
                        errors.roomName && "border-red-500",
                      )}
                    >
                      <SelectValue placeholder="เลือกห้องที่ต้องการจอง" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {locations
                        .filter((loc) => categoriesList.includes(loc.type) || loc.name === watchedRoomName)
                        .map((loc) => (
                          <SelectItem key={loc.id} value={loc.name}>
                            {loc.name} {loc.building ? `(${loc.building})` : ""}
                          </SelectItem>
                        ))}
                      {locations.filter((loc) => categoriesList.includes(loc.type) || loc.name === watchedRoomName).length === 0 && (
                        <div className="p-2 text-xs text-slate-400 text-center">
                          ไม่มีห้องที่ตรงกับประเภทนี้ในฐานข้อมูล
                        </div>
                      )}
                    </SelectContent>
                  </Select>
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
                    <SelectContent className="bg-white">
                      {dynamicBuildings.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                      {dynamicBuildings.length === 0 && (
                        <div className="p-2 text-xs text-slate-400 text-center">
                          ไม่มีข้อมูลอาคารในระบบ
                        </div>
                      )}
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
                disabled={isEdit && recurrenceMode !== "this"}
                {...register("date")}
                className={cn(
                  "rounded-[7px] h-12 bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed",
                  themeRing,
                  errors.date && "border-red-500",
                )}
              />
              {isEdit && recurrenceMode !== "this" && (
                <span className="text-[10px] text-amber-600 font-bold block pl-1">
                  * ไม่สามารถเปลี่ยนวันที่ได้เมื่อแก้ไขตารางเรียนทำซ้ำแบบกลุ่ม (หากต้องการเปลี่ยนวันที่ของรอบนี้ กรุณาเลือกแก้ไขเฉพาะรอบนี้เท่านั้น)
                </span>
              )}
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

          {/* Repeat / Recurrence Options */}
          {!isEdit && (
            <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-5 text-left">
              <div className="flex items-center gap-3">
                <Controller
                  name="repeat"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="repeat"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-slate-300 data-[state=checked]:bg-[#f26522] data-[state=checked]:border-[#f26522] data-[state=checked]:text-white size-5 rounded-[5px] cursor-pointer"
                    />
                  )}
                />
                <Label htmlFor="repeat" className="text-xs font-black text-slate-700 cursor-pointer select-none">
                  ตั้งค่าการทำซ้ำ (Repeat / Recurrence)
                </Label>
              </div>

              {watchedRepeat && (
                <div className="space-y-4 pt-4 border-t border-slate-200/60 transition-all duration-200">
                  {/* Frequency Selector */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 pl-1">ความถี่</Label>
                    <Controller
                      name="repeatFrequency"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-11 bg-white border-slate-200 rounded-[7px] focus:ring-1 focus:ring-[#f26522]/30 text-xs font-bold text-slate-700">
                            <SelectValue placeholder="เลือกความถี่" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="daily" className="text-xs font-bold text-slate-700">ทุกวัน</SelectItem>
                            <SelectItem value="weekly" className="text-xs font-bold text-slate-700">ทุกสัปดาห์</SelectItem>
                            <SelectItem value="monthly" className="text-xs font-bold text-slate-700">ทุกเดือน</SelectItem>
                            <SelectItem value="custom" className="text-xs font-bold text-slate-700">กำหนดเอง (Custom)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* Custom Recurrence Options */}
                  {watchedFrequency === "custom" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 pl-1">ทำซ้ำทุกๆ</Label>
                        <Input
                          type="number"
                          min="1"
                          {...register("repeatCustomInterval")}
                          className="rounded-[7px] h-11 bg-white border-slate-200 focus-visible:ring-1 text-xs font-bold text-slate-700 focus-visible:ring-[#f26522]/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 pl-1">หน่วย</Label>
                        <Controller
                          name="repeatCustomUnit"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-11 bg-white border-slate-200 rounded-[7px] focus:ring-1 focus:ring-[#f26522]/30 text-xs font-bold text-slate-700">
                                <SelectValue placeholder="เลือกหน่วย" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                <SelectItem value="day" className="text-xs font-bold text-slate-700">วัน</SelectItem>
                                <SelectItem value="week" className="text-xs font-bold text-slate-700">สัปดาห์</SelectItem>
                                <SelectItem value="month" className="text-xs font-bold text-slate-700">เดือน</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Days of Week (Weekly or Custom Week) */}
                  {(watchedFrequency === "weekly" || (watchedFrequency === "custom" && watchedCustomUnit === "week")) && (
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 pl-1">วันในสัปดาห์</Label>
                      <Controller
                        name="repeatDaysOfWeek"
                        control={control}
                        render={({ field }) => {
                          const selectedDays: number[] = field.value || [];
                          const days = [
                            { key: 1, label: "จ", title: "วันจันทร์" },
                            { key: 2, label: "อ", title: "วันอังคาร" },
                            { key: 3, label: "พ", title: "วันพุธ" },
                            { key: 4, label: "พฤ", title: "วันพฤหัสบดี" },
                            { key: 5, label: "ศ", title: "วันศุกร์" },
                            { key: 6, label: "ส", title: "วันเสาร์" },
                            { key: 0, label: "อา", title: "วันอาทิตย์" },
                          ];
                          const toggleDay = (dayKey: number) => {
                            if (selectedDays.includes(dayKey)) {
                              field.onChange(selectedDays.filter(d => d !== dayKey));
                            } else {
                              field.onChange([...selectedDays, dayKey]);
                            }
                          };
                          return (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2">
                                {days.map((day) => {
                                  const isSelected = selectedDays.includes(day.key);
                                  return (
                                    <button
                                      key={day.key}
                                      type="button"
                                      title={day.title}
                                      onClick={() => toggleDay(day.key)}
                                      className={cn(
                                        "size-9 rounded-full border text-xs font-extrabold flex items-center justify-center transition-all cursor-pointer select-none",
                                        isSelected
                                          ? "bg-[#f26522] border-[#f26522] text-white shadow-sm shadow-[#f26522]/20"
                                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                      )}
                                    >
                                      {day.label}
                                    </button>
                                  );
                                })}
                              </div>
                              <span className="text-[10px] text-slate-400 font-bold block pl-1">
                                * คลิกเลือกได้มากกว่า 1 วัน (เช่น ทุกวันจันทร์และพุธ)
                              </span>
                            </div>
                          );
                        }}
                      />
                    </div>
                  )}

                  {/* End Recurrence Settings */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <Label className="text-xs font-bold text-slate-600 pl-1">วันสิ้นสุด (End Date)</Label>
                    <Controller
                      name="repeatEndDateType"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-3.5 pl-1">
                          {/* Option 1: None */}
                          <label className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer font-bold select-none">
                            <input
                              type="radio"
                              name="repeatEndDateType"
                              value="none"
                              checked={field.value === "none"}
                              onChange={() => field.onChange("none")}
                              className="accent-[#f26522] size-4 cursor-pointer"
                            />
                            <span>ไม่มีวันสิ้นสุด</span>
                          </label>

                          {/* Option 2: Date */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                            <label className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer font-bold select-none shrink-0">
                              <input
                                type="radio"
                                name="repeatEndDateType"
                                value="date"
                                checked={field.value === "date"}
                                onChange={() => field.onChange("date")}
                                className="accent-[#f26522] size-4 cursor-pointer"
                              />
                              <span>สิ้นสุด ณ วันที่</span>
                            </label>
                            {field.value === "date" && (
                              <div className="space-y-1.5 w-full sm:w-auto">
                                <Input
                                  type="date"
                                  {...register("repeatEndDate")}
                                  className="rounded-[7px] h-10 bg-white border-slate-200 text-xs font-bold text-slate-700 w-full sm:w-48 focus-visible:ring-1 focus-visible:ring-[#f26522]/30"
                                />
                                {errors.repeatEndDate && (
                                  <p className="text-[10px] font-bold text-red-500 ml-1">
                                    {errors.repeatEndDate.message}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Option 3: Count */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                            <label className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer font-bold select-none shrink-0">
                              <input
                                type="radio"
                                name="repeatEndDateType"
                                value="count"
                                checked={field.value === "count"}
                                onChange={() => field.onChange("count")}
                                className="accent-[#f26522] size-4 cursor-pointer"
                              />
                              <span>สิ้นสุดหลังจากทำซ้ำครบ</span>
                            </label>
                            {field.value === "count" && (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="1"
                                    {...register("repeatEndCount")}
                                    className="rounded-[7px] h-10 bg-white border-slate-200 text-xs font-bold text-slate-700 w-24 focus-visible:ring-1 focus-visible:ring-[#f26522]/30"
                                  />
                                  <span className="text-xs text-slate-500 font-bold">ครั้ง</span>
                                </div>
                                {errors.repeatEndCount && (
                                  <p className="text-[10px] font-bold text-red-500 ml-1">
                                    {errors.repeatEndCount.message}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

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

        </div>
      </div>
    </div>
  );
}
