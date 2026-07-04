import React from 'react';
import { MapPin, Clock, Phone, Mail } from 'lucide-react';

export default function ContactInfoCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-slate-100">
      {/* 1. สำนักงาน */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-orange-600 font-bold text-sm">
          <MapPin size={16} />
          <h4>สำนักงาน</h4>
        </div>
        <p className="text-slate-500 text-xs leading-relaxed">
          อาคารบริหาร ชั้น 1 มหาวิทยาลัยเทคโนโลยีสุรนารี 111 ถ.มหาวิทยาลัย ต.สุรนารี อ.เมือง จ.นครราชสีมา 30000
        </p>
      </div>

      {/* 2. เวลาทำการ */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-orange-600 font-bold text-sm">
          <Clock size={16} />
          <h4>เวลาทำการ</h4>
        </div>
        <p className="text-slate-500 text-xs leading-relaxed">
          วันจันทร์ – วันศุกร์ <br />
          เวลา 08:30 – 16:30 น.
        </p>
      </div>

      {/* 3. หมายเลขโทรศัพท์ */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-orange-600 font-bold text-sm">
          <Phone size={16} />
          <h4>หมายเลขโทรศัพท์</h4>
        </div>
        <p className="text-slate-500 text-xs leading-relaxed">
          044-224-945 <br />
          เบอร์มือถือภายใน : 4945
        </p>
      </div>

      {/* 4. อีเมล */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-orange-600 font-bold text-sm">
          <Mail size={16} />
          <h4>อีเมล</h4>
        </div>
        <p className="text-slate-500 text-xs leading-relaxed">
          damtsut@g.sut.ac.th <br />
          asset.sut@gmail.com
        </p>
      </div>
    </div>
  );
}
