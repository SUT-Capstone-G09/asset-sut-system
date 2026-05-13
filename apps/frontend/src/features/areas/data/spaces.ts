import { StoreSpace } from '@/features/areas/types/space';

export const mockSpaces: StoreSpace[] = [
  { id: 's1', locationId: '1', name: 'Zone A-01', status: 'available', price: 1500, x: 50, y: 50, width: 100, height: 100 },
  { id: 's2', locationId: '1', name: 'Zone A-02', status: 'occupied', price: 1200, x: 160, y: 50, width: 100, height: 100 },
  { id: 's3', locationId: '1', name: 'Zone B-01', status: 'available', price: 2000, x: 50, y: 160, width: 210, height: 120 },
];