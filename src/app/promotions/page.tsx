"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number|null>(null);

  useEffect(() => {
    fetch('/api/events').then(r=>r.json()).then(d=>{if(d.events)setEvents(d.events)}).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans pb-28">
      <header className="sticky top-0 z-50 bg-[#0D0D0D]/90 backdrop-blur-xl px-5 py-4 border-b border-neutral-800">
        <div className="flex justify-between items-center">
          <div><h1 className="text-xl font-black">🎉 กิจกรรมแนะนำ</h1><p className="text-xs text-neutral-500">ThungmakhamMiami<span className="text-amber-500">Food</span> Seaside Restaurant</p></div>
          <a href="/" className="text-sm bg-neutral-800 text-amber-400 px-4 py-2 rounded-xl font-bold hover:bg-neutral-700 transition">← เมนู</a>
        </div>
      </header>
      <main className="max-w-lg mx-auto p-4 space-y-5">
        {loading ? <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"/></div>
        : events.length === 0 ? <div className="text-center py-20 text-neutral-600"><p className="text-5xl mb-4">🎉</p><p className="font-bold text-neutral-400">ยังไม่มีกิจกรรมในขณะนี้</p></div>
        : events.map(ev => (
          <div key={ev.id} onClick={()=>setActiveId(activeId===ev.id?null:ev.id)} className="bg-neutral-900 rounded-[24px] overflow-hidden border border-neutral-800 hover:border-amber-500/30 transition-all group cursor-pointer">
            <div className="aspect-[16/9] relative overflow-hidden">
              {ev.image ? <Image src={ev.image} alt={ev.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700"/> : <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-5xl">🎉</div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"/>
              {ev.badge && <span className={`absolute top-4 left-4 ${ev.badgeColor||'bg-amber-500'} text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg`}>{ev.badge}</span>}
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-black leading-tight mb-1 drop-shadow-lg">{ev.title}</h3>
                {ev.subtitle && <p className="text-xs text-neutral-300">{ev.subtitle}</p>}
              </div>
            </div>
            <div className="p-4">
              {ev.price && <span className="text-amber-400 font-black text-lg">{ev.price}</span>}
              <div className={`overflow-hidden transition-all duration-500 ${activeId===ev.id?'max-h-40 opacity-100 mt-2':'max-h-0 opacity-0'}`}>
                <p className="text-sm text-neutral-400 leading-relaxed">{ev.description}</p>
              </div>
              {activeId!==ev.id && <p className="text-xs text-neutral-600 mt-1">แตะเพื่อดูรายละเอียด →</p>}
            </div>
          </div>
        ))}
        <div className="text-center py-6 text-neutral-700"><p className="text-xs">* เงื่อนไขเป็นไปตามที่ร้านกำหนด</p></div>
      </main>
      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 w-full bg-[#0D0D0D]/95 backdrop-blur-xl border-t border-neutral-800 pb-safe z-50">
        <div className="flex items-center justify-around max-w-md mx-auto py-3">
          <a href="/" className="flex flex-col items-center gap-0.5 text-neutral-600"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg><span className="text-[10px] font-bold">เมนู</span></a>
          <div className="flex flex-col items-center gap-0.5 text-amber-500"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M5.25 2.25a3 3 0 00-3 3v4.318a3 3 0 00.879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 005.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 00-2.122-.879H5.25z" clipRule="evenodd"/></svg><span className="text-[10px] font-bold">กิจกรรม</span></div>
          <button onClick={()=>alert('💳 ส่งคำขอเช็คบิลเรียบร้อย!')} className="flex flex-col items-center gap-0.5 text-neutral-600 hover:text-amber-400"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"/></svg><span className="text-[10px] font-bold">เช็คบิล</span></button>
          <button onClick={()=>alert('🔔 เรียกพนักงานเรียบร้อย!')} className="flex flex-col items-center gap-0.5 text-neutral-600 hover:text-red-400"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg><span className="text-[10px] font-bold">พนักงาน</span></button>
        </div>
      </div>
    </div>
  );
}
