"use client";
import { useState, useEffect } from "react";

export default function ReservationPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [form, setForm] = useState({ customerName: '', phone: '', reservationTime: '', guestCount: '2', tableId: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { fetch('/api/admin/tables').then(r => r.json()).then(d => d.tables && setTables(d.tables)).catch(() => {}); }, []);

  const handleSubmit = async () => {
    if (!form.customerName || !form.phone || !form.reservationTime) { alert('กรุณากรอกข้อมูลให้ครบ'); return; }
    const res = await fetch('/api/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) setSubmitted(true);
    else alert('เกิดข้อผิดพลาด');
  };

  if (submitted) return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center text-white">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-black mb-2">จองโต๊ะสำเร็จ!</h2>
        <p className="text-neutral-400 mb-6">ทางร้านจะติดต่อกลับเพื่อยืนยันการจอง</p>
        <a href="/" className="bg-amber-500 text-black font-bold px-6 py-3 rounded-2xl">← กลับหน้าเมนู</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans pb-10">
      <header className="sticky top-0 z-50 bg-[#0D0D0D]/90 backdrop-blur-xl px-5 py-4 border-b border-neutral-800">
        <div className="flex justify-between items-center">
          <div><h1 className="text-xl font-black">📅 จองโต๊ะ</h1><p className="text-xs text-neutral-500">TKM<span className="text-amber-500">FOOD</span> Seaside Restaurant</p></div>
          <a href="/" className="text-sm bg-neutral-800 text-amber-400 px-4 py-2 rounded-xl font-bold">← เมนู</a>
        </div>
      </header>
      <div className="max-w-md mx-auto p-5 space-y-4">
        <div><label className="text-xs text-neutral-400 mb-1 block">ชื่อผู้จอง *</label><input value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm focus:border-amber-500 focus:outline-none" placeholder="ชื่อ-นามสกุล" /></div>
        <div><label className="text-xs text-neutral-400 mb-1 block">เบอร์โทร *</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm focus:border-amber-500 focus:outline-none" placeholder="0xx-xxx-xxxx" /></div>
        <div><label className="text-xs text-neutral-400 mb-1 block">วันเวลาที่ต้องการจอง *</label><input type="datetime-local" value={form.reservationTime} onChange={e => setForm({ ...form, reservationTime: e.target.value })} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm focus:border-amber-500 focus:outline-none" /></div>
        <div><label className="text-xs text-neutral-400 mb-1 block">จำนวนคน</label>
          <div className="flex gap-2">{['1','2','3','4','5','6','8','10'].map(n => (
            <button key={n} onClick={() => setForm({ ...form, guestCount: n })} className={`px-3 py-2 rounded-xl text-sm font-bold ${form.guestCount === n ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-400'}`}>{n}</button>
          ))}</div>
        </div>
        <div><label className="text-xs text-neutral-400 mb-1 block">เลือกโต๊ะ (ถ้ามี)</label>
          <select value={form.tableId} onChange={e => setForm({ ...form, tableId: e.target.value })} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm focus:border-amber-500 focus:outline-none">
            <option value="">ให้ทางร้านจัดให้</option>
            {tables.map(t => <option key={t.id} value={t.id}>โต๊ะ {t.tableNo}</option>)}
          </select>
        </div>
        <button onClick={handleSubmit} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black text-lg py-4 rounded-2xl shadow-lg shadow-amber-500/30 active:scale-95 transition-all">ยืนยันการจอง</button>
      </div>
    </div>
  );
}
