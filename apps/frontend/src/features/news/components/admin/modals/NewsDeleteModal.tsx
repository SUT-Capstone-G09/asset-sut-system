import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface NewsDeleteModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNews: any | null;
}

export const NewsDeleteModal: React.FC<NewsDeleteModalProps> = ({
  isOpen,
  onOpenChange,
  selectedNews,
}) => {
  const handleDelete = () => {
    toast.success("ลบประกาศข่าวสารเรียบร้อยแล้ว!");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>ยืนยันการลบ</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600 text-sm">
            คุณแน่ใจหรือไม่ว่าต้องการลบ <strong>{selectedNews?.title}</strong>? <br />
            การกระทำนี้ไม่สามารถย้อนกลับได้
          </p>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            ยืนยันการลบ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
