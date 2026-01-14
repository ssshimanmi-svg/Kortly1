import React, { useEffect, useMemo, useState, useRef } from "react";
import { VENUES } from "./data/venues";

const allSports = ["Бадминтон", "Настольный теннис", "Сквош", "Падел"];

/**
 * Требуемые зависимости, которые уже есть у тебя в проекте (как и раньше):
 * - useOnClickOutside
 * - Modal
 * - Badge
 */
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref?.current) return;
      if (ref.current.contains(e.target)) return;
      handler(e);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
function Select({
  value,
  onChange,
  options,
  placeholder = "Выбрать",
  className = ""
}) {
  const [open, setOpen] = useState(false);

  const btnRef = useRef(null);
  const popRef = useRef(null);
  const rootRef = useRef(null);

  useOnClickOutside(rootRef, () => setOpen(false));

  const current = options.find((o) => o.value === value);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {/* кнопка-открывашка */}
      <button
        type="button"
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-xl border border-neutral-800 bg-neutral-900
                   px-4 py-3 outline-none focus:border-lime-400/60
                   text-neutral-100 text-left flex items-center justify-between"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={current ? "" : "text-neutral-500"}>
          {current ? current.label : placeholder}
        </span>

        <svg
          className="ml-3 h-4 w-4 opacity-70"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.178l3.71-3.946a.75.75 0 011.08 1.04l-4.24 4.51a.75.75 0 01-1.08 0l-4.24-4.51a.75.75 0 01.02-1.06z" />
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
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`px-4 py-2.5 cursor-pointer select-none
                              ${
                                active
                                  ? "bg-lime-400 text-neutral-950"
                                  : "hover:bg-neutral-800"
                              }`}
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

// Карусель картинок площадки
function VenueImages({ images = [], name }) {
  const [idx, setIdx] = useState(0);
  if (!images || images.length === 0) return null;

  return (
    <div className="relative h-44 w-full overflow-hidden rounded-t-2xl">
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

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/40 to-transparent" />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIdx((idx - 1 + images.length) % images.length);
            }}
            className="absolute z-10 left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60
                       text-neutral-100 rounded-full w-7 h-7 flex items-center justify-center"
            aria-label="Предыдущее фото"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIdx((idx + 1) % images.length);
            }}
            className="absolute z-10 right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60
                       text-neutral-100 rounded-full w-7 h-7 flex items-center justify-center"
            aria-label="Следующее фото"
          >
            ›
          </button>
        </>
      )}

      <div className="absolute z-10 bottom-1 left-0 right-0 flex justify-center gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIdx(i);
            }}
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

  const PRESETS = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-[46px] w-[110px] rounded-xl border border-neutral-800
                   bg-neutral-900 px-3 flex items-center justify-between
                   outline-none focus:border-lime-400/60"
      >
        <span>{pMax ? `до ${Number(pMax).toLocaleString("ru-RU")}` : "до"}</span>
        <svg className="h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.18l3.71-3.95a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 top-[calc(100%+8px)] z-30 w-44 rounded-xl
                     border border-neutral-800 bg-neutral-900 p-1 shadow-xl"
          role="menu"
        >
          {PRESETS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                setPMax(String(v));
                setPMin("0");
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-neutral-800"
            >
              до {v.toLocaleString("ru-RU")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function WorkHours({ workHours, className = "" }) {
  // workHours ожидаем вида: { start: "08:00", end: "23:00" }
  if (!workHours?.start || !workHours?.end) return null;

  return (
    <div className={`text-sm text-neutral-400 ${className}`}>
      Часы работы: {workHours.start}–{workHours.end}
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-neutral-800
                     bg-neutral-900 px-2.5 py-1 text-xs text-neutral-200">
      {children}
    </span>
  );
}

function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* фон */}
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="Закрыть"
      />
      {/* окно */}
      <div className="relative w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-xl">
        {children}
      </div>
    </div>
  );
}

