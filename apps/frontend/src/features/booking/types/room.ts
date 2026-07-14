export interface Room {
  id: string;
  roomName: string;
  roomNumber: string;
  buildingId?: string;
  building: string;
  category: string; // e.g., "ห้องบรรยาย", "ห้องปฏิบัติการ", "ห้องสัมมนา", "ห้องประชุมขนาดใหญ่", etc.
  capacity: number;
  image: string;
  status: "available" | "maintenance";
  equipment: string[];
  notes?: string;
  rates: {
    hourlyInternal: number;
    hourlyExternal: number;
    hourlyOffPeakInternal?: number;
    hourlyOffPeakExternal?: number;
    dailyInternal: number;
    dailyExternal: number;
  };
  documents?: string[];
}
