import React, { useMemo, useState } from "react";

const VENUES = [
  { id: "v1", name: "Khimki Badminton Club", address: "г. Химки, ул. Кирова, стр. 24", surface: "taraflex", price: 1800, tags: ["Бадминтон"], image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1600&auto=format&fit=crop" },
  { id: "v2", name: "Space ВДНХ", address: "Москва, ул. Касаткина, 19", surface: "taraflex", price: 2000, tags: ["Бадминтон","Настольный теннис"], image: "https://images.unsplash.com/photo-1551069613-1904dbdcda11?q=80&w=1600&auto=format&fit=crop" },
  { id: "v3", name: "Сквош Клуб Москва", address: "Москва, ул. Шарикоподшипниковская, 13, стр. 46", surface: "паркет", price: 2500, tags: ["Сквош"], image: "https://images.unsplash.com/photo-1546519638-9e6f2ed7da8e?q=80&w=1600&auto=format&fit=crop" },
  { id: "v4", name: "ФОК Потаповский", address: "Москва, Чистопрудный бульвар, 14, стр. 4", surface: "taraflex", price: 1700, tags: ["Бадминтон","Настольный теннис"], image: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1600&auto=format&fit=crop" },
];

const allSports = ["Бадминтон","Настольный теннис","Сквош","Падел"];

function Badge({ children }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-lime-300/20 text-lime-300 border border-lime-300/30">
      {children}
    </span>
  );
}

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl mx-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
        {children}
      </div>
    </div>
  );
}

