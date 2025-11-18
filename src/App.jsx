import React, { useEffect, useMemo, useState, useRef } from "react";

import { VENUES, WORK_HOURS } from "./data/venues";

const allSports = ["Бадминтон", "Настольный теннис", "Сквош", "Падел"];
  
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
function suggestSlots(
  venue,
  date,
  durationMins = 60,
  max = 3,
  busyList = [],
  fromTime = WORK_HOURS.start,
  toTime = WORK_HOURS.end
) {
  const busy = busyList
    .filter((b) => b.venue_id === venue.id && b.date === date)
    .map((b) => [toMins(b.start), toMins(b.end)])
    .sort((a, b) => a[0] - b[0]);

  // ограничиваем рабочий день выбранным интервалом
  const openStart = Math.max(toMins(WORK_HOURS.start), toMins(fromTime));
  const openEnd   = Math.min(toMins(WORK_HOURS.end),   toMins(toTime));

  const gaps = [];
  let cur = openStart;

  for (const [bs, be] of busy) {
    if (cur < bs) gaps.push([cur, bs]);
    cur = Math.max(cur, be);
  }
  if (cur < openEnd) gaps.push([cur, openEnd]);

  const res = [];
  for (const [gs, ge] of gaps) {
    for (let t = gs; t + durationMins <= ge && res.length < max; t += 15) {
      res.push([t, t + durationMins]);
    }
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

// ===== Календарь выбора диапазона дат (кастомный) =====

const MONTHS_RU = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

const WEEKDAYS_RU = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function isoToDate(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dateToIso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function makeMonthDays(year, month) {
  // month: 0–11
  const first = new Date(year, month, 1);
  // делаем понедельник первым днём недели
  const startWeekday = (first.getDay() + 6) % 7; // 0 = Пн
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  return cells;
}

function DateRangeInput({ from, to, onChangeFrom, onChangeTo, className = "" }) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);

  const today = new Date();
  const fromDate = isoToDate(from);
  const toDate = isoToDate(to);

  // месяц, который сейчас показан в календаре
  const [viewYear, setViewYear] = useState(
    fromDate?.getFullYear() ?? today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    fromDate?.getMonth() ?? today.getMonth()
  );

  // закрытие по клику вне
  useOnClickOutside(rootRef, () => setOpen(false));

  // текст в поле
  const label =
    from && to
      ? `${toRu(from)} — ${toRu(to)}`
      : "";

  function resetRangeAndOpen() {
    // каждый раз диапазон выбираем заново
    onChangeFrom({ target: { value: "" } });
    onChangeTo({ target: { value: "" } });

    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setOpen(true);
  }

  function handlePrevMonth() {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }

  function handleNextMonth() {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  function handleDayClick(day) {
    const clickedIso = dateToIso(day);

    // если диапазон ещё не начат или уже завершён — начинаем новый
    if (!fromDate || (fromDate && toDate)) {
      onChangeFrom({ target: { value: clickedIso } });
      onChangeTo({ target: { value: "" } });
      return;
    }

    // есть from, но нет to — выбираем конец диапазона
    if (day.getTime() < fromDate.getTime()) {
      // если кликнули раньше начала — переносим начало
      onChangeFrom({ target: { value: clickedIso } });
      onChangeTo({ target: { value: "" } });
      return;
    }

    // нормальный конец диапазона
    onChangeTo({ target: { value: clickedIso } });
    setOpen(false);
  }

  const cells = makeMonthDays(viewYear, viewMonth);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {/* видимое поле */}
      <div
        onClick={resetRangeAndOpen}
        className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 pr-10
                   outline-none cursor-pointer focus-within:border-lime-400/60 flex items-center"
      >
        <input
          readOnly
          value={label}
          placeholder="Выберите диапазон"
          className="bg-transparent w-full outline-none text-neutral-50 placeholder:text-neutral-500 cursor-pointer"
        />
        <svg
          className="ml-2 h-5 w-5 opacity-80"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 1 1 2 0v1Zm13 7H4v10h16V9Z" />
        </svg>
      </div>

      {/* поповер календаря */}
      {open && (
        <div
          className="absolute z-50 mt-2 w-80 rounded-2xl border border-neutral-800
                     bg-neutral-950 p-3 shadow-2xl"
        >
          {/* шапка */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="rounded-lg p-1 hover:bg-neutral-800"
            >
              <span className="inline-block rotate-90 text-lg">‹</span>
            </button>
            <div className="text-sm font-medium">
              {MONTHS_RU[viewMonth]} {viewYear}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="rounded-lg p-1 hover:bg-neutral-800"
            >
              <span className="inline-block -rotate-90 text-lg">‹</span>
            </button>
          </div>

          {/* дни недели */}
          <div className="grid grid-cols-7 gap-1 text-[11px] text-neutral-400 mb-1">
            {WEEKDAYS_RU.map((d) => (
              <div key={d} className="text-center">
                {d}
              </div>
            ))}
          </div>

          {/* сетка дней */}
          <div className="grid grid-cols-7 gap-1 text-sm">
            {cells.map((day, idx) => {
              if (!day) {
                return <div key={idx} />;
              }

              const inCurrentMonth = day.getMonth() === viewMonth;
              const isToday = isSameDay(day, today);

              const inRange =
                fromDate &&
                toDate &&
                day >= fromDate &&
                day <= toDate;

              const isStart = fromDate && isSameDay(day, fromDate);
              const isEnd = toDate && isSameDay(day, toDate);
              const isMiddle = inRange && !isStart && !isEnd;

              let className =
                "h-9 w-9 flex items-center justify-center rounded-full select-none cursor-pointer transition text-sm";

              if (!inCurrentMonth) {
                className += " text-neutral-600";
              } else if (isStart || isEnd) {
                className += " bg-lime-400 text-neutral-950 font-semibold";
              } else if (isMiddle) {
                className += " bg-lime-400/20 text-lime-200";
              } else {
                className += " text-neutral-100 hover:bg-neutral-800";
              }

              if (isToday && !isStart && !isEnd && !isMiddle) {
                className += " border border-lime-400/60";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={className}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {/* нижняя панель (сброс / сегодня по желанию можно допилить позже) */}
        </div>
      )}
    </div>
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

// Карусель картинок площадки
function VenueImages({ images = [], name }) {
  const [idx, setIdx] = useState(0);           // используем импортированный useState
  if (!images || images.length === 0) return null;

  return (
    <div className="relative h-44 w-full overflow-hidden rounded-t-2xl">
      {/* Слои картинок */}
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={name}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Затемнение — не блокирует клики */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/40 to-transparent" />

      {/* Стрелки */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIdx((idx - 1 + images.length) % images.length)}
            className="absolute z-10 left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60
                       text-neutral-100 rounded-full w-7 h-7 flex items-center justify-center"
            aria-label="Предыдущее фото"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setIdx((idx + 1) % images.length)}
            className="absolute z-10 right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60
                       text-neutral-100 rounded-full w-7 h-7 flex items-center justify-center"
            aria-label="Следующее фото"
          >
            ›
          </button>
        </>
      )}

      {/* Точки */}
      <div className="absolute z-10 bottom-1 left-0 right-0 flex justify-center gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              i === idx ? "bg-lime-300" : "bg-neutral-600"
            }`}
            aria-label={`Показать фото ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function PriceMaxWithPresets({ pMax, setPMax, setPMin }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  useOnClickOutside(rootRef, () => setOpen(false));

  const PRESETS = [500,1000,1500,2000,2500,3000,3500,4000,4500,5000];

  return (
    <div ref={rootRef} className="relative">
      {/* Кнопка "до" — узкая, фикс. ширина */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="h-[46px] w-[110px] rounded-xl border border-neutral-800
                   bg-neutral-900 px-3 flex items-center justify-between
                   outline-none focus:border-lime-400/60"
      >
        <span>{pMax ? `до ${Number(pMax).toLocaleString('ru-RU')}` : 'до'}</span>
        <svg className="h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.18l3.71-3.95a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/>
        </svg>
      </button>

      {/* Выпадашка — висит поверх и не толкает сетку */}
      {open && (
        <div
          className="absolute left-0 top-[calc(100%+8px)] z-30 w-44 rounded-xl
                     border border-neutral-800 bg-neutral-900 p-1 shadow-xl"
          role="menu"
        >
          {PRESETS.map(v => (
            <button
              key={v}
              type="button"
              onClick={() => { setPMax(String(v)); setPMin('0'); setOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-neutral-800"
            >
              до {v.toLocaleString('ru-RU')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


export default function KortlyApp() {
  // существующие стейты
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("");
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", date: "", time: "" });
  const [toast, setToast] = useState(null);

    // Модалка с подробной доступностью площадки
  const [venueDetails, setVenueDetails] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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

  // 2) фильтр по датам + времени
  arr = arr.filter(v => {
    const hasFullDateRange = dayFrom && dayTo;
    if (!hasFullDateRange) return true;   // если дат вообще нет — не фильтруем по времени/датам

    const fromDate = dayFrom;
    const toDate   = dayTo;

    // ЛОГИКА ВРЕМЕНИ:
    // - если время не выбрано вообще → берём весь рабочий день
    // - если указано только "от" → до конца рабочего дня
    // - если указано только "до" → от начала рабочего дня
    const fromTime = tFrom || WORK_HOURS.start;
    const toTime   = tTo   || WORK_HOURS.end;

    const dates = eachDate(fromDate, toDate);
    if (dates.length === 0) return true;

    const durationMins = 60; // длина слота, который считаем "подходящим"

    // площадка подходит, если хотя бы в один день есть свободное окно
    return dates.some(d => {
      const slots = suggestSlots(v, d, durationMins, 1, busy, fromTime, toTime);
      return slots.length > 0;
    });
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

  function openVenueDetails(venue) {
    setVenueDetails(venue);
    setIsDetailsOpen(true);
  }

  function openBooking(venue) {
    setSelectedVenue(venue);
    setIsOpen(true);
  }

    function handleSelectSlot(venue, dateIso, timeFrom) {
    // при выборе слота сразу открываем модалку брони
    setSelectedVenue(venue);
    setForm((prev) => ({
      ...prev,
      date: dateIso,       // input type="date" принимает YYYY-MM-DD
      time: timeFrom       // "HH:MM"
    }));
    setIsOpen(true);
    setIsDetailsOpen(false);
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
          placeholder="Начните вводить"
          className="mt-1 w-full h-[46px] rounded-xl border border-neutral-800 bg-neutral-900 px-4 outline-none focus:border-lime-400/60"
        />
      </div>

      {/* вид спорта */}
      <div className="z-30">
        <label className="text-sm text-neutral-400">Вид спорта</label>
        <Select
          className="mt-1"
          value={sport}
          onChange={setSport}
          placeholder="Все"
          options={[{ value: "", label: "Все" }, ...allSports.map(s => ({ value: s, label: s }))]}
        />
      </div>

      {/* дата (диапазон) */}
      <div className="z-10 sm:col-span-2">
        <label className="text-sm text-neutral-400">Дата</label>
        <DateRangeInput
          className="mt-1"
          from={dayFrom}
          to={dayTo}
          onChangeFrom={(e)=>setDayFrom(e.target.value)}
          onChangeTo={(e)=>setDayTo(e.target.value)}
        />
      </div>

      {/* время (диапазон) */}
      <div className="sm:col-span-2">
        <label className="text-sm text-neutral-400">Время</label>
        <TimeRangeInput
          className="mt-1"
          from={tFrom}
          to={tTo}
          onChangeFrom={(e)=>setTFrom(e.target.value)}
          onChangeTo={(e)=>setTTo(e.target.value)}
        />
      </div>

{/* ГРУППА: Цена + Сортировка + Сброс */}
<div className="sm:col-span-4">           {/* одна ячейка сетки */}
  <div className="flex items-end gap-2 flex-wrap">
    {/* ЦЕНА */}
    <div className="flex items-stretch gap-2">
      <input
        type="number"
        inputMode="numeric"
        placeholder="от"
        value={pMin}
        onChange={(e)=>setPMin(e.target.value)}
        className="h-[46px] w-[110px] shrink-0 rounded-xl border border-neutral-800 bg-neutral-900 px-4 outline-none focus:border-lime-400/60"
      />
      <PriceMaxWithPresets pMax={pMax} setPMax={setPMax} setPMin={setPMin} />
    </div>

    {/* СОРТИРОВКА + СБРОС */}
    <div className="flex items-end gap-2">
      <div>
        <label className="text-sm text-neutral-400">Сортировка</label>
        <Select
          className="mt-1 w-[220px]"
          value={sortBy}
          onChange={setSortBy}
          placeholder="Без сортировки"
          options={[
            { value: "", label: "Без сортировки" },
            { value: "price-asc", label: "Сначала дешёвые" },
            { value: "price-desc", label: "Сначала дорогие" },
          ]}
        />
      </div>

      <button
        type="button"
        onClick={resetFilters}
        className="h-[46px] rounded-xl border border-neutral-700 px-4 text-sm text-neutral-200 hover:bg-neutral-900 transition"
      >
        Сбросить фильтры
      </button>
    </div>
  </div>
</div>
</div>
      
{/* подсказка под фильтрами */}
{dayFrom && dayTo && (
  <div className="mt-3 text-sm text-neutral-400">
    Ищем слоты {dayFrom}–{dayTo}{" "}
    {tFrom || tTo
      ? `${tFrom || WORK_HOURS.start}–${tTo || WORK_HOURS.end}`
      : `(весь день)`}
  </div>
)}
</div>
</section>
      
{/* ===== КАТАЛОГ ===== */}
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
                  onClick={() => openVenueDetails(v)} // ← добавили
                className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow hover:shadow-lime-400/10 transition cursor-pointer"
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
{((dayFrom || dayTo) && tFrom) && (() => {
  const fromDate = dayFrom || dayTo;
  const toDate   = dayTo   || dayFrom;
  const fromTime = tFrom || WORK_HOURS.start;
  const toTime   = tTo   || WORK_HOURS.end;

  const dates = eachDate(fromDate, toDate);
  const first = dates[0];
  if (!first) return null;

  const slots = suggestSlots(v, first, 60, 10, busy, fromTime, toTime);

  const MAX_SHOWN = 3;
  const shown = slots.slice(0, MAX_SHOWN);
  const restCount = slots.length - shown.length;

  if (slots.length === 0) {
    return (
      <div className="mt-2 text-sm text-amber-300">
        В выбранном интервале нет свободных окон.
      </div>
    );
  }

  return (
    <div className="mt-2 text-sm text-lime-300">
      Свободные окна:{" "}
      {shown.map(([s, e], i) => (
        <span key={i} className="mr-2">{s}–{e}</span>
      ))}
      {restCount > 0 && (
        <span className="text-neutral-300">
          {" "}+ ещё {restCount}
        </span>
      )}
    </div>
  );
})()}



               <div className="mt-3 flex items-center justify-end">
  <div className="text-right">
    <div className="text-xl font-extrabold text-lime-300">
      от {v.priceFrom.toLocaleString("ru-RU")} ₽
    </div>
    <div className="text-xs text-neutral-400">за час</div>
  </div>
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

      {/* ===== МОДАЛКА ДОСТУПНОСТИ ПЛОЩАДКИ ===== */}
      <Modal open={isDetailsOpen} onClose={() => setIsDetailsOpen(false)}>
        {venueDetails && (
          <div>
            <h3 className="text-xl font-bold">{venueDetails.name}</h3>
            <p className="mt-1 text-sm text-neutral-400">{venueDetails.address}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {venueDetails.tags?.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>

            {/* Краткое резюме по текущим фильтрам */}
<div className="mt-4 text-sm text-neutral-300 space-y-1">
  {dayFrom && dayTo ? (
    <div>
      Даты: {toRu(dayFrom)} — {toRu(dayTo)}
    </div>
  ) : (
    <div className="text-neutral-500">
      Диапазон дат не выбран. Показываем ближайшие 30 дней.
    </div>
  )}

  <div>
    Время: {tFrom || WORK_HOURS.start}–{tTo || WORK_HOURS.end}
  </div>
</div>


function VenueAvailabilityCalendar({
  venue,
  dayFrom,
  dayTo,
  tFrom,
  tTo,
  busy,
  onSelectSlot
}) {
  const today = new Date();

  if (!venue) {
    return null;
  }

  // 🔹 ЭФФЕКТИВНЫЙ ДИАПАЗОН ДАТ:
  // - если задан dayFrom/dayTo → берём их
  // - если нет → от сегодня на 30 дней вперёд
  const fallbackFromIso = dateToIso(today);
  const effectiveFromIso = dayFrom || fallbackFromIso;
  const effectiveToIso = dayTo || addDays(effectiveFromIso, 30);

  const fromDateObj = isoToDate(effectiveFromIso);
  const toDateObj   = isoToDate(effectiveToIso);

  // время: либо фильтр, либо весь рабочий день
  const fromTime = tFrom || WORK_HOURS.start;
  const toTime   = tTo   || WORK_HOURS.end;

  // какой месяц показывать изначально:
  const initialViewDate = dayFrom ? isoToDate(dayFrom) : today;
  const [viewYear, setViewYear] = useState(initialViewDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialViewDate.getMonth());

  // выбранная дата (ISO)
  const [selectedDateIso, setSelectedDateIso] = useState(null);

  // 🔹 При изменении диапазона/фильтров ищем первую дату с свободным слотом
  useEffect(() => {
    const dates = eachDate(effectiveFromIso, effectiveToIso);
    for (const d of dates) {
      const slots = suggestSlots(
        venue,
        d,
        60,
        1,
        busy,
        fromTime,
        toTime
      );
      if (slots.length > 0) {
        setSelectedDateIso(d);
        return;
      }
    }
    setSelectedDateIso(null);
  }, [venue, dayFrom, dayTo, tFrom, tTo, busy, effectiveFromIso, effectiveToIso, fromTime, toTime]);

  function isInRange(day) {
    return day >= fromDateObj && day <= toDateObj;
  }

  function handlePrevMonth() {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }

  function handleNextMonth() {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  const cells = makeMonthDays(viewYear, viewMonth);

  const selectedSlots = selectedDateIso
    ? suggestSlots(
        venue,
        selectedDateIso,
        60,
        20,
        busy,
        fromTime,
        toTime
      )
    : [];
            
{/* Календарь доступности площадки */}
<div className="mt-5">
  <VenueAvailabilityCalendar
    venue={venueDetails}
    dayFrom={dayFrom}
    dayTo={dayTo}
    tFrom={tFrom}
    tTo={tTo}
    busy={busy}
    onSelectSlot={handleSelectSlot}
  />
</div>

<div className="mt-4 flex justify-end">
  <button
    type="button"
    onClick={() => setIsDetailsOpen(false)}
    className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
  >
    Закрыть
  </button>
</div>
          </div>
        )}
      </Modal>
      
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
