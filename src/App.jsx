import React, { useEffect, useMemo, useState, useRef } from "react";

/** ====== ДАННЫЕ ПЛОЩАДОК ======
 *  Важно: поле price => priceFrom (число), добавил surface.
 */
const VENUES = [
  {
    id: "v1",
    name: "Space Racket Химки",
    address: "г. Химки, ул. Кирова, стр. 24",
    surface: "taraflex",
    priceFrom: 1000,
    tags: ["Бадминтон", "Настольный теннис"],
    image: "/img/Khimki-1.webp",
    images: [
      "/img/Khimki-1.webp",
      "/img/Khimki-2.webp",
      "/img/Khimki-3.webp",
      "/img/Khimki-4.webp",
      "/img/Khimki-5.jpg"
    ]
  },
  {
    id: "v2",
    name: "Space Racket ВДНХ",
    address: "Москва, ул. Касаткина, 19",
    surface: "taraflex",
    priceFrom: 1000,
    tags: ["Бадминтон", "Настольный теннис"],
    image: "/img/VDNKH-1.jpg",
    images: ["/img/VDNKH-1.jpg", "/img/VDNKH-2.jpg", "/img/VDNKH-3.jpg"]
  },
  {
    id: "v3",
    name: "Сквош Клуб Москва",
    address: "Москва, ул. Шарикоподшипниковская, 13, стр. 46",
    surface: "паркет",
    priceFrom: 1500,
    tags: ["Сквош", "Бадминтон"],
    image: "/img/Squash-1.webp",
    images: ["/img/Squash-1.webp", "/img/Squash-2.webp", "/img/Squash-3.webp"]
  },
  {
    id: "v4",
    name: "ФОК Потаповский",
    address: "Москва, Чистопрудный бульвар, 14, стр. 4",
    surface: "taraflex",
    priceFrom: 1500,
    tags: ["Бадминтон", "Настольный теннис"],
    image: "/img/FOK-2 (1).webp",
    images: ["/img/FOK-2 (1).webp", "/img/FOK-2 (2).webp"]
  }
];

const allSports = ["Бадминтон", "Настольный теннис", "Сквош", "Падел"];

// ===== Рабочие часы для проверки диапазонов =====
const WORK_HOURS = { start: "08:00", end: "23:00" };