export default function KortlyApp() {
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("");
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", date: "", time: "" });
  const [toast, setToast] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VENUES.filter(v => {
      const byText = !q || v.name.toLowerCase().includes(q) || v.address.toLowerCase().includes(q);
      const bySport = !sport || v.tags.includes(sport);
      return byText && bySport;
    });
  }, [query, sport]);

  function openBooking(venue) {
    setSelectedVenue(venue);
    setIsOpen(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { venue: selectedVenue?.name, ...form, createdAt: new Date().toISOString() };
    try {
      const key = "kortly_requests";
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      prev.push(payload);
      localStorage.setItem(key, JSON.stringify(prev));
      setToast("Заявка отправлена! Мы свяжемся с вами для подтверждения.");
      setIsOpen(false);
      setForm({ name: "", phone: "", date: "", time: "" });
      setTimeout(() => setToast(null), 3500);
    } catch {
      setToast("Не удалось сохранить заявку (MVP). Попробуйте ещё раз.");
      setTimeout(() => setToast(null), 3500);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <header className="sticky top-0 z-40 border-b border-neutral-900/80 bg-neutral-950/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3 select-none">
            <div className="h-8 w-8 -skew-x-6 rounded-xl bg-lime-400 shadow-[0_0_40px_-10px] shadow-lime-400/60" />
            <div className="text-2xl tracking-widest font-black italic">KORTLY</div>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-neutral-300">
            <a className="hover:text-lime-300 transition-colors" href="#venues">Каталог</a>
            <a className="hover:text-lime-300 transition-colors" href="#how">Как это работает</a>
            <a className="hover:text-lime-300 transition-colors" href="#contact">Контакты</a>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-6xl font-black leading-tight">
              Найди и забронируй <span className="text-lime-300 italic">корт</span> за минуту
            </h1>
            <p className="mt-4 text-neutral-300 max-w-2xl">
              Бадминтон, настольный теннис, сквош и падел — в один клик. Вечерние слоты, честные цены, удобные локации.
            </p>
            <div className="mt-8 grid gap-3 sm:flex sm:items-center">
              <a href="#venues" className="inline-flex items-center justify-center rounded-xl bg-lime-400 px-6 py-3 font-semibold text-neutral-950 hover:brightness-95 active:brightness-90 transition">
                Посмотреть площадки
              </a>
              <div className="text-sm text-neutral-400 sm:ml-4">MVP-версия • бронирование через форму • оплата на месте</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="text-sm text-neutral-400">Поиск по названию или адресу</label>
              <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Например: Чистопрудный, ВДНХ, Химки"
                className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 outline-none focus:border-lime-400/60" />
            </div>
            <div>
              <label className="text-sm text-neutral-400">Вид спорта</label>
              <select value={sport} onChange={(e)=>setSport(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 outline-none focus:border-lime-400/60">
                <option value="">Все</option>
                {allSports.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section id="venues">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl sm:text-3xl font-bold">Площадки рядом с вами</h2>
            <div className="text-sm text-neutral-400">Найдено: {filtered.length}</div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(v => (
              <article key={v.id} className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow hover:shadow-lime-400/10 transition">
                <div className="relative">
                  <img src={v.image} alt={v.name} className="h-44 w-full object-cover object-center transition group-hover:scale-[1.02]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 to-transparent" />
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {v.tags.map(t => <Badge key={t}>{t}</Badge>)}
                  </div>
                  <h3 className="text-lg font-semibold">{v.name}</h3>
                  <p className="mt-1 text-sm text-neutral-400">{v.address}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm text-neutral-300">Покрытие: <span className="text-neutral-100 font-medium">{v.surface}</span></div>
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-lime-300">{v.price.toLocaleString("ru-RU")} ₽</div>
                      <div className="text-xs text-neutral-400">за час</div>
                    </div>
                  </div>
                  <div className="mt-5">
                    <button onClick={()=>openBooking(v)} className="inline-flex w-full items-center justify-center rounded-xl bg-lime-400 px-4 py-2.5 font-semibold text-neutral-950 hover:brightness-95 active:brightness-90 transition">
                      Забронировать
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="border-t border-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Как это работает</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { t: "Выбирайте площадку", d: "Фильтруйте по виду спорта, локации и цене — всё прозрачно." },
              { t: "Оставляйте заявку", d: "Укажите дату, время и контакты. В MVP подтверждаем вручную." },
              { t: "Играйте", d: "Получите подтверждение и приезжайте в выбранный слот." },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
                <div className="mb-3 inline-block rounded-lg bg-lime-300/15 px-3 py-1 text-sm text-lime-300 border border-lime-300/30 -skew-x-6">Шаг {i+1}</div>
                <h3 className="text-lg font-semibold">{s.t}</h3>
                <p className="mt-1 text-neutral-400">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="contact" className="border-t border-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 select-none">
              <div className="h-7 w-7 -skew-x-6 rounded-lg bg-lime-400" />
              <div className="text-xl tracking-widest font-black italic">KORTLY</div>
            </div>
            <div className="text-sm text-neutral-400">MVP • заявки временно сохраняются локально. Следующий шаг — Telegram-бот и оплата.</div>
          </div>
        </div>
      </footer>

      <Modal open={isOpen} onClose={()=>setIsOpen(false)}>
        <h3 className="text-xl font-bold">Бронирование: {selectedVenue?.name}</h3>
        <p className="mt-1 text-sm text-neutral-400">{selectedVenue?.address}</p>
        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
          <div className="grid gap-1">
            <label className="text-sm text-neutral-300">Ваше имя</label>
            <input required value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })}
              className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 outline-none focus:border-lime-400/60" />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-neutral-300">Телефон</label>
            <input required value={form.phone} onChange={(e)=>setForm({ ...form, phone: e.target.value })} placeholder="+7 ___ ___-__-__"
              className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 outline-none focus:border-lime-400/60" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-1">
              <label className="text-sm text-neutral-300">Дата</label>
              <input required type="date" value={form.date} onChange={(e)=>setForm({ ...form, date: e.target.value })}
                className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 outline-none focus:border-lime-400/60" />
            </div>
            <div className="grid gap-1">
              <label className="text-sm text-neutral-300">Время</label>
              <input required type="time" value={form.time} onChange={(e)=>setForm({ ...form, time: e.target.value })}
                className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 outline-none focus:border-lime-400/60" />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-end gap-3">
            <button type="button" onClick={()=>setIsOpen(false)} className="rounded-xl border border-neutral-700 px-4 py-2.5 text-sm text-neutral-200 hover:bg-neutral-900">Отмена</button>
            <button type="submit" className="rounded-xl bg-lime-400 px-5 py-2.5 text-sm font-semibold text-neutral-950 hover:brightness-95">Отправить заявку</button>
          </div>
        </form>
      </Modal>

      {toast && (
        <div className="fixed bottom-6 inset-x-0 mx-auto w-fit rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-2.5 text-sm shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