export default function KortlyApp() {
  // ✅ оставляем только каталогные фильтры
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("");

  const [pMin, setPMin] = useState("");
  const [pMax, setPMax] = useState("");
  const [sortBy, setSortBy] = useState(""); // '', 'price-asc', 'price-desc'
  const [priceMode, setPriceMode] = useState("min"); // 'min' | 'prime'

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // ✅ модалка деталей площадки (без календаря/доступности)
  const [venueDetails, setVenueDetails] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  function openVenueDetails(venue) {
    setVenueDetails(venue);
    setIsDetailsOpen(true);
  }

  function resetFilters() {
    setQuery("");
    setSport("");
    setPMin("");
    setPMax("");
    setSortBy("");
    setPriceMode("min");
  }
  
function getVenuePrice(v, mode) {
  // mode: 'min' | 'prime'
  const p = mode === "prime" ? v.pricePrime : v.priceMin;
  return typeof p === "number" ? p : null; // если не заполнено
}

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let arr = VENUES.filter((v) => {
      const byText =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.address.toLowerCase().includes(q);
      const bySport = !sport || v.tags.includes(sport);
      return byText && bySport;
    });

    // цена
arr = arr.filter(v => {
  const price = getVenuePrice(v, priceMode);

  // если цена не указана — можно либо скрывать, либо показывать всегда
  // Я предлагаю показывать, но не фильтровать (чтобы не “терять” площадку).
  if (price == null) return true;

  return (pMin === "" || price >= Number(pMin)) &&
         (pMax === "" || price <= Number(pMax));
});


if (sortBy === "price-asc") {
  arr.sort((a, b) => {
    const pa = getVenuePrice(a, priceMode);
    const pb = getVenuePrice(b, priceMode);

    // цены не заполнены → отправляем в конец
    if (pa == null && pb == null) return 0;
    if (pa == null) return 1;
    if (pb == null) return -1;

    return pa - pb;
  });
}

if (sortBy === "price-desc") {
  arr.sort((a, b) => {
    const pa = getVenuePrice(a, priceMode);
    const pb = getVenuePrice(b, priceMode);

    if (pa == null && pb == null) return 0;
    if (pa == null) return 1;
    if (pb == null) return -1;

    return pb - pa;
  });
}


    return arr;
}, [query, sport, pMin, pMax, sortBy, priceMode]);

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

      {/* ===== HERO (переписано: без обещаний бронирования) ===== */}
      <section
        className="relative bg-neutral-950 overflow-hidden pb-2"
        style={{
          backgroundImage: "url(/img/Back.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[3px]" />
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-b from-transparent via-neutral-950/70 to-neutral-950 z-0" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-6xl font-black leading-tight">
              Найди <span className="text-lime-300 italic">площадку</span> в Москве за минуту
            </h1>
            <p className="mt-4 text-neutral-300 max-w-2xl">
              Бадминтон, настольный теннис, сквош и падел — в одном каталоге.
              Адреса, ориентиры по цене и ссылки на площадки.
            </p>
            <div className="mt-8 grid gap-3 sm:flex sm:items-center">
              <a
                href="#venues"
                className="inline-flex items-center justify-center rounded-xl bg-lime-400 px-6 py-3 font-semibold text-neutral-950 hover:brightness-95"
              >
                Открыть каталог
              </a>
              <div className="text-sm text-neutral-300 sm:ml-4">
                MVP • каталог площадок • переход на сайт/контакты
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ПАНЕЛЬ ФИЛЬТРОВ (без даты/времени/доступности) ===== */}
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* МОБИЛКА */}
          <div className="sm:hidden">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((v) => !v)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3
                         flex items-center justify-between text-sm text-neutral-100"
            >
              <span>Фильтры и сортировка</span>
              <span className="text-xs text-neutral-400">
                {mobileFiltersOpen ? "Скрыть" : "Показать"}
              </span>
            </button>

            {mobileFiltersOpen && (
              <div className="mt-3 rounded-2xl border border-neutral-800 bg-neutral-950/95 p-4 space-y-3">
                {/* поиск */}
                <div>
                  <label className="text-xs text-neutral-400">
                    Поиск по названию или адресу
                  </label>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Начните вводить"
                    className="mt-1 w-full h-[40px] rounded-xl border border-neutral-800 bg-neutral-900 px-3 outline-none focus:border-lime-400/60 text-sm"
                  />
                </div>

                {/* вид спорта */}
                <div>
                  <label className="text-xs text-neutral-400">Вид спорта</label>
                  <Select
                    className="mt-1"
                    value={sport}
                    onChange={setSport}
                    placeholder="Все"
                    options={[
                      { value: "", label: "Все" },
                      ...allSports.map((s) => ({ value: s, label: s }))
                    ]}
                  />
                </div>

                {/* Цена + сортировка + сброс */}
                <div className="flex flex-wrap gap-2 items-end">
                  {/* цена */}
                  <div className="flex items-stretch gap-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="от"
                      value={pMin}
                      onChange={(e) => setPMin(e.target.value)}
                      className="h-[40px] w-[90px] shrink-0 rounded-xl border border-neutral-800 bg-neutral-900 px-3 outline-none focus:border-lime-400/60 text-sm"
                    />
                    <PriceMaxWithPresets pMax={pMax} setPMax={setPMax} setPMin={setPMin} />
                  </div>
<Select
  value={priceMode}
  onChange={setPriceMode}
  placeholder="Показывать цену"
  options={[
    { value: "min", label: "Минимальную" },
    { value: "prime", label: "Прайм часы" }
  ]}
/>
                  {/* сортировка */}
                  <div className="flex-1 min-w-[140px]">
                    <label className="text-xs text-neutral-400">Сортировка</label>
                    <Select
                      className="mt-1 w-full"
                      value={sortBy}
                      onChange={setSortBy}
                      placeholder="Без сортировки"
                      options={[
                        { value: "", label: "Без сортировки" },
                        { value: "price-asc", label: "Сначала дешёвые" },
                        { value: "price-desc", label: "Сначала дорогие" }
                      ]}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-1 h-[36px] rounded-xl border border-neutral-700 px-4 text-xs text-neutral-200 hover:bg-neutral-900"
                  >
                    Сбросить фильтры
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ДЕСКТОП */}
          <div className="hidden sm:block">
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
                  options={[
                    { value: "", label: "Все" },
                    ...allSports.map((s) => ({ value: s, label: s }))
                  ]}
                />
              </div>

              {/* ЦЕНА */}
              <div className="sm:col-span-2">
                <label className="text-sm text-neutral-400">Цена (₽/час)</label>
                <div className="mt-1 flex items-stretch gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="от"
                    value={pMin}
                    onChange={(e) => setPMin(e.target.value)}
                    className="h-[46px] w-[110px] shrink-0 rounded-xl border border-neutral-800 bg-neutral-900 px-4 outline-none focus:border-lime-400/60"
                  />
                  <PriceMaxWithPresets pMax={pMax} setPMax={setPMax} setPMin={setPMin} />
                </div>
              </div>

              {/* СОРТИРОВКА + СБРОС */}
              <div className="sm:col-span-2">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-sm text-neutral-400">Сортировка</label>
                    <Select
                      className="mt-1 w-full"
                      value={sortBy}
                      onChange={setSortBy}
                      placeholder="Без сортировки"
                      options={[
                        { value: "", label: "Без сортировки" },
                        { value: "price-asc", label: "Сначала дешёвые" },
                        { value: "price-desc", label: "Сначала дорогие" }
                      ]}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="h-[46px] rounded-xl border border-neutral-700 px-4 text-sm text-neutral-200 hover:bg-neutral-900 transition"
                  >
                    Сбросить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== КАТАЛОГ ===== */}
      <section id="venues">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl sm:text-3xl font-bold">Площадки в Москве</h2>
            <div className="text-sm text-neutral-400">Найдено: {filtered.length}</div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((v) => (
              <article
                key={v.id}
                onClick={() => openVenueDetails(v)}
                className="group overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow hover:shadow-lime-400/10 transition cursor-pointer"
              >
                <div className="relative">
                  <VenueImages images={v.images} name={v.name} />
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
                  <WorkHours workHours={v.workHours} className="mt-1" />


                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm text-neutral-400">
                      {v.metro ? `Метро: ${v.metro}` : ""}
                    </div>

                    <div className="text-right">
   {(() => {
    const price = getVenuePrice(v, priceMode);

    if (price == null) {
      return (
        <div className="text-sm text-neutral-400">
          цена уточняется
        </div>
      );
    }

    return (
      <>
        <div className="text-xl font-extrabold text-lime-300">
          от {price.toLocaleString("ru-RU")} ₽
        </div>
        <div className="text-xs text-neutral-400">
          {priceMode === "prime" ? "прайм-тайм" : "минимальная"} • за час
        </div>
      </>
    );
  })()}
</div>

                  <div className="mt-4 flex justify-end">
                    <span className="text-sm text-neutral-300 group-hover:text-lime-300 transition">
                      Подробнее →
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== КАК ЭТО РАБОТАЕТ (переписано) ===== */}
      <section id="how" className="border-t border-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Как это работает</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                t: "Выбирайте площадку",
                d: "Ищите по названию и адресу, фильтруйте по виду спорта и цене."
              },
              {
                t: "Смотрите подробности",
                d: "Открывайте карточку: фото, адрес, ориентиры по цене, контакты/ссылки (если указаны)."
              },
              {
                t: "Записывайтесь на площадке",
                d: "Переходите на сайт клуба или связывайтесь напрямую — как у них принято."
              }
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

      {/* ===== ПОДВАЛ (переписано) ===== */}
      <footer id="contact" className="border-t border-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 select-none">
              <div className="h-7 w-7 -skew-x-6 rounded-lg bg-lime-400" />
              <div className="text-xl tracking-widest font-black italic">KORTLY</div>
            </div>
            <div className="text-sm text-neutral-400">
              MVP • каталог площадок. Данные могут отличаться — уточняйте на сайте или по телефону площадки.
            </div>
          </div>
        </div>
      </footer>

      {/* ===== МОДАЛКА ДЕТАЛЕЙ (без календаря/доступности/слотов) ===== */}
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

            {/* Доп. поля (если они есть в VENUES) — не ломают, если отсутствуют */}
            <div className="mt-5 grid gap-3 text-sm text-neutral-300">
              {typeof venueDetails.priceFrom === "number" && (
                <div>
                  Цена: <span className="text-lime-300 font-semibold">от {venueDetails.priceFrom.toLocaleString("ru-RU")} ₽/час</span>
                </div>
              )}

              {venueDetails.metro && (
                <div>
                  <WorkHours workHours={venueDetails.workHours} className="mt-3" />
                  Метро: <span className="text-neutral-200">{venueDetails.metro}</span>
                </div>
              )}

              {venueDetails.phone && (
                <div>
                  Телефон:{" "}
                  <a
                    className="text-lime-300 hover:underline"
                    href={`tel:${String(venueDetails.phone).replace(/\s/g, "")}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {venueDetails.phone}
                  </a>
                </div>
              )}

              {venueDetails.website && (
                <div>
                  Сайт:{" "}
                  <a
                    className="text-lime-300 hover:underline"
                    href={venueDetails.website}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Открыть
                  </a>
                </div>
              )}

              {venueDetails.note && (
                <div className="text-neutral-400">
                  {venueDetails.note}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              {venueDetails.website && (
                <a
                  href={venueDetails.website}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-lime-400 px-4 py-2 text-sm font-semibold text-neutral-950 hover:brightness-95"
                >
                  Перейти на сайт
                </a>
              )}

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
    </div>
  );
}
