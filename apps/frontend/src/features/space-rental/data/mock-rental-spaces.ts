import { RentalSpace, RentalSpaceDTO, mapDTOToRentalSpace } from '@/features/space-rental/types/rental-space';

export const mockLocationsDTO: RentalSpaceDTO[] = [
  {
    id: 1,
    name: 'โรงอาหารพราวแสดทอง',
    description: 'โรงอาหารพราวแสดทอง',
    size: 'xxx ตร.ม.',
    area_code: 'CAF-01',
    base_price: 45000,
    status: 'vacant',
    building_id: 1,
    building: {
      id: 1,
      name: 'โรงอาหารพราวแสดทอง',
      address: 'มหาวิทยาลัยเทคโนโลยีสุรนารี',
      lat: 14.8804712,
      lng: 102.0160849,
      building_type: { name: 'โรงอาหาร' }
    },
    images: [
      { url: 'https://beta.sut.ac.th/damt/wp-content/uploads/sites/189/2021/01/1-2.jpg', is_primary: true }
    ]
  },
  {
    id: 2,
    name: 'โรงอาหารกาสะลองคำ',
    description: 'โรงอาหารกาสะลองคำ',
    size: 'xxx ตร.ม.',
    area_code: 'CAF-02',
    base_price: 38000,
    status: 'vacant',
    building_id: 2,
    building: {
      id: 2,
      name: 'โรงอาหารกาสะลองคำ',
      address: 'มหาวิทยาลัยเทคโนโลยีสุรนารี',
      lat: 14.8966317,
      lng: 102.0127639,
      building_type: { name: 'โรงอาหาร' }
    },
    images: [
      { url: 'https://beta.sut.ac.th/damt/wp-content/uploads/sites/189/2021/01/1-3.jpg', is_primary: true }
    ]
  },
  {
    id: 3,
    name: 'โรงอาหารดอนตะวัน',
    description: 'โรงอาหารดอนตะวัน',
    size: 'xxx ตร.ม.',
    area_code: 'CAF-03',
    base_price: 38000,
    status: 'vacant',
    building_id: 3,
    building: {
      id: 3,
      name: 'โรงอาหารดอนตะวัน',
      address: 'มหาวิทยาลัยเทคโนโลยีสุรนารี',
      lat: 14.8913538,
      lng: 102.0177823,
      building_type: { name: 'โรงอาหาร' }
    },
    images: [
      { url: 'https://lh3.googleusercontent.com/pw/AP1GczMGwZjKiuSSjheARj_maqQpi1EyPVvPQ6T2AxpFzT5gwXw-UZiESV390VeDfKz9v5pqASaAUucc9IpNs2MjFJ9quJLAnA7AkZ4cBt1Ij-EhwEy3PGxLWfCRMg5rYOZOjxzbf3-3hR_3MQRYR8Ac8Mtq=w1036-h869-s-no-gm?authuser=0', is_primary: true }
    ]
  },
  {
    id: 4,
    name: 'โรงอาหารครัวท่านท้าว',
    description: 'โรงอาหารครัวท่านท้าว',
    size: 'xxx ตร.ม.',
    area_code: 'CAF-04',
    base_price: 38000,
    status: 'vacant',
    building_id: 4,
    building: {
      id: 4,
      name: 'โรงอาหารครัวท่านท้าว',
      address: 'มหาวิทยาลัยเทคโนโลยีสุรนารี',
      lat: 14.876925,
      lng: 102.0202463,
      building_type: { name: 'โรงอาหาร' }
    },
    images: [
      { url: 'https://lh3.googleusercontent.com/pw/AP1GczMvi77SNfef3Ncwy-H57bA1EyIWs4f0EKfzS7_mW8OlS6lqVa2DeVk_VEdUiy3z7NmXubmhbCrkTgzHO5q7sFEcWrNHjCq3_STr1YKohsJP3x0VvOMGt0YRRY8ZQ8S-3_ZFYTg9GzIxLIZaxbQlAJo5=w1036-h869-s-no-gm?authuser=0', is_primary: true }
    ]
  },
  {
    id: 5,
    name: 'โรงอาหารเด่นทองกวาว',
    description: 'โรงอาหารเด่นทองกวาว',
    size: 'xxx ตร.ม.',
    area_code: 'CAF-05',
    base_price: 38000,
    status: 'vacant',
    building_id: 5,
    building: {
      id: 5,
      name: 'โรงอาหารเด่นทองกวาว',
      address: 'มหาวิทยาลัยเทคโนโลยีสุรนารี',
      lat: 14.8788526,
      lng: 102.0199821,
      building_type: { name: 'โรงอาหาร' }
    },
    images: [
      { url: 'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWl3TVplRJRPnR9OE-_MU12rGQecad2g7vbQMGKfrDrB_7vyMoMU0TuspAVOGUFx6zcA210e53SDVKIVNT-9dXIVVkpl5xmKdF92eVuYHqvYj13kaEHGqQGj2-bs7Ki62MXuHI8j=s1360-w1360-h1020-rw', is_primary: true }
    ]
  },
  {
    id: 6,
    name: 'โรงอาหารเรียนรวม 2',
    description: 'โรงอาหารเรียนรวม 2',
    size: 'xxx ตร.ม.',
    area_code: 'CAF-06',
    base_price: 38000,
    status: 'vacant',
    building_id: 6,
    building: {
      id: 6,
      name: 'โรงอาหารเรียนรวม 2',
      address: 'มหาวิทยาลัยเทคโนโลยีสุรนารี',
      lat: 14.8809731,
      lng: 102.0152876,
      building_type: { name: 'โรงอาหาร' }
    },
    images: [
      { url: 'https://lh3.googleusercontent.com/pw/AP1GczPjz63bQqIg5iRomxraXZO9bCOMbpgRfDahL10V_m-AHeF3pK9i46m__NoRM3rllTKd0EiO20YPonynbfR_TBIugaR_gTakBLS4ePfu__Gh2rqPhF30THzEQQYmWi988Ui6o7BXL38y97vbVzTQUGd6=w1305-h869-s-no-gm?authuser=0', is_primary: true }
    ]
  },
  {
    id: 7,
    name: 'กาแฟพันธุ์ไทย อาคารเรียนรวม1',
    description: 'ร้านกาแฟบรรยากาศดี อาคารเรียนรวม 1',
    size: '45 ตร.ม.',
    area_code: 'B1-102',
    base_price: 15000,
    status: 'occupied',
    building_id: 7,
    building: {
      id: 7,
      name: 'อาคารเรียนรวม 1',
      address: 'มหาวิทยาลัยเทคโนโลยีสุรนารี',
      lat: 14.8810214,
      lng: 102.0159215,
      building_type: { name: 'อาคารเรียน' }
    },
    images: [
      { url: 'https://cheechongruay.smartsme.co.th/wp-content/uploads/2025/12/S__115130542-1024x1024.jpg', is_primary: true }
    ],
    active_contract: {
      contract_no: 'CON-70-0456',
      end_date: '2027-08-31T00:00:00Z',
      business_type: { name: 'อาหารและเครื่องดื่ม' },
      tenant_profile: {
        business_name: 'บริษัท กาแฟพันธุ์ไทย จำกัด',
        national_id: '0105556094056',
        user: {
          profile: {
            first_name: 'สมปอง',
            last_name: 'พันธุ์ไทย'
          }
        }
      }
    }
  },
  {
    id: 8,
    name: '7-Eleven ใต้โรงอาหารกาสะลองคำ',
    description: 'ร้านสะดวกซื้อ 24 ชม.',
    size: '120 ตร.ม.',
    area_code: 'D14-01',
    base_price: 25000,
    status: 'occupied',
    building_id: 2,
    building: {
      id: 2,
      name: 'โรงอาหารกาสะลองคำ',
      address: 'มหาวิทยาลัยเทคโนโลยีสุรนารี',
      lat: 14.8966317,
      lng: 102.0127639,
      building_type: { name: 'โรงอาหาร' }
    },
    images: [
      { url: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAH7J_G_-DbP9rs93hMXsA2-j3WRWt-UjKfbfHb9_v59lphP7cwAQ9B-OYI2b7df6RqtFJbNwTYi0eJfcAtaM0c5cOfb32fsrcsVAkFc5TL8o6cIislQC27l0Ps4u3ZyMW4zFFYu=s2048-v1', is_primary: true }
    ],
    active_contract: {
      contract_no: 'CON-69-0124',
      end_date: '2026-12-31T00:00:00Z',
      business_type: { name: 'ร้านค้าและบริการ' },
      tenant_profile: {
        business_name: 'บริษัท ซีพี ออลล์ จำกัด (มหาชน)',
        national_id: '0107538000497',
        user: {
          profile: {
            first_name: 'ซีพี',
            last_name: 'ออลล์'
          }
        }
      }
    }
  },
  {
    id: 9,
    name: 'ร้านค้าบริการไปรษณีย์และพัสดุ',
    description: 'จุดส่งพัสดุและไปรษณีย์ด่วนพิเศษ',
    size: '50 ตร.ม.',
    area_code: 'SP2-01',
    base_price: 18000,
    status: 'occupied',
    building_id: 8,
    building: {
      id: 8,
      name: 'สุรพัฒน์ 2',
      address: 'มหาวิทยาลัยเทคโนโลยีสุรนารี',
      lat: 14.8769302,
      lng: 102.0176714,
      building_type: { name: '' }
    },
    images: [
      { url: 'https://lh3.googleusercontent.com/pw/AP1GczMvi77SNfef3Ncwy-H57bA1EyIWs4f0EKfzS7_mW8OlS6lqVa2DeVk_VEdUiy3z7NmXubmhbCrkTgzHO5q7sFEcWrNHjCq3_STr1YKohsJP3x0VvOMGt0YRRY8ZQ8S-3_ZFYTg9GzIxLIZaxbQlAJo5=w1036-h869-s-no-gm?authuser=0', is_primary: true }
    ],
    active_contract: {
      contract_no: 'CON-70-0987',
      end_date: '2027-06-30T00:00:00Z',
      business_type: { name: 'ร้านค้าและบริการ' },
      tenant_profile: {
        business_name: 'บริษัท ไปรษณีย์ไทย จำกัด',
        national_id: '0105546112521',
        user: {
          profile: {
            first_name: 'ไปรษณีย์',
            last_name: 'ไทย'
          }
        }
      }
    }
  }
];

export const mockLocations: RentalSpace[] = mockLocationsDTO.map(mapDTOToRentalSpace);
