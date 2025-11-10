import React, { useEffect, useMemo, useState } from "react";

/** ====== ДАННЫЕ ПЛОЩАДОК ======
 *  priceFrom — число; добавлены images.
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
      "/img/Khimki-5.jpg",
    ],
  },
  {
    id: "v2",
    name: "Space Racket ВДНХ",
    address: "Москва, ул. Касаткина, 19",
    surface: "taraflex",
    priceFrom: 1000,
    tags: ["Бадминтон", "Настольный теннис"],
    image: "/img/VDNKH-1.jpg",
    images: ["/img/VDNKH-1.jpg", "/img/VDNKH-2.jpg", "/img/VDNKH-3.jpg"],
  },
  {
    id: "v3",
    name: "Сквош Клуб Москва",
    address: "Москва, ул. Шарикоподшипниковская, 13, стр. 46",
    surface: "паркет",
    priceFrom: 1500,
    tags: ["Сквош", "Бадминтон"],
    image: "/img/Squash-1.webp",
    images: ["/img/Squash-1.webp", "/img/Squash-2.webp", "/img/Squash-3.webp"],
  },
  {
    id: "v4",
    name: "ФОК Потаповский",
    address: "Москва, Чистопрудный бульвар, 14, стр. 4",
    surface: "taraflex",
    priceFrom: 1500,
    tags: ["Бадминтон", "Настольный теннис"],
    image: "/img/FOK-2 (1).webp",
    images: ["/img/FOK-2 (1).webp", "/img/FOK-2 (2).webp"],
  },
];

const allSports = ["Бадминтон", "Настольный теннис", "Сквош", "Падел"];

// ===== Рабочие часы
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
  const s = toMins(start), e = toMins(end);
  if (s < toMins(WORK_HOURS.start) || e > toMins(WORK_HOURS.end) || s >= e) return false;
  const dayBusy = busyList.filter((b) => b.venue_id === venue.id && b.date === date);
  return !dayBusy.some((b) => overlaps(s, e, toMins(b.start), toMins(b.end)));
}
function suggestSlots(venue, date, durationMins = 60, max = 3, busyList = []) {
  const busy = busyList
    .filter((b) => b.venue_id === venue.id && b.date === date)
    .map((b) => [toMins(b.start), toMins(b.end)])
    .sort((a, b) => a[0] - b[0]);

  const openStart = toMins(WORK_HOURS.start), openEnd = toMins(WORK_HOURS.end);
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

/** ===== источник занятости ===== */
const LOCAL_BUSY = []; // тестовые слоты при желании
const REMOTE_BUSY_URL = "/schedule.json";

