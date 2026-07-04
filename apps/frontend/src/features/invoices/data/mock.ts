import { Location, Tenant } from "../types";

export const mockLocations: Location[] = [
  { id: "loc1", name: "โรงอาหารกาสะลอง", zoneId: "cafeterias" },
  { id: "loc2", name: "โรงอาหารเรียนรวม 2", zoneId: "cafeterias" },
  { id: "loc3", name: "อาคารเรียนรวม 1", zoneId: "learning-buildings" },
  { id: "loc4", name: "หอพักหญิง 15", zoneId: "student-dormitories" },
];

export const mockTenants: Tenant[] = [
  {
    id: "t1",
    name: "นายสมชาย รักดี",
    shortName: "SC",
    locationId: "loc1",
    contractNo: "CT-2024-001",
    currentPeriod: "มิถุนายน 2567",
    outstandingAmount: 3500,
    status: "ACTIVE",
  },
  {
    id: "t2",
    name: "นางมาลี ประสงค์ดี",
    shortName: "ML",
    locationId: "loc1",
    contractNo: "CT-2024-002",
    currentPeriod: "มิถุนายน 2567",
    outstandingAmount: 2800,
    status: "ACTIVE",
  },
  {
    id: "t3",
    name: "นางสาววิภา พาณิช",
    shortName: "WP",
    locationId: "loc1",
    contractNo: "CT-2023-089",
    currentPeriod: "มิถุนายน 2567",
    outstandingAmount: 42500,
    status: "ACTIVE",
  },
  {
    id: "t4",
    name: "บริษัท เบเกอรี่ จำกัด",
    shortName: "BK",
    locationId: "loc2",
    contractNo: "CT-2023-089",
    currentPeriod: "มิถุนายน 2567",
    outstandingAmount: 15000,
    status: "ACTIVE",
  },
  {
    id: "t5",
    name: "สยาม แฟชั่น เฮาส์",
    shortName: "SF",
    locationId: "loc2",
    contractNo: "CT-2023-012",
    currentPeriod: "มิถุนายน 2567",
    outstandingAmount: 0,
    status: "ACTIVE",
  },
];
