import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { tenantAreaOptions } from "@/features/tenants/data/tenant-areas";
import { generateMockTenants } from "@/features/tenants/data/mock-tenants";

export function useContractActions() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tenantId = searchParams.get("tenantId") || "";
  const queryAction = searchParams.get("action") || "renew";

  // State to track current action type
  const [actionType, setActionType] = useState<"renew" | "terminate">(
    queryAction === "terminate" ? "terminate" : "renew"
  );

  // Locate the tenant and their area information
  const areaId = useMemo(() => {
    return tenantId ? tenantId.split("-")[0] : "cafeterias";
  }, [tenantId]);

  const area = useMemo(() => {
    return tenantAreaOptions.find(a => a.id === areaId) || tenantAreaOptions[0];
  }, [areaId]);

  const allTenantsInArea = useMemo(() => {
    return generateMockTenants(area.id, area.subLocations);
  }, [area]);

  const tenant = useMemo(() => {
    return allTenantsInArea.find(t => t.id === tenantId) || allTenantsInArea[0];
  }, [allTenantsInArea, tenantId]);

  // Extract current active contract details
  const activeContract = useMemo(() => {
    if (!tenant) return null;
    return tenant.contracts?.find(c => c.status === "active" || c.status === "expiring") || {
      id: `ct-${tenant.id}-current`,
      contractNumber: "CT-2024-0089",
      startDate: tenant.contractStartDate || "2024-01-01",
      endDate: tenant.contractEndDate || "2026-12-31",
      monthlyRental: 5000,
      deposit: tenant.deposit || 10000,
      scholarship: tenant.scholarship || 2000,
      terms: tenant.terms || "ต้องเปิดบริการอย่างน้อย 6 วันต่อสัปดาห์ และแต่งกายถูกต้องตามระเบียบที่กำหนด",
      note: tenant.note || "ไม่มีหมายเหตุเพิ่มเติม",
      status: "active" as const
    };
  }, [tenant]);

  // Form States: Renew
  const [renewStartDate, setRenewStartDate] = useState("2026-07-01");
  const [renewEndDate, setRenewEndDate] = useState("2028-06-30");
  const [renewRental, setRenewRental] = useState(activeContract?.monthlyRental || 5000);
  const [renewDeposit, setRenewDeposit] = useState(activeContract?.deposit || 10000);
  const [renewScholarship, setRenewScholarship] = useState(activeContract?.scholarship || 2000);
  const [renewTerms, setRenewTerms] = useState(activeContract?.terms || "");
  const [renewNote, setRenewNote] = useState("");
  const [renewFile, setRenewFile] = useState<{ name: string; size: string } | null>(null);

  // Form States: Terminate
  const [terminateDate, setTerminateDate] = useState(new Date().toISOString().split("T")[0]);
  const [terminateReason, setTerminateReason] = useState("");
  const [refundDeposit, setRefundDeposit] = useState(activeContract?.deposit || 10000);
  const [terminateFile, setTerminateFile] = useState<{ name: string; size: string } | null>(null);

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedContractNo, setGeneratedContractNo] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      const fileObj = { name: file.name, size: `${sizeInMB} MB` };
      
      if (actionType === "renew") {
        setRenewFile(fileObj);
      } else {
        setTerminateFile(fileObj);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      const fileObj = { name: file.name, size: `${sizeInMB} MB` };

      if (actionType === "renew") {
        setRenewFile(fileObj);
      } else {
        setTerminateFile(fileObj);
      }
    }
  };

  // Submit Action Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (actionType === "renew" && !renewFile) {
      alert("กรุณาอัปโหลดเอกสารสัญญาฉบับใหม่ที่ผ่านการลงนามเรียบร้อยแล้ว");
      return;
    }
    if (actionType === "terminate" && !terminateReason) {
      alert("กรุณาระบุเหตุผลการบอกเลิกสัญญาเช่า");
      return;
    }

    setIsSubmitting(true);

    // Simulate backend response time
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Generate a mock contract number on renew
      if (actionType === "renew") {
        const rand = Math.floor(Math.random() * 900) + 100;
        setGeneratedContractNo(`CT-2026-${rand}`);
      }
    }, 1500);
  };

  // Check if tenant has only 1 active contract
  const hasSingleActiveContract = useMemo(() => {
    if (!tenant || !tenant.contracts) return true;
    const activeContractsCount = tenant.contracts.filter(
      c => c.status === "active" || c.status === "expiring"
    ).length;
    return activeContractsCount <= 1;
  }, [tenant]);

  return {
    router,
    actionType,
    setActionType,
    tenant,
    area,
    areaId,
    activeContract,
    renewStartDate,
    setRenewStartDate,
    renewEndDate,
    setRenewEndDate,
    renewRental,
    setRenewRental,
    renewDeposit,
    setRenewDeposit,
    renewScholarship,
    setRenewScholarship,
    renewTerms,
    setRenewTerms,
    renewNote,
    setRenewNote,
    renewFile,
    setRenewFile,
    terminateDate,
    setTerminateDate,
    terminateReason,
    setTerminateReason,
    refundDeposit,
    setRefundDeposit,
    terminateFile,
    setTerminateFile,
    isDragging,
    isSubmitting,
    isSuccess,
    generatedContractNo,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleSubmit,
    hasSingleActiveContract
  };
}
