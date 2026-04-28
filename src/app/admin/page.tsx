"use client";
import { useState, useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";

// File upload helper
async function uploadFile(file: File): Promise<string | null> {
  const fd = new FormData(); fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  if (res.ok) { const d = await res.json(); return d.url; }
  return null;
}

export default function Admin() {
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState<any>(null);
  const [menus, setMenus] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reportPeriod, setReportPeriod] = useState('daily');
  const [modal, setModal] = useState<any>(null); // {type, data?}

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { fetchReports(); }, [reportPeriod]);
  
  const fetchAll = () => { fetchStats(); fetchMenus(); fetchCategories(); fetchTables(); fetchEvents(); fetchReports(); fetchReservations(); fetchUsers(); };
  const fetchStats = () => fetch('/api/admin/dashboard').then(r=>r.json()).then(d=>d.stats&&setStats(d.stats)).catch(()=>{});
  const fetchMenus = () => fetch('/api/admin/menus').then(r=>r.json()).then(d=>{d.menus&&setMenus(d.menus);d.categories&&setCategories(d.categories)}).catch(()=>{});
  const fetchCategories = () => fetch('/api/admin/categories').then(r=>r.json()).then(d=>d.categories&&setCategories(d.categories)).catch(()=>{});
  const fetchTables = () => fetch('/api/admin/tables').then(r=>r.json()).then(d=>d.tables&&setTables(d.tables)).catch(()=>{});
  const fetchEvents = () => fetch('/api/admin/events').then(r=>r.json()).then(d=>d.events&&setEvents(d.events)).catch(()=>{});
  const fetchReports = () => fetch(`/api/admin/reports?period=${reportPeriod}`).then(r=>r.json()).then(d=>d.report&&setReports(d.report)).catch(()=>{});
  const fetchReservations = () => fetch('/api/reservations').then(r=>r.json()).then(d=>d.reservations&&setReservations(d.reservations)).catch(()=>{});
  const fetchUsers = () => fetch('/api/admin/users').then(r=>r.json()).then(d=>d.users&&setUsers(d.users)).catch(()=>{});

  const tabs = [
    {id:'dashboard',label:'📊 Dashboard'},
    {id:'reports',label:'📈 รายงาน'},
    {id:'reservations',label:'📅 จองโต๊ะ'},
    {id:'menus',label:'🍽 เมนู'},
    {id:'categories',label:'📁 หมวดหมู่'},
    {id:'tables',label:'🪑 โต๊ะ'},
    {id:'events',label:'🎉 กิจกรรม'},
    {id:'users',label:'👤 พนักงาน'},
  ];

  return (
    <AuthGuard allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans relative overflow-x-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-purple-900/20 rounded-full blur-[120px] animate-float pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-indigo-900/20 rounded-full blur-[100px] animate-float delay-300 pointer-events-none"></div>

        <header className="glass-panel-dark border-b border-slate-700/50 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 animate-scale-in"><span className="text-2xl">⚙</span></div>
          <div><h1 className="text-2xl font-black tracking-tight text-white">Admin Panel</h1><p className="text-xs text-slate-400 font-medium">ThungmakhamMiamiFood</p></div>
        </div>
        <div className="flex gap-3">
          <a href="/cashier" className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl font-bold hover:bg-emerald-500/20 transition-all active:scale-95 shadow-sm">💰 Cashier</a>
          <a href="/" className="text-xs bg-sky-500/10 text-sky-400 border border-sky-500/20 px-4 py-2 rounded-xl font-bold hover:bg-sky-500/20 transition-all active:scale-95 shadow-sm">🏠 Home</a>
        </div>
      </header>

      <nav className="glass-panel-dark border-b border-slate-700/50 px-4 overflow-x-auto sticky top-[81px] z-40">
        <div className="flex gap-2 p-2">{tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 active:scale-95 ${tab===t.id?'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30':'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>{t.label}</button>
        ))}</div>
      </nav>

      <main className="p-6 max-w-7xl mx-auto animate-slide-up relative z-10">
        {/* DASHBOARD */}
        {tab==='dashboard' && stats && (
          <div>
            <h2 className="text-3xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-sky-400">📊 Dashboard วันนี้</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              {[{l:'รายได้วันนี้',v:`฿${stats.todayRevenue?.toLocaleString()||0}`,i:'💰', c:'emerald'},{l:'ออเดอร์วันนี้',v:stats.todayOrders,i:'📦', c:'sky'},{l:'ออเดอร์ค้าง',v:stats.openOrders,i:'⏳', c:'orange'},{l:'เมนูทั้งหมด',v:stats.totalMenus,i:'🍽', c:'purple'}].map((c,i)=>(
                <div key={i} className={`glass-panel-dark rounded-3xl p-6 border border-slate-700/50 hover:-translate-y-2 hover:shadow-xl hover:shadow-${c.c}-500/20 transition-all duration-300`}>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-slate-400">{c.l}</p>
                    <span className={`text-2xl drop-shadow-md`}>{c.i}</span>
                  </div>
                  <p className={`text-4xl font-black text-${c.c}-400`}>{c.v}</p>
                </div>
              ))}
            </div>
            {stats.topItems?.length>0&&<div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h3 className="font-bold text-lg mb-4">🔥 เมนูขายดีวันนี้</h3>
              {stats.topItems.map((it:any,i:number)=>(<div key={it.menuId} className="flex items-center gap-3 mb-2"><span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${i===0?'bg-amber-500 text-white':'bg-slate-600 text-white'}`}>{i+1}</span><span className="flex-1">{it.name}</span><span className="font-bold text-sky-400">{it.totalSold} ชิ้น</span></div>))}
            </div>}
          </div>
        )}

        {/* REPORTS */}
        {tab==='reports' && reports && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">📈 รายงานยอดขาย</h2>
              <select value={reportPeriod} onChange={e=>setReportPeriod(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm focus:outline-none focus:border-purple-500">
                <option value="daily">7 วันล่าสุด</option>
                <option value="weekly">28 วันล่าสุด</option>
                <option value="monthly">6 เดือนล่าสุด</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700"><p className="text-xs text-slate-500 mb-1">ยอดขายรวม</p><p className="text-3xl font-black text-emerald-400">฿{reports.totalRevenue?.toLocaleString()}</p></div>
              <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700"><p className="text-xs text-slate-500 mb-1">จำนวนออเดอร์</p><p className="text-3xl font-black text-sky-400">{reports.totalOrders}</p></div>
            </div>
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 mb-6">
              <h3 className="font-bold mb-4">กราฟรายได้</h3>
              <div className="flex items-end gap-2 h-40">
                {reports.chartData?.map((d:any,i:number)=>{
                  const max = Math.max(...reports.chartData.map((x:any)=>x.revenue));
                  const h = max>0 ? (d.revenue/max)*100 : 0;
                  return <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full bg-purple-600/50 hover:bg-purple-500 rounded-t-sm transition-all relative" style={{height:`${h}%`}}>
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap">฿{d.revenue}</div>
                    </div>
                    <span className="text-[10px] text-slate-500 truncate w-full text-center">{d.date.split('-').pop()}</span>
                  </div>
                })}
              </div>
            </div>
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h3 className="font-bold mb-4">🏆 เมนูขายดี</h3>
              {reports.topMenus?.map((m:any,i:number)=>(<div key={m.menuId} className="flex items-center gap-3 mb-2 border-b border-slate-700/50 pb-2"><span className="text-slate-500 w-4">{i+1}.</span><span className="flex-1">{m.name}</span><span className="text-emerald-400 text-sm w-20 text-right">฿{m.revenue}</span><span className="font-bold text-sky-400 w-16 text-right">{m.sold} ชิ้น</span></div>))}
            </div>
          </div>
        )}

        {/* RESERVATIONS */}
        {tab==='reservations' && <CrudSection title="📅 รายการจองโต๊ะ" count={reservations.length} onAdd={()=>alert('ฟังก์ชันเพิ่มจองสำหรับแอดมินยังไม่เปิดให้บริการ')} headers={['ชื่อผู้จอง','เบอร์โทร','โต๊ะ','เวลา','จำนวน','สถานะ','จัดการ']} rows={reservations.map(r=>({
          id:r.id, cells:[
            <span key="n" className="font-bold">{r.customerName}</span>,
            <span key="p" className="text-sm">{r.phone}</span>,
            <span key="t" className="text-emerald-400 font-bold">{r.table?.tableNo||'ยังไม่ระบุ'}</span>,
            <span key="tm" className="text-sm">{new Date(r.reservationTime).toLocaleString('th-TH')}</span>,
            <span key="g" className="text-sky-400">{r.guestCount} คน</span>,
            <select key="s" value={r.status} onChange={async(e)=>{await fetch(`/api/reservations/${r.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:e.target.value})});fetchReservations()}} className="bg-slate-700 text-xs p-1 rounded"><option value="PENDING">Pending</option><option value="CONFIRMED">Confirmed</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select>,
            <button key="a" onClick={async()=>{if(confirm('ลบการจอง?')){await fetch(`/api/reservations/${r.id}`,{method:'DELETE'});fetchReservations()}}} className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded font-bold">🗑 ลบ</button>
          ]
        }))} />}

        {/* MENUS */}
        {tab==='menus' && <CrudSection title="🍽 จัดการเมนู" count={menus.length}
          onAdd={()=>setModal({type:'menu'})}
          headers={['เมนู','ราคา','หมวด','ประเภท','สถานะ','จัดการ']}
          rows={menus.map(m=>({
            id:m.id,
            cells:[
              <div key="n" className="flex items-center gap-2">{m.image&&<img src={m.image} className="w-10 h-10 rounded-lg object-cover"/>}<div><span className="font-bold text-sm">{m.name}</span>{m.isRecommended&&<span className="ml-1 text-[10px] bg-amber-500/20 text-amber-400 px-1 rounded">🔥</span>}</div></div>,
              <span key="p" className="text-emerald-400 font-bold">฿{m.price}</span>,
              <span key="c" className="text-sm text-slate-400">{m.category?.name}</span>,
              <span key="t" className={`text-[10px] font-bold px-2 py-1 rounded ${m.isDrink?'bg-blue-500/20 text-blue-400':'bg-orange-500/20 text-orange-400'}`}>{m.isDrink?'🍹 Drink':'🍳 Food'}</span>,
              <button key="s" onClick={async()=>{await fetch(`/api/admin/menus/${m.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:m.status==='AVAILABLE'?'OUT_OF_STOCK':'AVAILABLE'})});fetchMenus()}} className={`text-[10px] font-bold px-2 py-1 rounded cursor-pointer ${m.status==='AVAILABLE'?'bg-emerald-500/20 text-emerald-400':'bg-red-500/20 text-red-400'}`}>{m.status==='AVAILABLE'?'✅ Available':'❌ Out'}</button>,
              <div key="a" className="flex gap-1"><button onClick={()=>setModal({type:'menu',data:m})} className="text-xs bg-sky-500/20 text-sky-400 px-2 py-1 rounded font-bold">✏️</button><button onClick={async()=>{if(confirm('ลบเมนูนี้?')){await fetch(`/api/admin/menus/${m.id}`,{method:'DELETE'});fetchMenus()}}} className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded font-bold">🗑</button></div>
            ]
          }))}
        />}

        {/* CATEGORIES */}
        {tab==='categories' && <CrudSection title="📁 จัดการหมวดหมู่" count={categories.length}
          onAdd={()=>setModal({type:'category'})}
          headers={['ชื่อหมวด','ลำดับ','จำนวนเมนู','จัดการ']}
          rows={categories.map(c=>({id:c.id,cells:[
            <span key="n" className="font-bold">{c.name}</span>,
            <span key="s" className="text-slate-400">{c.sortOrder}</span>,
            <span key="c" className="text-sky-400 font-bold">{c._count?.menus||0} รายการ</span>,
            <div key="a" className="flex gap-1"><button onClick={()=>setModal({type:'category',data:c})} className="text-xs bg-sky-500/20 text-sky-400 px-2 py-1 rounded font-bold">✏️</button><button onClick={async()=>{if(confirm('ลบหมวดหมู่นี้?')){await fetch(`/api/admin/categories/${c.id}`,{method:'DELETE'});fetchCategories()}}} className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded font-bold">🗑</button></div>
          ]}))}
        />}

        {/* TABLES */}
        {tab==='tables' && <CrudSection title="🪑 จัดการโต๊ะ" count={tables.length}
          onAdd={()=>setModal({type:'table'})}
          headers={['หมายเลขโต๊ะ','สถานะ','จัดการ']}
          rows={tables.map(t=>({id:t.id,cells:[
            <span key="n" className="text-2xl font-black">{t.tableNo}</span>,
            <span key="s" className={`text-xs font-bold px-2 py-1 rounded ${t.status==='AVAILABLE'?'bg-emerald-500/20 text-emerald-400':'bg-orange-500/20 text-orange-400'}`}>{t.status}</span>,
            <div key="a" className="flex gap-1">
              <button onClick={()=>window.open(`/api/qrcode?tableNo=${t.tableNo}`, '_blank')} className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded font-bold">QR</button>
              <button onClick={()=>setModal({type:'table',data:t})} className="text-xs bg-sky-500/20 text-sky-400 px-2 py-1 rounded font-bold">✏️</button>
              <button onClick={async()=>{if(confirm('ลบโต๊ะนี้?')){await fetch(`/api/admin/tables/${t.id}`,{method:'DELETE'});fetchTables()}}} className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded font-bold">🗑</button>
            </div>
          ]}))}
        />}

        {/* EVENTS */}
        {tab==='events' && <CrudSection title="🎉 จัดการกิจกรรม" count={events.length}
          onAdd={()=>setModal({type:'event'})}
          headers={['กิจกรรม','Badge','สถานะ','จัดการ']}
          rows={events.map(e=>({id:e.id,cells:[
            <div key="n" className="flex items-center gap-2">{e.image&&<img src={e.image} className="w-10 h-10 rounded-lg object-cover"/>}<div><span className="font-bold text-sm">{e.title}</span>{e.subtitle&&<p className="text-[10px] text-slate-500">{e.subtitle}</p>}</div></div>,
            <span key="b" className={`text-[10px] font-bold px-2 py-1 rounded ${e.badgeColor||'bg-amber-500'} text-white`}>{e.badge||'-'}</span>,
            <button key="s" onClick={async()=>{await fetch(`/api/admin/events/${e.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({isActive:!e.isActive})});fetchEvents()}} className={`text-[10px] font-bold px-2 py-1 rounded cursor-pointer ${e.isActive?'bg-emerald-500/20 text-emerald-400':'bg-red-500/20 text-red-400'}`}>{e.isActive?'✅ Active':'❌ Hidden'}</button>,
            <div key="a" className="flex gap-1"><button onClick={()=>setModal({type:'event',data:e})} className="text-xs bg-sky-500/20 text-sky-400 px-2 py-1 rounded font-bold">✏️</button><button onClick={async()=>{if(confirm('ลบกิจกรรมนี้?')){await fetch(`/api/admin/events/${e.id}`,{method:'DELETE'});fetchEvents()}}} className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded font-bold">🗑</button></div>
          ]}))}
        />}

        {/* USERS */}
        {tab==='users' && <CrudSection title="👤 จัดการพนักงาน" count={users.length}
          onAdd={()=>setModal({type:'user'})}
          headers={['รหัสพนักงาน','ชื่อ','ตำแหน่ง','จัดการ']}
          rows={users.map(u=>({id:u.id,cells:[
            <span key="e" className="font-mono text-slate-400">{u.empId}</span>,
            <span key="n" className="font-bold">{u.name}</span>,
            <span key="r" className="text-emerald-400 font-bold">{u.role}</span>,
            <div key="a" className="flex gap-1"><button onClick={()=>setModal({type:'user',data:u})} className="text-xs bg-sky-500/20 text-sky-400 px-2 py-1 rounded font-bold">✏️</button><button onClick={async()=>{if(confirm('ลบพนักงาน?')){await fetch(`/api/admin/users/${u.id}`,{method:'DELETE'});fetchUsers()}}} className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded font-bold">🗑</button></div>
          ]}))}
        />}
      </main>

        {modal && <FormModal modal={modal} categories={categories} onClose={()=>setModal(null)} onSaved={()=>{setModal(null);fetchAll()}} />}
      </div>
    </AuthGuard>
  );
}

