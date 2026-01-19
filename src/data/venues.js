// src/data/venues.js

export const SPORTS = {
  badminton: "Бадминтон",
  tableTennis: "Настольный теннис",
  squash: "Сквош",
  padel: "Падел",
};

export const VENUES = [
  {
    id: "v1",
    name: "Space Химки",
    address: "г. Химки, ул. Кирова, стр. 24",

    // ✅ список спортов — берётся из keys sportsPrices
    // (отдельный массив можно не держать, чтобы не дублировать)
    sportsPrices: {
      badminton: { min: 1075, prime: 2600 },
      tableTennis: { min: 400, prime: 800 },
      squash: { min: 1000, prime: 2250 },
      // padel: { min: null, prime: null }  // НЕ надо, если нет — просто не добавляй ключ
    },

    images: [
      "/img/Khimki-1.webp",
      "/img/Khimki-2.webp",
      "/img/Khimki-3.webp",
      "/img/Khimki-4.webp",
      "/img/Khimki-5.jpg",
    ],

    metro: "—",
    phone: "+7 (495) 150-91-19",
    website: "https://racketspace.ru",
    note: "Запись осуществляется напрямую через клуб.",

    workHours: { start: "07:00", end: "23:00" },
  },

  {
    id: "v2",
    name: "Space ВДНХ",
    address: "Москва, ул. Касаткина, 19",

    sportsPrices: {
      badminton: { min: 1075, prime: 2600 },
      tableTennis: { min: 1075, prime: 2600 },
    },

    images: ["/img/VDNKH-1.jpg", "/img/VDNKH-2.jpg", "/img/VDNKH-3.jpg"],

    metro: "ВДНХ",
    phone: "+7 (495) 120-80-30",
    website: "https://racketspace.ru",
    note: "Запись осуществляется напрямую через клуб.",

    workHours: { start: "07:00", end: "23:00" },
  },

  {
    id: "v3",
    name: "Сквош Клуб Москва",
    address: "Москва, ул. Шарикоподшипниковская, 13, стр. 46",

    sportsPrices: {
      badminton: { min: 1075, prime: 2600 },
      tableTennis: { min: 1075, prime: 2600 },
      squash: { min: 1800, prime: 2500 },
    },

    images: ["/img/Squash-1.webp", "/img/Squash-2.webp", "/img/Squash-3.webp"],

    metro: "Дубровка, Волгоградский проспект",
    phone: "+7 ___ ___-__-__",
    website: "https://example.com",
    note: "Запись осуществляется напрямую через клуб.",

    workHours: { start: "07:00", end: "23:00" },
  },

  {
    id: "v4",
    name: "ФОК Потаповский",
    address: "Москва, Чистопрудный бульвар, 14, стр. 4",

    sportsPrices: {
      badminton: { min: 1500, prime: 1700 },
      tableTennis: { min: 1500, prime: 1700 },
    },

    images: ["/img/FOK-2 (1).webp", "/img/FOK-2 (2).webp"],

    metro: "Чистые пруды",
    phone: "+7 ___ ___-__-__",
    website: "https://example.com",
    note: "Запись осуществляется напрямую через клуб.",

    workHours: { start: "08:00", end: "22:00" },
  },
];

