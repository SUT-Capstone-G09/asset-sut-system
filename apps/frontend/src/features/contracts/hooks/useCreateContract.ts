import { useState, useMemo, useEffect } from "react";
import { tenantAreaOptions } from "@/features/tenants/data/tenant-areas";
import { MockTenant } from "@/features/tenants/data/mock-tenants";
import { mockUsers } from "../data/mock-users";
import { defaultContractTerms, defaultContractNote } from "../data/contract-constants";

interface UseCreateContractProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTenant: MockTenant) => void;
  initialAreaId: string;
  onErrorToast: (message: string) => void;
}

export function useCreateContract({
  isOpen,
  onClose,
  onSuccess,
  initialAreaId,
  onErrorToast,
}: UseCreateContractProps) {
  // Form Inputs
  const [formAreaId, setFormAreaId] = useState(initialAreaId);
  const [selectedUser, setSelectedUser] = useState("user_01");
  const [businessName, setBusinessName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [registeredAddress, setRegisteredAddress] = useState("");

  const selectedAreaObj = useMemo(() => {
    return tenantAreaOptions.find((a) => a.id === formAreaId) || tenantAreaOptions[0];
  }, [formAreaId]);

  const [formSubLocation, setFormSubLocation] = useState("");
  const [formBusinessType, setFormBusinessType] = useState("");

  // Sync sub locations and business types when area switches in form
  useEffect(() => {
    if (selectedAreaObj) {
      setFormSubLocation(selectedAreaObj.subLocations[0] || "");
      setFormBusinessType(selectedAreaObj.businessTypes[0] || "อาหารและเครื่องดื่ม");
    }
  }, [selectedAreaObj]);

  const [monthlyRental, setMonthlyRental] = useState("5000");
  const [startDate, setStartDate] = useState("2026-07-01");
  const [endDate, setEndDate] = useState("2028-06-30");
  const [deposit, setDeposit] = useState("10000");
  const [scholarship, setScholarship] = useState("2000");
  const [terms, setTerms] = useState("");
  const [note, setNote] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [uploadedVerificationFile, setUploadedVerificationFile] = useState<{ name: string; size: string } | null>(null);

  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initialAreaId if it changes from parent
  useEffect(() => {
    if (initialAreaId) {
      setFormAreaId(initialAreaId);
    }
  }, [initialAreaId]);

  const handleModalCloseAttempt = () => {
    const isDirty = !!(businessName || taxId || phone || nationalId || registeredAddress || terms || note);
    if (isDirty) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  const handleForceClose = () => {
    setShowCloseConfirm(false);
    resetFormFields();
    onClose();
  };

  const resetFormFields = () => {
    setBusinessName("");
    setTaxId("");
    setPhone("");
    setNationalId("");
    setRegisteredAddress("");
    setMonthlyRental("5000");
    setDeposit("10000");
    setScholarship("2000");
    setTerms("");
    setNote("");
    setUploadedFile(null);
    setUploadedVerificationFile(null);
  };

  const handleCreateContractSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !taxId || !registeredAddress || !startDate || !endDate || !phone || !nationalId) {
      onErrorToast("กรุณากรอกข้อมูลหลักให้ครบถ้วน");
      return;
    }

    setIsSubmitting(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);

    const userObj = mockUsers.find((u) => u.id === selectedUser);
    const ownerName = userObj ? userObj.name : "ผู้เช่ารายใหม่";
    const tenantIdVal = `${formAreaId}-${Date.now()}`;

    // Mock contract object
    const newContract = {
      id: `ct-${tenantIdVal}-current`,
      contractNumber: `CT-2026-${Math.floor(Math.random() * 900) + 100}`,
      startDate,
      endDate,
      monthlyRental: parseFloat(monthlyRental) || 5000,
      deposit: parseFloat(deposit) || 10000,
      scholarship: parseFloat(scholarship) || 2000,
      terms: terms || "ต้องเปิดบริการอย่างน้อย 6 วันต่อสัปดาห์ และแต่งกายถูกต้องตามระเบียบที่กำหนด",
      note: note || "ไม่มีหมายเหตุเพิ่มเติม",
      status: "active" as const,
    };

    const newTenant: MockTenant = {
      id: tenantIdVal,
      name: businessName,
      subLocation: formSubLocation,
      businessType: formBusinessType,
      ownerName,
      contractEndDate: endDate,
      contractStartDate: startDate,
      bannerUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80", // Default Food banner
      phone,
      nationalId,
      taxId,
      deposit: parseFloat(deposit) || 10000,
      scholarship: parseFloat(scholarship) || 2000,
      terms,
      note,
      contracts: [newContract],
    };

    onSuccess(newTenant);
    resetFormFields();
  };

  return {
    formAreaId,
    setFormAreaId,
    selectedUser,
    setSelectedUser,
    businessName,
    setBusinessName,
    taxId,
    setTaxId,
    phone,
    setPhone,
    nationalId,
    setNationalId,
    registeredAddress,
    setRegisteredAddress,
    selectedAreaObj,
    formSubLocation,
    setFormSubLocation,
    formBusinessType,
    setFormBusinessType,
    monthlyRental,
    setMonthlyRental,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    deposit,
    setDeposit,
    scholarship,
    setScholarship,
    terms,
    setTerms,
    note,
    setNote,
    uploadedFile,
    setUploadedFile,
    uploadedVerificationFile,
    setUploadedVerificationFile,
    showCloseConfirm,
    setShowCloseConfirm,
    isSubmitting,
    handleModalCloseAttempt,
    handleForceClose,
    handleCreateContractSubmit,
    resetFormFields,
  };
}