// Reusable table section
function CrudSection({title,count,onAdd,headers,rows}:{title:string,count:number,onAdd:()=>void,headers:string[],rows:{id:number,cells:React.ReactNode[]}[]}) {
  return <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-black">{title} ({count})</h2>
      <button onClick={onAdd} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl shadow-lg shadow-purple-600/30">+ เพิ่มใหม่</button>
    </div>
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      <table className="w-full"><thead><tr className="bg-slate-700/50 text-slate-400 text-xs uppercase">
        {headers.map(h=><th key={h} className="p-3 text-left">{h}</th>)}
      </tr></thead><tbody>
        {rows.map(r=><tr key={r.id} className="border-t border-slate-700/50 hover:bg-slate-700/30">
          {r.cells.map((c,i)=><td key={i} className="p-3">{c}</td>)}
        </tr>)}
      </tbody></table>
    </div>
  </div>;
}

// Unified form modal
function FormModal({modal,categories,onClose,onSaved}:{modal:any,categories:any[],onClose:()=>void,onSaved:()=>void}) {
  const isEdit = !!modal.data;
  const d = modal.data || {};
  const [form, setForm] = useState<any>({
    name:d.name||'', title:d.title||'', subtitle:d.subtitle||'', description:d.description||'',
    price:d.price?.toString()||'', image:d.image||'', categoryId:d.categoryId?.toString()||'',
    isDrink:d.isDrink||false, isRecommended:d.isRecommended||false, tableNo:d.tableNo||'',
    badge:d.badge||'', badgeColor:d.badgeColor||'bg-amber-500', sortOrder:d.sortOrder?.toString()||'0',
    status:d.status||'AVAILABLE', isActive:d.isActive??true,
  });
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(d.image||'');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    if(url) { setForm({...form, image:url}); setPreview(url); }
    else alert('อัพโหลดไม่สำเร็จ');
    setUploading(false);
  };

  const handleSave = async () => {
    const t = modal.type;
    let url = '', method = isEdit?'PATCH':'POST', body: any = {};

    if(t==='menu') {
      url = isEdit?`/api/admin/menus/${d.id}`:'/api/admin/menus';
      body = {name:form.name,price:parseFloat(form.price),image:form.image||null,categoryId:parseInt(form.categoryId),isDrink:form.isDrink,isRecommended:form.isRecommended};
    } else if(t==='category') {
      url = isEdit?`/api/admin/categories/${d.id}`:'/api/admin/categories';
      body = {name:form.name,sortOrder:parseInt(form.sortOrder)||0};
    } else if(t==='table') {
      url = isEdit?`/api/admin/tables/${d.id}`:'/api/admin/tables';
      body = {tableNo:form.tableNo};
    } else if(t==='event') {
      url = isEdit?`/api/admin/events/${d.id}`:'/api/admin/events';
      body = {title:form.title,subtitle:form.subtitle||null,description:form.description||null,image:form.image||null,badge:form.badge||null,badgeColor:form.badgeColor,price:form.price||null,sortOrder:parseInt(form.sortOrder)||0,isActive:form.isActive};
    } else if(t==='user') {
      url = isEdit?`/api/admin/users/${d.id}`:'/api/admin/users';
      body = {name:form.name, role:form.role||'Staff'};
      if (form.pin) body.pin = form.pin;
    }

    const res = await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(res.ok) onSaved(); else alert('เกิดข้อผิดพลาด');
  };

  const labels: Record<string,string> = {menu:'เมนู',category:'หมวดหมู่',table:'โต๊ะ',event:'กิจกรรม'};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl w-full max-w-md mx-4 p-6 border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
        <h3 className="text-xl font-black mb-4">{isEdit?'✏️ แก้ไข':'➕ เพิ่ม'}{labels[modal.type]}</h3>
        <div className="space-y-3">
          {/* Menu fields */}
          {modal.type==='menu' && <>
            <Input label="ชื่อเมนู" value={form.name} onChange={v=>setForm({...form,name:v})} />
            <Input label="ราคา (บาท)" value={form.price} onChange={v=>setForm({...form,price:v})} type="number" />
            <div>
              <label className="text-xs text-slate-400 mb-1 block">รูปภาพ</label>
              {preview && <img src={preview} className="w-20 h-20 rounded-xl object-cover mb-2" />}
              <input type="file" accept="image/*" onChange={handleUpload} className="text-sm text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:font-bold file:text-xs file:cursor-pointer" />
              {uploading && <span className="text-xs text-amber-400 ml-2">กำลังอัพโหลด...</span>}
            </div>
            <Select label="หมวดหมู่" value={form.categoryId} onChange={v=>setForm({...form,categoryId:v})} options={categories.map(c=>({value:String(c.id),label:c.name}))} />
            <div className="flex gap-4">
              <Check label="เครื่องดื่ม" checked={form.isDrink} onChange={v=>setForm({...form,isDrink:v})} />
              <Check label="แนะนำ (HOT)" checked={form.isRecommended} onChange={v=>setForm({...form,isRecommended:v})} />
            </div>
          </>}

          {/* Category fields */}
          {modal.type==='category' && <>
            <Input label="ชื่อหมวดหมู่" value={form.name} onChange={v=>setForm({...form,name:v})} />
            <Input label="ลำดับการแสดง" value={form.sortOrder} onChange={v=>setForm({...form,sortOrder:v})} type="number" />
          </>}

          {/* Table fields */}
          {modal.type==='table' && <>
            <Input label="หมายเลขโต๊ะ" value={form.tableNo} onChange={v=>setForm({...form,tableNo:v})} />
          </>}

          {/* Event fields */}
          {modal.type==='event' && <>
            <Input label="ชื่อกิจกรรม" value={form.title} onChange={v=>setForm({...form,title:v})} />
            <Input label="รายละเอียดย่อ" value={form.subtitle} onChange={v=>setForm({...form,subtitle:v})} />
            <div>
              <label className="text-xs text-slate-400 mb-1 block">รายละเอียด</label>
              <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="w-full bg-slate-700 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 text-white" rows={3} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">รูปภาพ</label>
              {preview && <img src={preview} className="w-full h-32 rounded-xl object-cover mb-2" />}
              <input type="file" accept="image/*" onChange={handleUpload} className="text-sm text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:font-bold file:text-xs file:cursor-pointer" />
              {uploading && <span className="text-xs text-amber-400 ml-2">กำลังอัพโหลด...</span>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Badge" value={form.badge} onChange={v=>setForm({...form,badge:v})} placeholder="เช่น HOT 🔥" />
              <Input label="ราคา/ข้อความ" value={form.price} onChange={v=>setForm({...form,price:v})} placeholder="เช่น ฿599" />
            </div>
            <Input label="ลำดับ" value={form.sortOrder} onChange={v=>setForm({...form,sortOrder:v})} type="number" />
            <Check label="แสดงผล (Active)" checked={form.isActive} onChange={v=>setForm({...form,isActive:v})} />
          </>}

          {/* User fields */}
          {modal.type==='user' && <>
            <Input label="ชื่อพนักงาน" value={form.name} onChange={v=>setForm({...form,name:v})} />
            <Input label="PIN (4-6 หลัก)" value={form.pin||''} onChange={v=>setForm({...form,pin:v})} type="password" />
            <Select label="ตำแหน่ง" value={form.role||'Staff'} onChange={v=>setForm({...form,role:v})} options={[
              {value:'Admin',label:'Admin (จัดการระบบ)'},
              {value:'Cashier',label:'Cashier (เก็บเงิน)'},
              {value:'Kitchen',label:'Kitchen (ห้องครัว)'},
              {value:'Bar',label:'Bar (บาร์น้ำ)'},
              {value:'Staff',label:'Staff (พนักงานเสิร์ฟ)'}
            ]} />
          </>}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button onClick={onClose} className="py-3 bg-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-600">ยกเลิก</button>
          <button onClick={handleSave} className="py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-600/30">{isEdit?'บันทึก':'เพิ่ม'}</button>
        </div>
      </div>
    </div>
  );
}

// Helper components
function Input({label,value,onChange,type='text',placeholder=''}:{label:string,value:string,onChange:(v:string)=>void,type?:string,placeholder?:string}) {
  return <div><label className="text-xs text-slate-400 mb-1 block">{label}</label><input value={value} onChange={e=>onChange(e.target.value)} type={type} placeholder={placeholder} className="w-full bg-slate-700 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 text-white" /></div>;
}
function Select({label,value,onChange,options}:{label:string,value:string,onChange:(v:string)=>void,options:{value:string,label:string}[]}) {
  return <div><label className="text-xs text-slate-400 mb-1 block">{label}</label><select value={value} onChange={e=>onChange(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 text-white"><option value="">-- เลือก --</option>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>;
}
function Check({label,checked,onChange}:{label:string,checked:boolean,onChange:(v:boolean)=>void}) {
  return <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} className="w-4 h-4 accent-purple-500" /><span className="text-sm">{label}</span></label>;
}

