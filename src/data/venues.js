// src/data/venues.js

export const SPORTS = {
  badminton: "Бадминтон",
  tableTennis: "Настольный теннис",
  squash: "Сквош",
};

export const VENUES = [
  {
    id: "v1",
    name: "Space Химки",
    address: "г. Химки, ул. Кирова, с24",
    sportsPrices: {
      badminton: { min: 1075, prime: 2600 },
      tableTennis: { min: 400, prime: 800 },
      squash: { min: 1000, prime: 2250 },
    },

    images: [
      "/img/Khimki-1.webp",
      "/img/Khimki-2.webp",
      "/img/Khimki-3.webp",
      "/img/Khimki-4.webp",
      "/img/Khimki-5.jpg",
    ],

    metro: "МЦД Химки"
    phone: "+7 (495) 150-91-19",
    website: "https://racketspace.ru",
    note: "Запись осуществляется на сайте или по телефону.",
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
    note: "Запись осуществляется на сайте или по телефону.",

    workHours: { start: "07:00", end: "23:00" },
  },

  {
    id: "v3",
    name: "Сквош Клуб Москва на Дубровке",
    address: "Москва, ул. Шарикоподшипниковская, 13, стр. 46",

    sportsPrices: {
      badminton: { min: 1700, prime: 2500 },
      squash: { min: 2800, prime: 3500 },
    },

    images: ["/img/Squash-1.webp", "/img/Squash-2.webp", "/img/Squash-3.webp, "/img/Squash-4.webp", "/img/Squash-5.webp", "/img/Squash-6.webp,"],

    metro: "Дубровка, Волгоградский проспект",
    phone: "+7 (499) 290-13-47",
    website: "https://squashclub.moscow/",
    note: "Запись осуществляется на сайте или по телефону.",

    workHours: {
    weekdays: { start: "07:00", end: "23:00" },
    weekends: { start: "08:00", end: "23:00" }
}

  },

  {
    id: "v4",
    name: "Сквош Клуб Москва на Лужниках",
    address: "Москва, Лужники д 24 с 21, Блок С. 4 этаж",

    sportsPrices: {
      tabletennis: { min: 1500, prime: 1700 },
      squash: { min: 3300, prime: 3900 },
    },

    images: ["/img/Squash-Luzhniki-1.webp", "/img/Squash-Luzhniki-2.webp", "/img/Squash-Luzhniki-3.webp", "/img/Squash-Luzhniki-4.webp", ],

    metro: "Воробьевы горы",
    phone: "+7 (936) 140-04-04",
    website: "https://squashclub.moscow/",
    note: "Запись осуществляется на сайте или по телефону.",

    workHours: {start: "07:00", end: "23:00"}
  },
];

