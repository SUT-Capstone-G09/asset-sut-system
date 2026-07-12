import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AdminRequestRepository } from '../../data/repositories/admin-request.repository';
import { GetAdminRequestsUseCase } from '../../domain/usecases/get-admin-requests.usecase';
import { AdminRequestItem } from '../../domain/entities/admin-request-item.entity';
import { DEFAULT_ADMIN_INQUIRIES } from '../../data/adminRequestMock';

const repository = new AdminRequestRepository();
const getAdminRequestsUseCase = new GetAdminRequestsUseCase(repository);

export const useAdminRequests = () => {
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [currentTab, setCurrentTab] = useState<'requests' | 'inquiries'>('requests');
  const [inquirySubTab, setInquirySubTab] = useState('unread');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [requests, setRequests] = useState<AdminRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inquiries from mock as they aren't stored in DB yet
  const inquiries = DEFAULT_ADMIN_INQUIRIES;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const loadRequests = async () => {
      setIsLoading(true);
      try {
        const data = await getAdminRequestsUseCase.execute();
        setRequests(data);
      } catch (err: any) {
        console.warn("Failed to load requests from backend API, using mock requests as fallback.");
        // Fallback mockup requests
        setRequests([
          { id: 'REQ-2026-000123', type: 'แจ้งซ่อมครุภัณฑ์', title: 'แจ้งซ่อมเครื่องปรับอากาศมีเสียงดังผิดปกติ', asset: 'REQ-2026-000123', sender: 'ผู้ใช้งาน ทั่วไป', location: 'อาคารวิชาการ 1 ห้อง B1213', status: 'IN-PROGRESS', date: '06 ก.ค. 69', email: 'user@example.com' },
          { id: 'REQ-2026-000098', type: 'แจ้งปัญหาการใช้งานพื้นที่', title: 'กลอนประตูกระจกชำรุด', asset: 'REQ-2026-000098', sender: 'ผู้ใช้งาน ทั่วไป', location: 'อาคารเรียนรวม 2 ชั้น 4 ห้อง 2402', status: 'COMPLETED', date: '05 ก.ค. 69', email: 'user@example.com' },
          { id: 'REQ-2026-000077', type: 'แจ้งซ่อมครุภัณฑ์', title: 'หลอดไฟเสียบริเวณทางเดินชั้น 1', asset: 'REQ-2026-000077', sender: 'ผู้ใช้งาน ทั่วไป', location: 'อาคารเรียนรวม 1 ชั้น 1', status: 'PENDING', date: '06 ก.ค. 69', email: 'user@example.com' },
          { id: 'REQ-2026-000042', type: 'แจ้งปัญหาการใช้งานพื้นที่', title: 'ก๊อกน้ำห้องน้ำชายชั้น 3 รั่ว', asset: 'REQ-2026-000042', sender: 'ผู้ใช้งาน ทั่วไป', location: 'อาคารวิชาการ 2 ชั้น 3', status: 'CANCELLED', date: '04 ก.ค. 69', email: 'user@example.com' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, [isMounted]);

  // Filter requests based on search term
  const filteredRequests = useMemo(() => {
    if (!searchTerm.trim()) {
      return requests;
    }
    const term = searchTerm.toLowerCase();
    return requests.filter(req => 
      req.id.toLowerCase().includes(term) ||
      req.title.toLowerCase().includes(term) ||
      req.sender.toLowerCase().includes(term) ||
      req.location.toLowerCase().includes(term)
    );
  }, [requests, searchTerm]);

  const handleRequestClick = (id: string) => {
    router.push(`/admin/requests/manage-requests?id=${id}`);
  };

  const handleInquiryClick = (id: string) => {
    router.push(`/admin/requests/manage-requests?id=${id}`);
  };

  return {
    isMounted,
    currentTab,
    setCurrentTab,
    inquirySubTab,
    setInquirySubTab,
    searchTerm,
    setSearchTerm,
    requests: filteredRequests,
    inquiries,
    isLoading,
    error,
    handleRequestClick,
    handleInquiryClick
  };
};