/** ===== helpers времени/слотов ===== */
function toMins(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function fmt(m) {
  return String((m / 60) | 0).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
}
function overlaps(s1, e1, s2, e2) {
  return Math.max(s1, s2) < Math.min(e1, e2);
}
function isFree(venue, date, start, end, busyList) {
  if (!date || !start || !end) return true;
  const s = toMins(start),
    e = toMins(end);
  if (s < toMins(WORK_HOURS.start) || e > toMins(WORK_HOURS.end) || s >= e) return false;
  const dayBusy = busyList.filter((b) => b.venue_id === venue.id && b.date === date);
  return !dayBusy.some((b) => overlaps(s, e, toMins(b.start), toMins(b.end)));
}
function suggestSlots(venue, date, durationMins = 60, max = 3, busyList = []) {
  const busy = busyList
    .filter((b) => b.venue_id === venue.id && b.date === date)
    .map((b) => [toMins(b.start), toMins(b.end)])
    .sort((a, b) => a[0] - b[0]);
  const openStart = toMins(WORK_HOURS.start),
    openEnd = toMins(WORK_HOURS.end);
  const gaps = [];
  let cur = openStart;
  for (const [bs, be] of busy) {
    if (cur < bs) gaps.push([cur, bs]);
    cur = Math.max(cur, be);
  }
  if (cur < openEnd) gaps.push([cur, openEnd]);
  const res = [];
  for (const [gs, ge] of gaps) {
    for (let t = gs; t + durationMins <= ge && res.length < max; t += 15) res.push([t, t + durationMins]);
    if (res.length >= max) break;
  }
  return res.map(([s, e]) => [fmt(s), fmt(e)]);
}

// ===== helpers даты (yyyy-mm-dd <-> dd.mm.yyyy) =====
function toRu(d){
  if(!d) return "";
  const [y,m,dd] = d.split("-");
  return `${dd}.${m}.${y}`;
}

function toIso(d){ // принимает "dd.mm.yyyy"
  if(!d) return "";
  const m = d.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : "";
}

function addDays(iso, n){
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().slice(0,10);
}

function eachDate(fromIso, toIsoStr){
  const res = [];
  if(!fromIso) return res;
  const end = toIsoStr || fromIso;
  let cur = fromIso;
  while(cur <= end){
    res.push(cur);
    cur = addDays(cur, 1);
  }
  return res;
}


/** ===== источник занятости (локально + возможность JSON) ===== */
const LOCAL_BUSY = []; // можешь временно оставить пустым или заполнить тестовыми слотами
// Когда появится JSON из Google Sheets/парсера — положи файл в /public, например schedule.json
const REMOTE_BUSY_URL = "/schedule.json"; // на старте можешь временно поставить "/schedule.sample.json"

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

// Один видимый инпут + скрытые нативные, можно кликать/вводить руками
const supportsShowPicker =
  typeof HTMLInputElement !== "undefined" &&
  "showPicker" in HTMLInputElement.prototype;

// ДАТА: выбор диапазона + затемнение заднего фона при открытии
function DateRangeInput({ from, to, onChangeFrom, onChangeTo, className="" }) {
  const refFrom = useRef(null);
  const refTo   = useRef(null);
  const [text, setText] = useState("");
  const [dim, setDim] = useState(false); // ← затемнение

  useEffect(()=>{
    setText((from||to) ? `${toRu(from)} — ${toRu(to||from)}` : "");
  },[from,to]);

  const openFrom = () => {
    try { supportsShowPicker ? refFrom.current.showPicker() : refFrom.current.focus(); }
    catch { refFrom.current.focus(); }
  };
  const openTo = () => {
    try { supportsShowPicker ? refTo.current.showPicker() : refTo.current.focus(); }
    catch { refTo.current.focus(); }
  };

  // при клике сбрасываем диапазон и включаем затемнение
  function handleClick() {
    onChangeFrom({ target:{ value:"" }});
    onChangeTo({ target:{ value:"" }});
    setText("");
    setDim(true);
    openFrom();
  }

  // ручной ввод
  function onBlurManual() {
    const parts = text.replace(/\s+/g," ").split("—").map(s=>s.trim());
    const a = toIso(parts[0]);
    const b = parts[1] ? toIso(parts[1]) : "";
    if (a) onChangeFrom({ target:{ value:a }});
    if (b) onChangeTo({ target:{ value:b }});
    if (a && !b) setText(`${toRu(a)} — ${toRu(a)}`);
  }

  // выключаем затемнение, когда выбрана «По»
  function onToChange(e){
    onChangeTo(e);
    setDim(false);
  }

  return (
    <>
      {dim && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={()=>setDim(false)}
        />
      )}
      <div className={`relative ${className} ${dim ? "z-50" : ""}`}>
        <div
          onClick={handleClick}
          className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 pr-10
                     outline-none focus-within:border-lime-400/60 cursor-text"
        >
          <input
            value={text}
            onChange={(e)=>setText(e.target.value)}
            onBlur={onBlurManual}
            placeholder="дд.мм.гггг — дд.мм.гггг"
            className="bg-transparent w-full outline-none"
          />
        </div>
        <button type="button" onClick={()=>{ setDim(true); openFrom(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 1 1 2 0v1Zm13 7H4v10h16V9Z"/>
          </svg>
        </button>

        {/* скрытые нативные */}
        <input ref={refFrom} type="date" value={from||""}
               onChange={(e)=>{ onChangeFrom(e); setTimeout(()=>{ setDim(true); openTo(); },0); }}
               className="sr-only" />
        <input ref={refTo} type="date" value={to||""}
               onChange={onToChange}
               className="sr-only" />
      </div>
    </>
  );
}


function useOnClickOutside(ref, cb) {
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) cb(); }
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [ref, cb]);
}

