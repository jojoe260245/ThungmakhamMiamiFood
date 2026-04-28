"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";

function CustomerMenuContent() {
  const searchParams = useSearchParams();
  const tableNo = searchParams.get("table") || "01";

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  // Options Modal State
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [spicyLevel, setSpicyLevel] = useState("ปกติ");
  const [tasteOption, setTasteOption] = useState("");
  const [sweetness, setSweetness] = useState("ปกติ");
  const [note, setNote] = useState("");

  useEffect(() => {
    fetch("/api/menus")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) setActiveCategory(null);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const cartItems = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const totalPrice = useCartStore((s) => s.getTotalPrice());

  const openOptionsModal = (item: any) => {
    setSelectedItem(item);
    setSpicyLevel("ปกติ");
    setTasteOption("");
    setSweetness("ปกติ");
    setNote("");
    setIsOptionsOpen(true);
  };

  const confirmAdd = () => {
    if (!selectedItem) return;

    let finalNote = note ? `โน้ต: ${note}` : "";
    const options: string[] = [];

    if (selectedItem.isDrink) {
      if (sweetness !== "ปกติ") options.push(`หวาน ${sweetness}`);
    } else {
      if (spicyLevel !== "ปกติ") options.push(spicyLevel);
      if (tasteOption) options.push(`เน้น${tasteOption}`);
    }

    if (options.length > 0) {
      finalNote = `[${options.join(", ")}] ` + finalNote;
    }

    addItem({
      menuId: selectedItem.id,
      name: selectedItem.name,
      price: selectedItem.price,
      quantity: 1,
      image: selectedItem.image,
      note: finalNote || undefined,
    });

    setIsOptionsOpen(false);
  };

  const allMenus = categories.flatMap((c) => c.menus);
  const trending = allMenus.filter((m: any) => m.isRecommended);
  const filtered = activeCategory
    ? categories.find((c) => c.id === activeCategory)?.menus || []
    : allMenus;

  return (
    <main className="min-h-screen bg-[#0D0D0D] pb-28 font-sans text-white">
      {/* Status Bar Spacer */}
      <div className="h-safe-top" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0D0D0D]/90 backdrop-blur-xl px-5 pt-4 pb-3">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              TKM<span className="text-amber-500">FOOD</span>
            </h1>
            <p className="text-[10px] text-neutral-500 font-medium tracking-[0.3em] uppercase">
              Seaside Restaurant • โต๊ะ {tableNo}
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <a
              href="/orders"
              className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-neutral-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <div className="flex items-center bg-neutral-800/80 rounded-2xl px-4 py-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 text-neutral-500 mr-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <span className="text-neutral-500 text-sm">ค้นหาเมนู...</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-1 px-1">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${!activeCategory
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
          >
            ทั้งหมด
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeCategory === cat.id
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* Hero / Trending Section */}
      {trending.length > 0 && !activeCategory && (
        <section className="px-5 mt-4">
          <h2 className="text-lg font-black mb-3 flex items-center gap-2">
            🔥 <span className="text-amber-500">Trending</span> Now
          </h2>

          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-1 px-1 snap-x">
            {trending.map((item: any) => (
              <div
                key={`t-${item.id}`}
                onClick={() => openOptionsModal(item)}
                className="min-w-[260px] rounded-[24px] overflow-hidden relative cursor-pointer group snap-start flex-shrink-0"
              >
                <div className="aspect-[16/10] relative">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-800" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-bold text-base leading-tight mb-1">
                    {item.name}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-amber-400 font-black text-lg">
                      ฿{item.price}
                    </span>
                    <span className="bg-amber-500 text-black text-[10px] font-black px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      + ADD
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
        </div>
      )}

      {/* Menu Grid */}
      {!isLoading && (
        <section className="px-5 mt-4">
          <h2 className="text-lg font-black mb-4">
            {activeCategory
              ? categories.find((c) => c.id === activeCategory)?.name
              : "เมนูทั้งหมด"}
            <span className="text-neutral-600 text-sm font-medium ml-2">
              ({filtered.length})
            </span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item: any) => (
              <div
                key={item.id}
                onClick={() => openOptionsModal(item)}
                className="bg-neutral-900 rounded-[20px] overflow-hidden cursor-pointer group border border-neutral-800 hover:border-amber-500/30 transition-all hover:shadow-lg hover:shadow-amber-500/5"
              >
                <div className="aspect-square relative overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-600 text-3xl">
                      🍽
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <button
                    type="button"
                    className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg"
                  >
                    +
                  </button>
                </div>

                <div className="p-3">
                  <p className="text-sm font-bold text-white leading-tight line-clamp-1 mb-1">
                    {item.name}
                  </p>
                  <span className="text-amber-400 font-black text-base">
                    ฿{item.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 w-full bg-[#0D0D0D]/95 backdrop-blur-xl border-t border-neutral-800 pb-safe z-50">
        <div className="flex items-center justify-around max-w-md mx-auto py-2">
          <div className="flex flex-col items-center gap-0.5 text-amber-500">
            <span className="text-xl">🏠</span>
            <span className="text-[10px] font-bold">เมนู</span>
          </div>

          <a
            href="/promotions"
            className="flex flex-col items-center gap-0.5 text-neutral-600 hover:text-neutral-400 transition"
          >
            <span className="text-xl">🏷️</span>
            <span className="text-[10px] font-bold">กิจกรรม</span>
          </a>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative -mt-6 w-14 h-14 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg shadow-amber-500/40 hover:bg-amber-400 transition-all active:scale-90"
          >
            🛒
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          <button
            onClick={() =>
              alert("💳 ส่งคำขอเช็คบิลเรียบร้อย!\nพนักงานกำลังเตรียมบิลให้คุณ")
            }
            className="flex flex-col items-center gap-0.5 text-neutral-600 hover:text-amber-400 transition"
          >
            <span className="text-xl">💳</span>
            <span className="text-[10px] font-bold">เช็คบิล</span>
          </button>

          <button
            onClick={() =>
              alert("🔔 เรียกพนักงานเรียบร้อย!\nพนักงานกำลังเดินทางมาที่โต๊ะของคุณ")
            }
            className="flex flex-col items-center gap-0.5 text-neutral-600 hover:text-red-400 transition"
          >
            <span className="text-xl">🔔</span>
            <span className="text-[10px] font-bold">พนักงาน</span>
          </button>
        </div>
      </div>

      {/* Options Modal */}
      {isOptionsOpen && selectedItem && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOptionsOpen(false)}
        >
          <div
            className="bg-[#1A1A1A] w-full max-w-md rounded-t-[30px] flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mt-3 mb-2" />

            <div className="px-5 pb-3 flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-neutral-800 relative overflow-hidden flex-shrink-0">
                {selectedItem.image && (
                  <Image
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              <div>
                <h3 className="font-bold text-lg text-white leading-tight mb-1">
                  {selectedItem.name}
                </h3>
                <span className="text-amber-400 font-black text-xl">
                  ฿{selectedItem.price}
                </span>
              </div>
            </div>

            <div className="px-5 py-4 overflow-y-auto flex-1 border-t border-neutral-800">
              {selectedItem.isDrink ? (
                <div className="mb-5">
                  <h4 className="font-bold text-neutral-300 mb-3 text-sm">
                    ระดับความหวาน
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {["ปกติ", "0%", "25%", "50%", "100%"].map((l) => (
                      <button
                        key={l}
                        onClick={() => setSweetness(l)}
                        className={`py-2.5 rounded-xl text-sm font-bold transition-all ${sweetness === l
                            ? "bg-amber-500 text-black"
                            : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                          }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-5">
                    <h4 className="font-bold text-neutral-300 mb-3 text-sm">
                      ระดับความเผ็ด 🌶
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {["ปกติ", "ไม่เผ็ด", "เผ็ดน้อย", "เผ็ดกลาง", "เผ็ดมาก"].map(
                        (l) => (
                          <button
                            key={l}
                            onClick={() => setSpicyLevel(l)}
                            className={`py-2.5 rounded-xl text-sm font-bold transition-all ${spicyLevel === l
                                ? "bg-amber-500 text-black"
                                : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                              }`}
                          >
                            {l}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="mb-5">
                    <h4 className="font-bold text-neutral-300 mb-3 text-sm">
                      รสชาติที่ชอบ
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {["เปรี้ยว", "เค็ม", "หวาน"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setTasteOption(t === tasteOption ? "" : t)}
                          className={`py-2 rounded-xl text-sm font-bold transition-all ${tasteOption === t
                              ? "bg-amber-500 text-black"
                              : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                            }`}
                        >
                          เน้น{t}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div>
                <h4 className="font-bold text-neutral-300 mb-2 text-sm">
                  โน้ตเพิ่มเติม
                </h4>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="เช่น ไม่ใส่ผัก, แยกน้ำ"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                  rows={2}
                />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-neutral-800 pb-safe">
              <button
                onClick={confirmAdd}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black text-base py-4 rounded-2xl shadow-lg shadow-amber-500/30 transition-all active:scale-95"
              >
                เพิ่มลงตะกร้า — ฿{selectedItem.price}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setIsCartOpen(false)}
      >
        <div
          className={`absolute bottom-0 left-0 w-full bg-[#1A1A1A] rounded-t-3xl shadow-2xl transition-transform duration-300 transform h-[85vh] flex flex-col ${isCartOpen ? "translate-y-0" : "translate-y-full"
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mt-3 cursor-pointer"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="px-5 py-3 border-b border-neutral-800 flex justify-between items-center">
            <h2 className="text-xl font-black text-white">ตะกร้า</h2>
            <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
              {totalItems} items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-neutral-600">
                <p className="text-5xl mb-4">🛒</p>
                <p className="font-bold">ยังไม่มีสินค้าในตะกร้า</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 bg-neutral-800 text-amber-400 px-6 py-2 rounded-full font-bold text-sm"
                >
                  เลือกเมนู
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 p-2 rounded-2xl"
                >
                  <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-white line-clamp-1">
                      {item.name}
                    </h4>
                    {item.note && (
                      <p className="text-[10px] text-neutral-500 leading-tight">
                        {item.note}
                      </p>
                    )}
                    <p className="text-amber-400 font-bold text-sm">
                      ฿{item.price}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-neutral-800 rounded-full p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-neutral-700 text-neutral-300 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="w-4 text-center font-bold text-sm text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t border-neutral-800 p-5 pb-safe">
              <div className="flex justify-between items-center mb-4">
                <span className="text-neutral-400">ราคารวม</span>
                <span className="text-2xl font-black text-amber-400">
                  ฿{totalPrice}
                </span>
              </div>

              <button
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black text-lg py-4 rounded-2xl shadow-lg shadow-amber-500/30 transition-all active:scale-95"
                onClick={async () => {
                  try {
                    const res = await fetch("/api/orders", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        tableNo,
                        items: cartItems,
                        total: totalPrice,
                      }),
                    });

                    if (res.ok) {
                      alert("✅ ส่งออเดอร์เข้าครัวเรียบร้อย!");
                      useCartStore.getState().clearCart();
                      setIsCartOpen(false);
                    } else {
                      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
                    }
                  } catch {
                    alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
                  }
                }}
              >
                ยืนยันการสั่งอาหาร
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
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0D0D0D] flex items-center justify-center text-white">
          กำลังโหลด...
        </main>
      }
    >
      <CustomerMenuContent />
    </Suspense>
  );
}