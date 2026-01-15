export const VENUES = [
  {
    id: "v1",
    name: "Space Химки",
    address: "г. Химки, ул. Кирова, стр. 24",
    priceMin: 1075,
    pricePrime: 2600,
    tags: ["Бадминтон", "Настольный теннис", "Сквош"],
    images: [
      "/img/Khimki-1.webp",
      "/img/Khimki-2.webp",
      "/img/Khimki-3.webp",
      "/img/Khimki-4.webp",
      "/img/Khimki-5.jpg"
    ],

    // новые поля (позже заполни)
    metro: "—",
    phone: "+7 (495) 150-91-19",
    website: "https://racketspace.ru",
    note: "Запись осуществляется напрямую через клуб.",

    // ✅ индивидуальные часы работы
    workHours: {
      start: "07:00",
      end: "23:00"
    }
  },

  {
    id: "v2",
    name: "Space ВДНХ",
    address: "Москва, ул. Касаткина, 19",
    priceMin: 1075,
    pricePrime: 2600,
    tags: ["Бадминтон", "Настольный теннис"],
    images: ["/img/VDNKH-1.jpg", "/img/VDNKH-2.jpg", "/img/VDNKH-3.jpg"],

    metro: "ВДНХ",
    phone: "+7 (495) 120-80-30",
    website: "https://racketspace.ru",
    note: "Запись осуществляется напрямую через клуб.",

    workHours: {
      start: "07:00",
      end: "23:00"
    }
  },

  {
    id: "v3",
    name: "Сквош Клуб Москва",
    address: "Москва, ул. Шарикоподшипниковская, 13, стр. 46",
    priceMin: 1800,
    pricePrime: 2500,
    tags: ["Сквош"],
    images: ["/img/Squash-1.webp", "/img/Squash-2.webp", "/img/Squash-3.webp"],

    metro: "Дубровка, Волгоградский проспект",
    phone: "+7 ___ ___-__-__",
    website: "https://example.com",
    note: "Запись осуществляется напрямую через клуб.",

    workHours: {
      start: "07:00",
      end: "23:00"
    }
  },

  {
    id: "v4",
    name: "ФОК Потаповский",
    address: "Москва, Чистопрудный бульвар, 14, стр. 4",
    priceMin: 1500,
    pricePrime: 1700,
    tags: ["Бадминтон", "Настольный теннис"],
    images: ["/img/FOK-2 (1).webp", "/img/FOK-2 (2).webp"],

    metro: "Чистые пруды",
    phone: "+7 ___ ___-__-__",
    website: "https://example.com",
    note: "Запись осуществляется напрямую через клуб.",

    workHours: {
      start: "08:00",
      end: "22:00"
    }
  }
];
