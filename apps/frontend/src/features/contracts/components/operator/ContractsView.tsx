"use client";

import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/lib/context/auth-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { MockTenant } from "@/features/space-rental/data/mock-tenants";
import { mockContractStore, RenewalRequest } from "../../data/mockContractStore";

// Sub-components
import OperatorShopInfoTab from "./ShopInfoTab";
import OperatorContractTab from "./ContractTab";
import OperatorRenewalRequestDialog from "./RenewalRequestDialog";

export default function OperatorContractsView() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<"shop-info" | "contract">("shop-info");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tenantType, setTenantType] = useState<"individual" | "juristic">("individual");
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [phone, setPhone] = useState("");
  const [intent, setIntent] = useState<"intend" | "not_intend">("intend");
  const [suggestions, setSuggestions] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tenants, setTenants] = useState<MockTenant[]>([]);
  const [requestsList, setRequestsList] = useState<RenewalRequest[]>([]);

  const reloadData = () => {
    setTenants(mockContractStore.getTenants());
    setRequestsList(mockContractStore.getRenewalRequests());
  };

  useEffect(() => {
    reloadData();
    window.addEventListener("storage", reloadData);
    const interval = setInterval(reloadData, 1000);
    return () => {
      window.removeEventListener("storage", reloadData);
      clearInterval(interval);
    };
  }, []);

  // Find the tenant matching the logged-in user or fallback to first expiring tenant
  const activeTenant = tenants.find((t) => 
    user && (t.ownerName.toLowerCase().includes(user.first_name.toLowerCase()) || 
             t.ownerName.toLowerCase().includes(user.last_name.toLowerCase()) ||
             t.name.toLowerCase().includes(user.first_name.toLowerCase()))
  ) || tenants.find((t) => t.contracts?.some((c) => c.status === "expiring")) 
    || tenants[0];

  const activeContract = activeTenant?.contracts?.find((c) => c.status === "expiring") 
    || activeTenant?.contracts?.[0];

  // Pre-fill form when activeTenant loads
  useEffect(() => {
    if (activeTenant) {
      setBusinessName(activeTenant.name);
      setOwnerName(activeTenant.ownerName);
      setTaxId(activeTenant.taxId || "0105560940123");
      setPhone(activeTenant.phone || "081-234-5678");
    }
  }, [activeTenant]);

  const handleRenewalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContract || !activeTenant) return;
    if (tenantType === "juristic" && !attachedFile) {
      toast.error("กรุณาแนบหนังสือคำร้องขอต่ออายุสัญญา (PDF)");
      return;
    }
    if (!termsAccepted) {
      toast.error("กรุณากดยินยอมรับข้อกำหนดและเงื่อนไข");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);

    const newRequest: RenewalRequest = {
      id: `req-${Date.now()}`,
      contractNo: activeContract.contractNumber,
      shopName: businessName,
      ownerName: ownerName,
      tenantType,
      documentName: tenantType === "juristic" && attachedFile ? attachedFile.name : `แบบตอบรับการต่อสัญญา_${businessName}.pdf`,
      documentUrl: "generate_on_demand", // Flag indicating dynamic PDF should be rendered on demand
      intent,
      suggestions,
      subLocation: activeTenant.subLocation,
      expiryDate: formatThaiDate(activeContract.endDate),
      status: "pending",
      date: new Date().toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    };

    mockContractStore.addRenewalRequest(newRequest);
    reloadData();
    setIsModalOpen(false);
    toast.success("ยื่นคำร้องต่อสัญญาสำเร็จ", {
      description: "คำร้องของคุณได้รับการบันทึกเรียบร้อยแล้ว",
    });

    // Reset Form
    setAttachedFile(null);
    setTermsAccepted(false);
    setSuggestions("");
    setIntent("intend");
  };

  // Convert Date to Thai format
  const formatThaiDate = (dateStr: string) => {
    const months = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  };

  // Check if there is already a pending renewal request
  const hasPendingRequest = requestsList.some(
    (r) => activeContract && r.contractNo === activeContract.contractNumber && r.status === "pending"
  );
  const hasApprovedRequest = requestsList.some(
    (r) => activeContract && r.contractNo === activeContract.contractNumber && r.status === "approved"
  );

  if (tenants.length === 0 || !activeContract || !activeTenant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f26522]" />
      </div>
    );
  }

  const areaName = activeTenant.id.split("-")[0] === "cafeterias" ? "พื้นที่โรงอาหาร" : "พื้นที่ร้านค้าเชิงพาณิชย์";

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-slate-100 pb-4">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          ข้อมูลร้านค้า & สัญญา
        </h1>
        <p className="text-slate-400 text-sm">
          ตรวจสอบรายละเอียดข้อมูลร้านค้า พื้นที่ประกอบการ และข้อตกลงสัญญาเช่าของคุณ
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("shop-info")}
          className={cn(
            "flex items-center gap-2 px-6 pb-3 pt-1 text-sm font-semibold transition-colors cursor-pointer",
            activeTab === "shop-info"
              ? "border-b-2 border-[#f26522] text-[#f26522]"
              : "border-b-2 border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          ข้อมูลร้านค้า
        </button>
        <button
          onClick={() => setActiveTab("contract")}
          className={cn(
            "flex items-center gap-2 px-6 pb-3 pt-1 text-sm font-semibold transition-colors cursor-pointer",
            activeTab === "contract"
              ? "border-b-2 border-[#f26522] text-[#f26522]"
              : "border-b-2 border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          สัญญา
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "shop-info" ? (
        <OperatorShopInfoTab 
          activeTenant={activeTenant}
          activeContract={activeContract}
          areaName={areaName}
        />
      ) : (
        <OperatorContractTab 
          activeTenant={activeTenant}
          activeContract={activeContract}
          areaName={areaName}
          hasPendingRequest={hasPendingRequest}
          hasApprovedRequest={hasApprovedRequest}
          requestsList={requestsList}
          formatThaiDate={formatThaiDate}
          onOpenRenewalModal={() => setIsModalOpen(true)}
        />
      )}

      {/* Renewal Dialog Modal */}
      <OperatorRenewalRequestDialog 
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        tenantType={tenantType}
        onTenantTypeChange={setTenantType}
        businessName={businessName}
        onBusinessNameChange={setBusinessName}
        ownerName={ownerName}
        onOwnerNameChange={setOwnerName}
        subLocation={activeTenant.subLocation}
        contractNo={activeContract.contractNumber}
        expiryDate={formatThaiDate(activeContract.endDate)}
        intent={intent}
        onIntentChange={setIntent}
        suggestions={suggestions}
        onSuggestionsChange={setSuggestions}
        taxId={taxId}
        onTaxIdChange={setTaxId}
        phone={phone}
        onPhoneChange={setPhone}
        attachedFile={attachedFile}
        onAttachedFileChange={setAttachedFile}
        termsAccepted={termsAccepted}
        onTermsAcceptedChange={setTermsAccepted}
        isSubmitting={isSubmitting}
        onSubmit={handleRenewalSubmit}
      />
    </div>
  );
}
