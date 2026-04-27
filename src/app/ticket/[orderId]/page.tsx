"use client";
import { useState, useEffect } from "react";

export default function TicketPage({ params }: { params: Promise<{ orderId: string }> }) {
  const [order, setOrder] = useState<any>(null);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    params.then(({ orderId: id }) => {
      setOrderId(id);
      fetch(`/api/orders/${id}`).then(r => r.json()).then(d => { if (d.order) setOrder(d.order); });
    });
  }, [params]);

  useEffect(() => { if (order) setTimeout(() => window.print(), 500); }, [order]);

  if (!order) return <div className="p-8 text-center">กำลังโหลด...</div>;

  const foodItems = order.items?.filter((i: any) => !i.menu?.isDrink) || [];
  const drinkItems = order.items?.filter((i: any) => i.menu?.isDrink) || [];

  return (
    <>
      <style>{`@media print { body { margin: 0; } .no-print { display: none !important; } } @page { size: 80mm auto; margin: 0; }`}</style>
      <div className="font-mono text-sm max-w-[80mm] mx-auto p-4 bg-white text-black">
        <div className="text-center border-b-2 border-black pb-2 mb-3">
          <h1 className="text-2xl font-black">🔥 ครัว</h1>
          <p className="text-xs">Order #{orderId.padStart(4,'0')} • โต๊ะ {order.table?.tableNo||'TW'}</p>
          <p className="text-[10px]">{new Date(order.createdAt).toLocaleString('th-TH')}</p>
        </div>

        {foodItems.length > 0 && <>
          <p className="font-black text-xs bg-black text-white px-2 py-1 mb-2">🍳 อาหาร ({foodItems.length})</p>
          {foodItems.map((item: any) => (
            <div key={item.id} className="border-b border-dashed border-gray-400 py-1">
              <div className="flex justify-between font-bold"><span>{item.quantity}x {item.menu?.name}</span></div>
              {item.note && <p className="text-[10px] text-gray-600 ml-4">*** {item.note}</p>}
            </div>
          ))}
        </>}

        {drinkItems.length > 0 && <>
          <p className="font-black text-xs bg-black text-white px-2 py-1 mb-2 mt-3">🍹 เครื่องดื่ม ({drinkItems.length})</p>
          {drinkItems.map((item: any) => (
            <div key={item.id} className="border-b border-dashed border-gray-400 py-1">
              <div className="flex justify-between font-bold"><span>{item.quantity}x {item.menu?.name}</span></div>
              {item.note && <p className="text-[10px] text-gray-600 ml-4">*** {item.note}</p>}
            </div>
          ))}
        </>}

        <div className="no-print mt-6 text-center space-y-2">
          <button onClick={() => window.print()} className="bg-orange-500 text-white font-bold px-6 py-3 rounded-xl">🖨 พิมพ์ใบสั่งครัว</button>
          <br/><a href="/cashier" className="text-orange-400 text-sm">← กลับ</a>
        </div>
      </div>
    </>
  );
}