/* ===== КАРУСЕЛЬ В КАРТОЧКЕ ===== */
function VenueImages({ images = [], name }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!images || images.length < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, [images?.length]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative h-44 w-full overflow-hidden rounded-t-2xl">
      {images.map((src, i) => (
        <img
          key={src || i}
          src={src}
          alt={name}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* стрелки */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-lg bg-black/40 px-2 py-1 text-white"
            aria-label="Предыдущее фото"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setIdx((i) => (i + 1) % images.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-black/40 px-2 py-1 text-white"
            aria-label="Следующее фото"
          >
            ›
          </button>
        </>
      )}

      {/* точки */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            aria-label={`Показать фото ${i + 1}`}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              i === idx ? "bg-lime-300" : "bg-neutral-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

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

/* «красивый» селект на базе native */
function PrettySelect({ value, onChange, children, placeholder, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={onChange}
        className="mt-1 w-full h-[46px]
                   rounded-xl border border-neutral-800 bg-neutral-900
                   pl-4 pr-10 text-sm text-neutral-200
                   outline-none appearance-none
                   focus:border-lime-400/60 focus:ring-2 focus:ring-lime-400/20
                   transition"
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
        viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

/* поле «Цена до…» с пресетами */
function PriceMaxWithPresets({ pMax, setPMax, setPMin }) {
  const [showPresets, setShowPresets] = useState(false);
  const [pulse, setPulse] = useState(false);
  const PRESETS = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000];

  return (
    <div className="flex gap-2 items-stretch w-full relative">
      <input
        type="number"
        inputMode="numeric"
        placeholder="до"
        value={pMax}
        onChange={(e) => setPMax(e.target.value)}
        className={`h-[46px] flex-1 rounded-xl border bg-neutral-900 px-4 outline-none
                    ${pulse
                      ? "border-lime-400/70 shadow-[0_0_0_4px_rgba(190,242,100,0.15)]"
                      : "border-neutral-800 focus:border-lime-400/60"}`}
      />

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowPresets((v) => !v)}
          className="h-[46px] rounded-xl border border-neutral-800 bg-neutral-900 px-3 text-sm hover:bg-neutral-800 outline-none focus:border-lime-400/60"
          aria-haspopup="menu"
          aria-expanded={showPresets}
        >
          До…
        </button>

        {showPresets && (
          <div
            className="absolute right-0 z-30 mt-2 w-44 rounded-xl border border-neutral-800 bg-neutral-900 p-1 shadow-xl"
            role="menu"
          >
            {PRESETS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setPMax(String(v));
                  setPMin("0");
                  setPulse(true);
                  setShowPresets(false);
                  setTimeout(() => setPulse(false), 600);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-neutral-800"
                role="menuitem"
              >
                до {v.toLocaleString("ru-RU")}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== ОСНОВНОЙ КОМПОНЕНТ ===== */
export default function KortlyApp() {
  // базовые состояния
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("");
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", date: "", time: "" });
  const [toast, setToast] = useState(null);

  // фильтры
  const [day, setDay] = useState("");
  const [tFrom, setTFrom] = useState("");
  const [tTo, setTTo] = useState("");
  const [pMin, setPMin] = useState("");
  const [pMax, setPMax] = useState("");
  const [sortBy, setSortBy] = useState(""); // '', 'price-asc', 'price-desc'

  // занятость
  const [busy, setBusy] = useState(LOCAL_BUSY);

  // сброс фильтров
  function resetFilters() {
    setQuery("");
    setSport("");
    setDay("");
    setTFrom("");
    setTTo("");
    setPMin("");
    setPMax("");
    setSortBy("");
  }

  useEffect(() => {
    fetch(REMOTE_BUSY_URL, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data)) setBusy(data);
      })
      .catch(() => {});
  }, []);

  // фильтрация + сортировка
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hasTime = day && tFrom;
    const from = tFrom || null;
    const to = tTo ? tTo : from ? fmt(toMins(from) + 60) : null;
    const min = pMin ? Number(pMin) : null;
    const max = pMax ? Number(pMax) : null;

    let arr = VENUES.filter((v) => {
      const byText = !q || v.name.toLowerCase().includes(q) || v.address.toLowerCase().includes(q);
      const bySport = !sport || v.tags.includes(sport);
      const byTime = !hasTime || (from && to && isFree(v, day, from, to, busy));
      const byPrice =
        (min === null || v.priceFrom >= min) && (max === null || v.priceFrom <= max);
      return byText && bySport && byTime && byPrice;
    });

    if (sortBy === "price-asc") arr.sort((a, b) => a.priceFrom - b.priceFrom);
    if (sortBy === "price-desc") arr.sort((a, b) => b.priceFrom - a.priceFrom);

    return arr;
  }, [query, sport, day, tFrom, tTo, pMin, pMax, sortBy, busy]);

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
      {/* ===== ШАПКА ===== */}
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

      {/* ===== HERO ===== */}
      <section
        className="relative bg-neutral-950 overflow-hidden"
        style={{
          backgroundImage: 'url(/img/Back.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[3px]" />
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-b from-transparent via-neutral-950/70 to-neutral-950" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-6xl font-black leading-tight">
              Найди и&nbsp;забронируй <span className="text-lime-300 italic">корт</span> за минуту
            </h1>
            <p className="mt-4 text-neutral-300 max-w-2xl">
              Бадминтон, настольный теннис, сквош и падел — в одном месте. Актуальные цены, локации по всей Москве.
            </p>
            <div className="mt-8 grid gap-3 sm:flex sm:items-center">
              <a href="#venues" className="inline-flex items-center justify-center rounded-xl bg-lime-400 px-6 py-3 font-semibold text-neutral-950 hover:brightness-95">
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
                className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 outline-none focus:border-lime-400/60"
              />
            </div>

            {/* вид спорта */}
            <div className="z-20">
              <label className="text-sm text-neutral-400">Вид спорта</label>
              <PrettySelect
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                placeholder="Все"
              >
                {allSports.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </PrettySelect>
            </div>

            {/* дата */}
            <div>
              <label className="text-sm text-neutral-400">Дата</label>
              <input
                type="date"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 outline-none focus:border-lime-400/60"
              />
            </div>

            {/* время от */}
            <div>
              <label className="text-sm text-neutral-400">Время от</label>
              <input
                type="time"
                value={tFrom}
                onChange={(e) => setTFrom(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 outline-none focus:border-lime-400/60"
              />
            </div>

            {/* время до */}
            <div>
              <label className="text-sm text-neutral-400">Время до</label>
              <input
                type="time"
                value={tTo}
                onChange={(e) => setTTo(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 outline-none focus:border-lime-400/60"
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
                <option value="">Без сортировки</option>
                <option value="price-asc">Цена: сначала дешёвые</option>
                <option value="price-desc">Цена: сначала дорогие</option>
              </PrettySelect>
            </div>

            {/* сброс */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                className="h-[46px] w-full sm:w-auto rounded-xl border border-neutral-700 px-4 text-sm text-neutral-200 hover:bg-neutral-900 transition"
                title="Сбросить все фильтры"
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

      {/* ===== КАТАЛОГ ===== */}
      <section id="venues">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl sm:text-3xl font-bold">Площадки рядом с вами</h2>
            <div className="text-sm text-neutral-400">Найдено: {filtered.length}</div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((v) => {
              const imgs = v.images?.length ? v.images : (v.image ? [v.image] : []);
              return (
                <article
                  key={v.id}
                  className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow hover:shadow-lime-400/10 transition"
                >
                  <VenueImages images={imgs} name={v.name} />

                  <div className="p-5">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {v.tags.map((t) => (
                        <Badge key={t}>{t}</Badge>
                      ))}
                    </div>
                    <h3 className="text-lg font-semibold">{v.name}</h3>
                    <p className="mt-1 text-sm text-neutral-400">{v.address}</p>

                    {/* Индикатор доступности для выбранного слота */}
                    {day && tFrom && (
                      isFree(v, day, tFrom, tTo ? tTo : fmt(toMins(tFrom) + 60), busy) ? (
                        <div className="mt-2 text-sm text-lime-300">Свободно в выбранное время</div>
                      ) : (
                        <div className="mt-2 text-sm text-amber-300">
                          В выбранное время занято. Окна:{" "}
                          {suggestSlots(v, day, 60, 3, busy).map(([s, e], i) => (
                            <span key={i} className="mr-2">{s}–{e}</span>
                          ))}
                        </div>
                      )
                    )}

                    {/* Цена */}
                    <div className="mt-3 flex items-center justify-end">
                      <div className="text-right">
                        <div className="text-xl font-extrabold text-lime-300">
                          от {v.priceFrom.toLocaleString("ru-RU")} ₽
                        </div>
                        <div className="text-xs text-neutral-400">за час</div>
                      </div>
                    </div>

                    {/* Кнопка */}
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
              );
            })}
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
              { t: "Играйте", d: "Получите подтверждение и приезжайте в выбранный слот." },
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