function Select({ value, onChange, options, placeholder = "Выбрать", className = "" }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const popRef = useRef(null);
  const rootRef = useRef(null);
  useOnClickOutside(rootRef, () => setOpen(false));

  const current = options.find(o => o.value === value);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {/* кнопка */}
      <button
        type="button"
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3
                   outline-none focus:border-lime-400/60 text-neutral-100 text-left
                   flex items-center justify-between"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={current ? "" : "text-neutral-500"}>
          {current ? current.label : placeholder}
        </span>
        <svg className="ml-3 h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.178l3.71-3.946a.75.75 0 011.08 1.04l-4.24 4.51a.75.75 0 01-1.08 0l-4.24-4.51a.75.75 0 01.02-1.06z"/>
        </svg>
      </button>

      {/* меню */}
      {open && (
        <div
          ref={popRef}
          role="listbox"
          className="absolute z-50 mt-2 w-full rounded-xl border border-neutral-800
                     bg-neutral-900 shadow-xl overflow-hidden"
        >
          <ul className="max-h-64 overflow-auto py-1">
            {options.map(opt => {
              const active = opt.value === value;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={active}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`px-4 py-2.5 cursor-pointer select-none
                              ${active ? "bg-lime-400 text-neutral-950" : "hover:bg-neutral-800"}`}
                >
                  {opt.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// ВРЕМЯ: выбор целых часов (00:00–23:00)
function TimeRangeInput({ from, to, onChangeFrom, onChangeTo, className = "" }) {
  const hours = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0") + ":00");

  return (
    <div className={`relative ${className}`}>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={from || ""}
          onChange={(e) => onChangeFrom({ target: { value: e.target.value } })}
          className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-3 outline-none focus:border-lime-400/60"
        >
          <option value="">От…</option>
          {hours.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>

        <select
          value={to || ""}
          onChange={(e) => onChangeTo({ target: { value: e.target.value } })}
          className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-3 outline-none focus:border-lime-400/60"
        >
          <option value="">До…</option>
          {hours.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// Быстрые пресеты для "Цена до"
const PRICE_PRESETS = [500,1000,1500,2000,2500,3000,3500,4000,4500,5000];

function VenueImages({ images = [], name }) {
  const [idx, setIdx] = React.useState(0);

  if (!images.length) return null;

  return (
    <div className="relative h-44 w-full overflow-hidden rounded-t-2xl">

export default function KortlyApp() {
  // существующие стейты
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("");
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", date: "", time: "" });
  const [toast, setToast] = useState(null);

// НОВОЕ: фильтры времени и цены + сортировка
const [dayFrom, setDayFrom] = useState("");
const [dayTo, setDayTo] = useState("");
const [tFrom, setTFrom] = useState("");
const [tTo, setTTo] = useState("");

// ✅ временный алиас, чтобы старые участки с day не падали
const day = dayFrom || dayTo;

const [pMin, setPMin] = useState("");
const [pMax, setPMax] = useState("");
const [sortBy, setSortBy] = useState(""); // '', 'price-asc', 'price-desc’


  // НОВОЕ: расписание занятости
  const [busy, setBusy] = useState(LOCAL_BUSY);

  // Подсветка поля "до" после выбора пресета
const [pricePulse, setPricePulse] = useState(false);

  const [showPresets, setShowPresets] = useState(false); // поповер пресетов

// Сброс всех фильтров
function resetFilters() {
  setQuery("");
  setSport("");
  setDayFrom("");
  setDayTo("");
  setTFrom("");
  setTTo("");
  setPMin("");
  setPMax("");
  setSortBy("");
}
  
  useEffect(() => {
    // пытаемся подтянуть внешний JSON; если его нет — остаёмся на LOCAL_BUSY
    fetch(REMOTE_BUSY_URL, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data)) setBusy(data);
      })
      .catch(() => {});
  }, []);

const filtered = useMemo(() => {
  const q = query.trim().toLowerCase();

  // 1) базовые фильтры по тексту и виду спорта
  let arr = VENUES.filter(v => {
    const byText  = !q || v.name.toLowerCase().includes(q) || v.address.toLowerCase().includes(q);
    const bySport = !sport || v.tags.includes(sport);
    return byText && bySport;
  });

  // 2) фильтр по датам + времени (часы)
  arr = arr.filter(v => {
    if (!(dayFrom || dayTo) && !(tFrom && tTo)) return true;

    const fromDate = dayFrom || dayTo;
    const toDate   = dayTo   || dayFrom;
    const fromTime = tFrom || "00:00";
    const toTime   = tTo   || "23:00";

    const dates = eachDate(fromDate, toDate);
    if (dates.length === 0) return true;

    // площадка подходит, если хоть один из дней свободен в этом часовом интервале
    return dates.some(d => isFree(v, d, fromTime, toTime, busy));
  });

  // 3) фильтр по цене
  arr = arr.filter(v =>
    (pMin === "" || v.priceFrom >= Number(pMin)) &&
    (pMax === "" || v.priceFrom <= Number(pMax))
  );

  // 4) сортировка по цене (если нужна)
  if (sortBy === "price-asc")  arr.sort((a,b) => a.priceFrom - b.priceFrom);
  if (sortBy === "price-desc") arr.sort((a,b) => b.priceFrom - a.priceFrom);

  return arr;
}, [query, sport, dayFrom, dayTo, tFrom, tTo, pMin, pMax, sortBy, busy]);


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

      {/* Все картинки, перелистываются по индексу */}
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={name}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Тёмный градиент снизу */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 to-transparent" />

      {/* Стрелки */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => setIdx((idx - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-neutral-100 rounded-full w-7 h-7 flex items-center justify-center"
          >
            ‹
          </button>
          <button
            onClick={() => setIdx((idx + 1) % images.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-neutral-100 rounded-full w-7 h-7 flex items-center justify-center"
          >
            ›
          </button>
        </>
      )}

      {/* точки-переключатели */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1.5">
        {images.map((_, i) => (
          <div
            key={i}
            onClick={() => setIdx(i)}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${i === idx ? "bg-lime-300" : "bg-neutral-600"}`}
            aria-label={`Показать фото ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
} // ← конец компонента VenueImages


      
      {/* ===== ШАПКА ===== */}
      <header className="sticky top-0 z-40 border-b border-neutral-900/80 bg-neutral-950/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3 select-none">
            <div className="h-8 w-8 -skew-x-6 rounded-xl bg-lime-400 shadow-[0_0_40px_-10px] shadow-lime-400/60" />
            <div className="text-2xl tracking-widest font-black italic">KORTLY</div>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-neutral-300">
            <a className="hover:text-lime-300 transition-colors" href="#venues">
              Каталог
            </a>
            <a className="hover:text-lime-300 transition-colors" href="#how">
              Как это работает
            </a>
            <a className="hover:text-lime-300 transition-colors" href="#contact">
              Контакты
            </a>
          </nav>
        </div>
      </header>

     {/* HERO */}
<section
  className="relative bg-neutral-950 overflow-hidden pb-2"
  style={{
    backgroundImage: 'url(/img/Back.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
  {/* затемнение */}
  <div className="absolute inset-0 bg-black/80 backdrop-blur-[3px]" />

  {/* лёгкое свечение по краям */}
  <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl" />
  <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl" />

  {/* плавный переход к нижнему фону */}
  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-b from-transparent via-neutral-950/70 to-neutral-950 z-0" />

  {/* контент */}
  <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-28">
    <div className="max-w-3xl">
      <h1 className="text-4xl sm:text-6xl font-black leading-tight">
        Найди и&nbsp;забронируй <span className="text-lime-300 italic">корт</span> за минуту
      </h1>
      <p className="mt-4 text-neutral-300 max-w-2xl">
        Бадминтон, настольный теннис, сквош и падел — в одном месте. Актуальные цены, локации по всей Москве.
      </p>
      <div className="mt-8 grid gap-3 sm:flex sm:items-center">
        <a
          href="#venues"
          className="inline-flex items-center justify-center rounded-xl bg-lime-400 px-6 py-3 font-semibold text-neutral-950 hover:brightness-95"
        >
          Посмотреть площадки
        </a>
        <div className="text-sm text-neutral-300 sm:ml-4">
          MVP • бронирование через форму • оплата на месте
        </div>
      </div>
    </div>
  </div>
</section>


{/* ===== ПАНЕЛЬ ФИЛЬТРОВ ===== */}
<section className="border-b border-neutral-900">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
    <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {/* поиск */}
      <div className="sm:col-span-2">
        <label className="text-sm text-neutral-400">Поиск по названию или адресу</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Например: Чистопрудный, ВДНХ, Химки"
          className="mt-1 w-full h-[46px] rounded-xl border border-neutral-800 bg-neutral-900 px-4 outline-none focus:border-lime-400/60"
        />
      </div>

      {/* вид спорта */}
      <div className="z-20">
        <label className="text-sm text-neutral-400">Вид спорта</label>
        <PrettySelect
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          placeholder="Все"
          className=""
        >
          {allSports.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </PrettySelect>
      </div>

      {/* дата */}
      <div className="z-10 sm:col-span-2">
        <label className="text-sm text-neutral-400">Дата</label>
        <div
          className="mt-1 w-full h-[46px] rounded-xl border border-neutral-800 bg-neutral-900 px-4 flex items-center cursor-text focus-within:border-lime-400/60"
          onClick={(e) => {
            const input = e.currentTarget.querySelector('input[type="date"]');
            if (!input) return;
            try {
              (typeof HTMLInputElement !== "undefined" &&
               "showPicker" in HTMLInputElement.prototype)
                ? input.showPicker()
                : input.focus();
            } catch { input.focus(); }
          }}
        >
          <input
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full bg-transparent outline-none"
          />
        </div>
      </div>

      {/* время от */}
      <div>
        <label className="text-sm text-neutral-400">Время от</label>
        <input
          type="time"
          value={tFrom}
          onChange={(e) => setTFrom(e.target.value)}
          className="mt-1 w-full h-[46px] rounded-xl border border-neutral-800 bg-neutral-900 px-4 outline-none focus:border-lime-400/60"
        />
      </div>

      {/* время до */}
      <div>
        <label className="text-sm text-neutral-400">Время до</label>
        <input
          type="time"
          value={tTo}
          onChange={(e) => setTTo(e.target.value)}
          className="mt-1 w-full h-[46px] rounded-xl border border-neutral-800 bg-neutral-900 px-4 outline-none focus:border-lime-400/60"
        />
      </div>

      {/* цена */}
      <div>
        <label className="text-sm text-neutral-400">Цена, ₽</label>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {/* от */}
          <input
            type="number"
            inputMode="numeric"
            placeholder="от"
            value={pMin}
            onChange={(e) => setPMin(e.target.value)}
            className="h-[46px] rounded-xl border border-neutral-800 bg-neutral-900 px-4 outline-none focus:border-lime-400/60"
          />
          {/* до + пресеты */}
          <PriceMaxWithPresets pMax={pMax} setPMax={setPMax} setPMin={setPMin} />
        </div>
      </div>

      {/* сортировка */}
      <div className="z-20">
        <label className="text-sm text-neutral-400">Сортировка</label>
        <PrettySelect
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          placeholder="Без сортировки"
        >
          <option value="price-asc">Цена: сначала дешёвые</option>
          <option value="price-desc">Цена: сначала дорогие</option>
        </PrettySelect>
      </div>

      {/* сброс */}
      <div className="flex items-end">
        <button
          type="button"
          onClick={() => {
            setQuery(""); setSport("");
            setDay(""); setTFrom(""); setTTo("");
            setPMin(""); setPMax(""); setSortBy("");
          }}
          className="h-[46px] w-full sm:w-auto rounded-xl border border-neutral-700 px-4 text-sm text-neutral-200 hover:bg-neutral-900 transition"
        >
          Сбросить фильтры
        </button>
      </div>
    </div>

    {/* подсказка под фильтрами */}
    {day && tFrom && (
      <div className="mt-3 text-sm text-neutral-400">
        Ищем слоты {day} {tFrom}{tTo ? "–" + tTo : "–" + fmt(toMins(tFrom) + 60)}.
      </div>
    )}
  </div>
</section>

      
/* ===== КАТАЛОГ ===== */
      <section id="venues">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl sm:text-3xl font-bold">Площадки рядом с вами</h2>
            <div className="text-sm text-neutral-400">Найдено: {filtered.length}</div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((v) => (
              <article
                key={v.id}
                className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow hover:shadow-lime-400/10 transition"
              >
                <div className="relative">
<VenueImages images={v.images}
  name={v.name}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 to-transparent" />
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {v.tags.map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
                  <h3 className="text-lg font-semibold">{v.name}</h3>
                  <p className="mt-1 text-sm text-neutral-400">{v.address}</p>

                  {/* Индикатор доступности */}
{( (dayFrom||dayTo) && tFrom ) && (() => {
  const dates = eachDate(dayFrom, dayTo);
  const fromTime = tFrom;
  const toTime = tTo ? tTo : fmt(toMins(tFrom)+60);
  const first = dates[0];
  if (!first) return null;
  return isFree(v, first, fromTime, toTime, busy)
    ? <div className="mt-2 text-sm text-lime-300">Свободно в выбранное время</div>
    : <div className="mt-2 text-sm text-amber-300">
        В выбранное время занято. Окна:{" "}
        {suggestSlots(v, first, 60, 3, busy).map(([s,e],i)=>(<span key={i} className="mr-2">{s}–{e}</span>))}
      </div>;
})()}


               <div className="mt-3 flex items-center justify-end">
  <div className="text-right">
    <div className="text-xl font-extrabold text-lime-300">
      от {v.priceFrom.toLocaleString("ru-RU")} ₽
    </div>
    <div className="text-xs text-neutral-400">за час</div>
  </div>
</div>

                  <div className="mt-5">
                    <button
                      onClick={() => openBooking(v)}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-lime-400 px-4 py-2.5 font-semibold text-neutral-950 hover:brightness-95 active:brightness-90 transition"
                    >
                      Забронировать
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== КАК ЭТО РАБОТАЕТ ===== */}
      <section id="how" className="border-t border-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Как это работает</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { t: "Выбирайте площадку", d: "Фильтруйте по виду спорта, локации, цене и времени." },
              { t: "Оставляйте заявку", d: "Укажите дату и время. В MVP подтверждаем вручную." },
              { t: "Играйте", d: "Получите подтверждение и приезжайте в выбранный слот." }
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
                <div className="mb-3 inline-block rounded-lg bg-lime-300/15 px-3 py-1 text-sm text-lime-300 border border-lime-300/30 -skew-x-6">
                  Шаг {i + 1}
                </div>
                <h3 className="text-lg font-semibold">{s.t}</h3>
                <p className="mt-1 text-neutral-400">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ПОДВАЛ ===== */}
      <footer id="contact" className="border-t border-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 select-none">
              <div className="h-7 w-7 -skew-x-6 rounded-lg bg-lime-400" />
              <div className="text-xl tracking-widest font-black italic">KORTLY</div>
            </div>
            <div className="text-sm text-neutral-400">
              MVP • заявки временно сохраняются локально. Следующий шаг — Telegram-бот и оплата.
            </div>
          </div>
        </div>
      </footer>

      {/* ===== МОДАЛКА БРОНИ ===== */}
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <h3 className="text-xl font-bold">Бронирование: {selectedVenue?.name}</h3>
        <p className="mt-1 text-sm text-neutral-400">{selectedVenue?.address}</p>
        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
          <div className="grid gap-1">
            <label className="text-sm text-neutral-300">Ваше имя</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 outline-none focus:border-lime-400/60"
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-neutral-300">Телефон</label>
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+7 ___ ___-__-__"
              className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 outline-none focus:border-lime-400/60"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-1">
              <label className="text-sm text-neutral-300">Дата</label>
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 outline-none focus:border-lime-400/60"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-sm text-neutral-300">Время</label>
              <input
                required
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 outline-none focus:border-lime-400/60"
              />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl border border-neutral-700 px-4 py-2.5 text-sm text-neutral-200 hover:bg-neutral-900"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="rounded-xl bg-lime-400 px-5 py-2.5 text-sm font-semibold text-neutral-950 hover:brightness-95"
            >
              Отправить заявку
            </button>
          </div>
        </form>
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 inset-x-0 mx-auto w-fit rounded-xl bg-neutral-900 border border-neutral-700 px-6 py-3 text-neutral-200 text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}
