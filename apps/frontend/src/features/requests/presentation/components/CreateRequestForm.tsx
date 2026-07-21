import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User,
  ChevronDown,
  MapPin,
  Calendar,
  Upload,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { AssetBreadcrumb } from "@/components/layout/AssetBreadcrumb";
import { useCreateRequest } from '../hooks/useCreateRequest';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

// --- Sub-component: Success Modal ---
const SuccessModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const router = useRouter();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-md p-10 border-none bg-white shadow-2xl z-[150] [&>button]:hidden">
        <button onClick={onClose} className="absolute right-8 top-8 text-slate-400 hover:text-slate-600 transition-colors z-10">
          <X size={24} />
        </button>
        
        <div className="flex flex-col items-center text-center mt-4">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={48} />
          </div>
          
          <DialogTitle className="text-3xl font-black text-slate-800 mb-2">สร้างคำร้องสำเร็จ</DialogTitle>
          <DialogDescription className="text-slate-400 text-sm mb-8 text-center">
            ระบบได้บันทึกและส่งเรื่องคำร้องของคุณไปยังผู้เกี่ยวข้องเรียบร้อยแล้ว
          </DialogDescription>
          
          <div className="w-full space-y-4">
            <button 
              onClick={() => router.push('/user/requests')} 
              className="w-full bg-[#E9652B] hover:bg-orange-600 text-white font-bold py-4 rounded-[7px] shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
            >
              ติดตามคำร้อง
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-500 font-bold py-4 rounded-[7px] transition-all active:scale-[0.98]"
            >
              สร้างคำร้องใหม่
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const CreateRequestDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const {
    user,
    requestTypes,
    selectedTypeId,
    setSelectedTypeId,
    title,
    setTitle,
    description,
    setDescription,
    contactInfo,
    setContactInfo,
    location,
    setLocation,
    eventDate,
    setEventDate,
    files,
    handleFileChange,
    removeFile,
    uploading,
    loading,
    error,
    showSuccess,
    setShowSuccess,
    handleSubmit,
  } = useCreateRequest();

  if (!isOpen) return null;

  return (
    <>
      <SuccessModal 
        isOpen={showSuccess} 
        onClose={() => {
          setShowSuccess(false);
          onClose();
          window.location.reload();
        }} 
      />
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] transition-opacity duration-300 animate-in fade-in" 
        onClick={onClose} 
      />

      {/* Sheet Content Container */}
      <div 
        role="dialog" 
        className="fixed inset-y-0 right-0 z-[120] w-full sm:max-w-[640px] p-0 border-none bg-white flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300"
      >
        <form className="flex flex-col h-full" onSubmit={handleSubmit}>
          
          {/* Header */}
          <div className="gap-1.5 p-4 px-6 py-5 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-[7px] bg-orange-50 flex items-center justify-center">
                <FileText className="text-[#E9652B]" size={20} />
              </div>
              <h2 className="font-heading text-xl font-bold text-slate-900 tracking-tight">สร้างคำร้องใหม่</h2>
            </div>
            <button 
              type="button" 
              onClick={onClose}
              className="size-9 rounded-[7px] bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center group"
            >
              <X className="transition-transform group-hover:rotate-90" size={18} />
            </button>
          </div>

          {/* Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-[7px] p-4 flex items-center space-x-3 text-red-700">
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* 1. เลือกประเภทคำร้อง */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800 border-l-4 border-[#E9652B] pl-2.5">ประเภทการแจ้งเรื่อง</h4>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">ประเภทคำร้อง (Request Type)</label>
                <div className="relative">
                  <select 
                    value={selectedTypeId}
                    onChange={(e) => setSelectedTypeId(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E9652B]/20 focus:border-[#E9652B] transition-all font-semibold text-slate-700 appearance-none cursor-pointer"
                    required
                  >
                    <option value={0}>เลือกประเภทคำร้อง</option>
                    {requestTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            {/* 2. รายละเอียดคำร้อง */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 border-l-4 border-[#E9652B] pl-2.5">รายละเอียดหัวข้อคำร้อง</h4>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">หัวข้อเรื่อง (Title)</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ระบุหัวข้อที่ต้องการแจ้ง"
                  className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E9652B]/20 focus:border-[#E9652B] transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">รายละเอียดเพิ่มเติม (Description)</label>
                <textarea 
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="กรุณาบรรยายรายละเอียดของคำร้องอย่างครบถ้วน..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-[7px] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E9652B]/20 focus:border-[#E9652B] transition-all font-semibold text-slate-700 placeholder:text-slate-300 min-h-[85px] resize-none"
                  required
                />
              </div>
            </div>

            {/* 3. ข้อมูลติดต่อและสถานที่ */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 border-l-4 border-[#E9652B] pl-2.5">สถานที่และข้อมูลการติดต่อ</h4>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">ข้อมูลติดต่อกลับ (Contact Info)</label>
                <input 
                  type="text" 
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="อีเมล หรือ เบอร์โทรศัพท์"
                  className="w-full bg-slate-50 border border-slate-200 rounded-[7px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E9652B]/20 focus:border-[#E9652B] transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">สถานที่เกิดเหตุ (Location)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="ระบุอาคาร/ห้อง" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E9652B]/20 focus:border-[#E9652B] transition-all font-semibold text-slate-700 placeholder:text-slate-300" 
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">วันที่เกิดเหตุ (Incident Date)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      placeholder="ระบุวันที่เกิดเหตุ" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-[7px] pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E9652B]/20 focus:border-[#E9652B] transition-all font-semibold text-slate-700 placeholder:text-slate-300" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. แนบไฟล์ประกอบ */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 border-l-4 border-[#E9652B] pl-2.5">เอกสารแนบประกอบ</h4>
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">รูปภาพหรือไฟล์หลักฐานประกอบการแจ้งคำร้อง</label>
                <label className="relative rounded-md p-6 border-2 border-dashed flex flex-col items-center justify-center text-center transition-all min-h-[110px] border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-100/50">
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                  <div>
                    <Upload className="text-slate-400 mx-auto mb-1" size={20} />
                    <p className="text-xs font-bold text-slate-700">คลิกเพื่ออัปโหลดไฟล์หลักฐาน</p>
                  </div>
                </label>

                {files.length > 0 && (
                  <div className="mt-4 text-left space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">ไฟล์ที่เลือก ({files.length})</p>
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-[7px] border border-slate-100">
                        <span className="text-xs text-slate-600 truncate max-w-[400px]">{file.name}</span>
                        <button 
                          type="button" 
                          onClick={() => removeFile(idx)} 
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-slate-100 flex items-center gap-4 bg-white/90 backdrop-blur-md shrink-0">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 h-12 rounded-[7px] font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-sm"
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              disabled={loading || uploading}
              className="flex-1 h-12 rounded-[7px] bg-[#E9652B] hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} className="transform rotate-45" />
              {loading ? "กำลังส่งข้อมูล..." : uploading ? "กำลังอัปโหลดไฟล์..." : "ส่งเรื่องคำร้อง"}
            </button>
          </div>

        </form>
      </div>
    </>
  );
};

// --- Form Component ---
export const CreateRequestForm = () => {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    requestTypes,
    selectedTypeId,
    setSelectedTypeId,
    title,
    setTitle,
    description,
    setDescription,
    contactInfo,
    setContactInfo,
    location,
    setLocation,
    eventDate,
    setEventDate,
    files,
    handleFileChange,
    removeFile,
    uploading,
    loading,
    error,
    showSuccess,
    setShowSuccess,
    handleSubmit,
  } = useCreateRequest();

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <SuccessModal isOpen={showSuccess} onClose={() => {
        setShowSuccess(false);
        window.location.reload();
      }} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className='mb-4'>
          <AssetBreadcrumb
            items={[
              { label: "หน้าหลัก", href: "/" },
              { label: "คำร้องขอ", href: "/user/requests" },
              { label: "สร้างคำร้องใหม่" }
            ]}
          />
        </div>

        {/* Header Section */}
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mt-3">สร้างคำร้องใหม่</h2>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed max-w-2xl">
            กรุณากรอกรายละเอียดด้านล่างเพื่อแจ้งความประสงค์ สอบถาม หรือร้องเรียนเกี่ยวกับ
            สินทรัพย์ของมหาวิทยาลัย ทีมงานจะดำเนินการตรวจสอบและตอบกลับโดยเร็วที่สุด
          </p>
        </header>

        {/* Auth status banner */}
        {user ? (
          <div className="bg-green-50 border border-green-100 rounded-md p-4 flex items-center space-x-4 mb-8">
            <div className="bg-green-500 p-2 rounded-[7px] text-white">
              <User size={20} />
            </div>
            <div>
              <h4 className="text-green-800 font-bold text-sm">เข้าใช้งานในชื่อ คุณ {user.first_name} {user.last_name} ({user.role})</h4>
              <p className="text-green-600/80 text-xs">ระบบได้กรอกข้อมูลติดต่อของคุณให้เรียบร้อยแล้วโดยอัตโนมัติ</p>
            </div>
          </div>
        ) : (
          <div className="bg-[#E3F2FD] border border-blue-100 rounded-md p-4 flex items-center space-x-4 mb-8">
            <div className="bg-blue-500 p-2 rounded-[7px] text-white">
              <User size={20} />
            </div>
            <div>
              <h4 className="text-blue-800 font-bold text-sm">คุณกำลังเข้าใช้งานในโหมดผู้เยี่ยมชม</h4>
              <p className="text-blue-600/80 text-xs">กรุณาระบุข้อมูลติดต่อเพื่อให้เจ้าหน้าที่สามารถประสานงานกลับไปได้</p>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-3 mb-8 text-red-700">
            <AlertCircle size={20} className="shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form Details */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-md p-8 shadow-sm border border-gray-100">
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">ประเภทคำร้อง</label>
                  <div className="relative">
                    <select 
                      value={selectedTypeId}
                      onChange={(e) => setSelectedTypeId(Number(e.target.value))}
                      className="w-full bg-gray-100 border-none rounded-[7px] py-3 px-4 appearance-none text-gray-600 outline-none cursor-pointer"
                    >
                      <option value={0}>เลือกประเภทคำร้อง</option>
                      {requestTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">หัวข้อ</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ระบุหัวข้อที่ต้องการแจ้ง"
                    className="w-full bg-gray-100 border-none rounded-[7px] py-3 px-4 outline-none text-gray-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">รายละเอียด</label>
                  <textarea 
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="กรุณาบรรยายรายละเอียดของคำร้องอย่างครบถ้วน..."
                    className="w-full bg-gray-100 border-none rounded-[7px] py-4 px-4 outline-none resize-none text-gray-700"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Contact & Metadata */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-md p-6 shadow-sm border-t-4 border-t-[#E9652B] border border-gray-100">
                <div className="flex items-center text-sm font-bold text-gray-700 mb-4">
                  <User size={16} className="mr-2 text-gray-400" /> ข้อมูลติดต่อ
                </div>
                <input 
                  type="text" 
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="อีเมล หรือ เบอร์โทรศัพท์"
                  className="w-full bg-gray-100 border-none rounded-[7px] py-3 px-4 text-sm outline-none text-gray-700"
                  required
                />
              </div>

              <div className="bg-white rounded-md p-6 shadow-sm border border-gray-100 space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block">สถานที่ (Required)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="ระบุอาคาร/ห้อง" 
                      className="w-full bg-gray-100 border-none rounded-[7px] py-2.5 pl-10 pr-4 text-sm outline-none text-gray-700" 
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase mb-2 block">วันที่เกิดเหตุ (Optional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      placeholder="เช่น mm/dd/yyyy หรือ ระบุวันที่" 
                      className="w-full bg-gray-100 border-none rounded-[7px] py-2.5 pl-10 pr-4 text-sm outline-none text-gray-700" 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-md p-6 shadow-sm border border-gray-100 text-center">
                <label className="text-[11px] font-bold text-gray-400 uppercase mb-3 block">แนบไฟล์ประกอบ</label>
                <label className="border-2 border-dashed border-gray-100 rounded-md p-6 flex flex-col items-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload className="text-orange-300 mb-2" size={24} />
                  <span className="text-xs font-bold text-gray-600">คลิกเพื่ออัปโหลด</span>
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                </label>

                {files.length > 0 && (
                  <div className="mt-4 text-left space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">ไฟล์ที่เลือก ({files.length})</p>
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-[7px] border border-gray-100">
                        <span className="text-xs text-gray-600 truncate max-w-[180px]">{file.name}</span>
                        <button 
                          type="button" 
                          onClick={() => removeFile(idx)} 
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <footer className="mt-10 pt-8 border-t border-gray-200 flex justify-end items-center space-x-6">
            <button 
              type="button" 
              onClick={() => router.push('/user/requests')}
              className="text-gray-500 font-bold hover:text-gray-700 transition-colors"
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              disabled={loading || uploading}
              className="bg-[#E9652B] text-white px-10 py-3 rounded-[7px] font-bold flex items-center hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>กำลังส่งข้อมูล...</>
              ) : uploading ? (
                <>กำลังอัปโหลดไฟล์...</>
              ) : (
                <>
                  ส่งเรื่องคำร้อง <Send size={18} className="ml-2 transform rotate-45" />
                </>
              )}
            </button>
          </footer>
        </form>
      </main>
    </div>
  );
};