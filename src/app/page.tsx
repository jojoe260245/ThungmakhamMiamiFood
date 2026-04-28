"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";

function CustomerMenuContent() {
  const searchParams = useSearchParams();
  const tableNo = searchParams.get("table");
  const token = searchParams.get("token");

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Options Modal
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [spicyLevel, setSpicyLevel] = useState("ปกติ");
  const [tasteOption, setTasteOption] = useState("");
  const [sweetness, setSweetness] = useState("ปกติ");
  const [note, setNote] = useState("");

  // Block access without QR
  if (!tableNo || !token) {
    return (
      <main className="min-h-screen bg-[#0D0D0D] flex items-center justify-center text-white p-6">
        <div className="text-center max-w-sm">
          <div className="text-7xl mb-6">📱</div>
          <h1 className="text-2xl font-black mb-3">กรุณาสแกน QR Code</h1>
          <p className="text-neutral-400 text-sm mb-6">เพื่อสั่งอาหาร กรุณาสแกน QR Code ที่โต๊ะของคุณ หรือขอ QR Code จากพนักงาน</p>
          <a href="/login" className="text-amber-400 text-sm font-bold hover:underline">สำหรับพนักงาน →</a>
        </div>
      </main>
    );
  }

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    fetch("/api/menus").then(r => r.json()).then(d => {
      if (d.categories) { setCategories(d.categories); }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const addItem = useCartStore(s => s.addItem);
  const updateQuantity = useCartStore(s => s.updateQuantity);
  const cartItems = useCartStore(s => s.items);
  const totalItems = useCartStore(s => s.getTotalItems());
  const totalPrice = useCartStore(s => s.getTotalPrice());

  const openOptionsModal = (item: any) => {
    if (item.status === 'OUT_OF_STOCK') { showToast('❌ เมนูนี้หมดแล้ว'); return; }
    setSelectedItem(item); setSpicyLevel("ปกติ"); setTasteOption(""); setSweetness("ปกติ"); setNote(""); setIsOptionsOpen(true);
  };

  const confirmAdd = () => {
    if (!selectedItem) return;
    let finalNote = note ? `โน้ต: ${note}` : "";
    const options: string[] = [];
    if (selectedItem.isDrink) { if (sweetness !== "ปกติ") options.push(`หวาน ${sweetness}`); }
    else { if (spicyLevel !== "ปกติ") options.push(spicyLevel); if (tasteOption) options.push(`เน้น${tasteOption}`); }
    if (options.length > 0) finalNote = `[${options.join(", ")}] ` + finalNote;
    addItem({ menuId: selectedItem.id, name: selectedItem.name, price: selectedItem.price, quantity: 1, image: selectedItem.image, note: finalNote || undefined });
    setIsOptionsOpen(false);
    showToast(`✅ เพิ่ม "${selectedItem.name}" แล้ว`);
  };

  const allMenus = categories.flatMap(c => c.menus || []);
  const trending = allMenus.filter((m: any) => m.isRecommended);
  let filtered = activeCategory ? categories.find(c => c.id === activeCategory)?.menus || [] : allMenus;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = allMenus.filter((m: any) => m.name.toLowerCase().includes(q));
  }

  const handleSubmitOrder = async () => {
    if (isSubmitting || cartItems.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNo, token, items: cartItems, total: totalPrice }),
      });
      if (res.ok) {
        showToast("✅ ส่งออเดอร์เข้าครัวเรียบร้อย!");
        useCartStore.getState().clearCart();
        setIsCartOpen(false);
      } else {
        const err = await res.json();
        showToast(`❌ ${err.error || "เกิดข้อผิดพลาด"}`);
      }
    } catch { showToast("❌ เชื่อมต่อไม่ได้"); }
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] pb-28 font-sans text-white">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm animate-slide-up border border-slate-700">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0D0D0D]/90 backdrop-blur-xl px-5 pt-4 pb-3">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-xl font-black tracking-tight">ThungmakhamMiami<span className="text-amber-500">Food</span></h1>
            <p className="text-[10px] text-neutral-500 font-medium tracking-widest uppercase">โต๊ะ {tableNo}</p>
          </div>
          <a href={`/orders?table=${tableNo}&token=${token}`} className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition">
            <span className="text-lg">📋</span>
          </a>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); if (e.target.value) setActiveCategory(null); }}
            placeholder="ค้นหาเมนู..." className="w-full bg-neutral-800/80 rounded-2xl px-4 py-3 pl-10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
          <span className="absolute left-3 top-3.5 text-neutral-500">🔍</span>
          {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-3 text-neutral-500 hover:text-white">✕</button>}
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-1 px-1">
          <button onClick={() => { setActiveCategory(null); setSearchQuery(""); }} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${!activeCategory && !searchQuery ? "bg-amber-500 text-black shadow-lg" : "bg-neutral-800 text-neutral-400"}`}>ทั้งหมด</button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setSearchQuery(""); }} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeCategory === cat.id ? "bg-amber-500 text-black shadow-lg" : "bg-neutral-800 text-neutral-400"}`}>{cat.name}</button>
          ))}
        </div>
      </header>

      {/* Trending */}
      {trending.length > 0 && !activeCategory && !searchQuery && (
        <section className="px-5 mt-4">
          <h2 className="text-lg font-black mb-3">🔥 <span className="text-amber-500">แนะนำ</span></h2>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x">
            {trending.map((item: any) => (
              <div key={`t-${item.id}`} onClick={() => openOptionsModal(item)} className="min-w-[240px] rounded-3xl overflow-hidden relative cursor-pointer group snap-start flex-shrink-0">
                <div className="aspect-[16/10] relative bg-neutral-800">
                  {item.image && <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-bold text-sm mb-1">{item.name}</p>
                  <span className="text-amber-400 font-black text-lg">฿{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Loading */}
      {isLoading && <div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" /></div>}

      {/* Menu Grid */}
      {!isLoading && (
        <section className="px-5 mt-4">
          <h2 className="text-lg font-black mb-3">
            {searchQuery ? `ค้นหา "${searchQuery}"` : activeCategory ? categories.find(c => c.id === activeCategory)?.name : "เมนูทั้งหมด"}
            <span className="text-neutral-600 text-sm font-medium ml-2">({filtered.length})</span>
          </h2>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-neutral-500"><p className="text-4xl mb-3">🍽</p><p className="font-bold">ไม่พบเมนู</p></div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((item: any) => (
                <div key={item.id} onClick={() => openOptionsModal(item)}
                  className={`rounded-3xl overflow-hidden cursor-pointer group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-white/5 bg-neutral-900 ${item.status === 'OUT_OF_STOCK' ? 'opacity-50' : ''}`}>
                  <div className="aspect-square relative overflow-hidden bg-neutral-800">
                    {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-3xl text-neutral-600">🍽</div>}
                    {item.status === 'OUT_OF_STOCK' && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-white font-black text-lg bg-red-500 px-3 py-1 rounded-full">หมด</span></div>}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-white leading-tight line-clamp-1 mb-1">{item.name}</p>
                    <span className="text-amber-400 font-black text-base">฿{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 w-full bg-[#0D0D0D]/95 backdrop-blur-xl border-t border-neutral-800 pb-safe z-50">
        <div className="flex items-center justify-around max-w-md mx-auto py-2">
          <div className="flex flex-col items-center gap-0.5 text-amber-500"><span className="text-xl">🏠</span><span className="text-[10px] font-bold">เมนู</span></div>
          <a href="/promotions" className="flex flex-col items-center gap-0.5 text-neutral-600 hover:text-neutral-400"><span className="text-xl">🏷️</span><span className="text-[10px] font-bold">โปรโมชัน</span></a>
          <button onClick={() => setIsCartOpen(true)} className="relative -mt-6 w-14 h-14 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg shadow-amber-500/40 hover:bg-amber-400 active:scale-90 transition-all">
            🛒{totalItems > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">{totalItems}</span>}
          </button>
          <a href={`/orders?table=${tableNo}&token=${token}`} className="flex flex-col items-center gap-0.5 text-neutral-600 hover:text-amber-400"><span className="text-xl">📋</span><span className="text-[10px] font-bold">สถานะ</span></a>
          <button onClick={() => showToast("🔔 เรียกพนักงานเรียบร้อย!")} className="flex flex-col items-center gap-0.5 text-neutral-600 hover:text-red-400"><span className="text-xl">🔔</span><span className="text-[10px] font-bold">พนักงาน</span></button>
        </div>
      </div>

      {/* Options Modal */}
      {isOptionsOpen && selectedItem && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsOptionsOpen(false)}>
          <div className="bg-[#1A1A1A] w-full max-w-md rounded-t-[30px] flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mt-3 mb-2" />
            <div className="px-5 pb-3 flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-neutral-800 relative overflow-hidden flex-shrink-0">
                {selectedItem.image && <Image src={selectedItem.image} alt={selectedItem.name} fill className="object-cover" />}
              </div>
              <div>
                <h3 className="font-bold text-lg text-white leading-tight mb-1">{selectedItem.name}</h3>
                <span className="text-amber-400 font-black text-xl">฿{selectedItem.price}</span>
              </div>
            </div>
            <div className="px-5 py-4 overflow-y-auto flex-1 border-t border-neutral-800">
              {selectedItem.isDrink ? (
                <div className="mb-5">
                  <h4 className="font-bold text-neutral-300 mb-3 text-sm">ระดับความหวาน</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {["ปกติ", "0%", "25%", "50%", "100%"].map(l => (
                      <button key={l} onClick={() => setSweetness(l)} className={`py-2.5 rounded-xl text-sm font-bold transition-all ${sweetness === l ? "bg-amber-500 text-black" : "bg-neutral-800 text-neutral-400"}`}>{l}</button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-5">
                    <h4 className="font-bold text-neutral-300 mb-3 text-sm">ระดับความเผ็ด 🌶</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {["ปกติ", "ไม่เผ็ด", "เผ็ดน้อย", "เผ็ดมาก"].map(l => (
                        <button key={l} onClick={() => setSpicyLevel(l)} className={`py-2.5 rounded-xl text-sm font-bold transition-all ${spicyLevel === l ? "bg-amber-500 text-black" : "bg-neutral-800 text-neutral-400"}`}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-5">
                    <h4 className="font-bold text-neutral-300 mb-3 text-sm">รสชาติที่ชอบ</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {["เปรี้ยว", "เค็ม", "หวาน"].map(t => (
                        <button key={t} onClick={() => setTasteOption(t === tasteOption ? "" : t)} className={`py-2 rounded-xl text-sm font-bold transition-all ${tasteOption === t ? "bg-amber-500 text-black" : "bg-neutral-800 text-neutral-400"}`}>เน้น{t}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <div>
                <h4 className="font-bold text-neutral-300 mb-2 text-sm">โน้ตเพิ่มเติม</h4>
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="เช่น ไม่ใส่ผัก, แยกน้ำ" className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500" rows={2} />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-neutral-800 pb-safe">
              <button onClick={confirmAdd} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black text-base py-4 rounded-2xl shadow-lg shadow-amber-500/30 active:scale-95 transition-all">เพิ่มลงตะกร้า — ฿{selectedItem.price}</button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      <div className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} onClick={() => setIsCartOpen(false)}>
        <div className={`absolute bottom-0 left-0 w-full bg-[#1A1A1A] rounded-t-3xl shadow-2xl transition-transform duration-300 h-[85vh] flex flex-col ${isCartOpen ? "translate-y-0" : "translate-y-full"}`} onClick={e => e.stopPropagation()}>
          <div className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mt-3 cursor-pointer" onClick={() => setIsCartOpen(false)} />
          <div className="px-5 py-3 border-b border-neutral-800 flex justify-between items-center">
            <h2 className="text-xl font-black text-white">ตะกร้า</h2>
            <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold">{totalItems} รายการ</span>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-neutral-600">
                <p className="text-5xl mb-4">🛒</p><p className="font-bold">ยังไม่มีรายการ</p>
                <button onClick={() => setIsCartOpen(false)} className="mt-4 bg-neutral-800 text-amber-400 px-6 py-2 rounded-full font-bold text-sm">เลือกเมนู</button>
              </div>
            ) : cartItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 p-2 rounded-2xl">
                <div className="w-14 h-14 relative rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0">
                  {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-white line-clamp-1">{item.name}</h4>
                  {item.note && <p className="text-[10px] text-neutral-500">{item.note}</p>}
                  <p className="text-amber-400 font-bold text-sm">฿{item.price}</p>
                </div>
                <div className="flex items-center gap-2 bg-neutral-800 rounded-full p-1">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-full bg-neutral-700 text-neutral-300 flex items-center justify-center font-bold">-</button>
                  <span className="w-4 text-center font-bold text-sm text-white">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold">+</button>
                </div>
              </div>
            ))}
          </div>
          {cartItems.length > 0 && (
            <div className="border-t border-neutral-800 p-5 pb-safe">
              <div className="flex justify-between items-center mb-4">
                <span className="text-neutral-400">ราคารวม</span>
                <span className="text-2xl font-black text-amber-400">฿{totalPrice.toLocaleString()}</span>
              </div>
              <button disabled={isSubmitting} onClick={handleSubmitOrder}
                className={`w-full font-black text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-all ${isSubmitting ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/30'}`}>
                {isSubmitting ? <span className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>กำลังส่ง...</span> : 'ยืนยันการสั่งอาหาร'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function CustomerMenu() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#0D0D0D] flex items-center justify-center text-white">กำลังโหลด...</main>}>
      <CustomerMenuContent />
    </Suspense>
  );
}