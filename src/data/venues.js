// src/data/venues.js

export const SPORTS = {
  badminton: "Бадминтон",
  tableTennis: "Настольный теннис",
  squash: "Сквош",
  padel: "Падел",
};

const BASE = import.meta.env.BASE_URL;

export const VENUES = [
  {
    id: "v1",
    name: "Space Химки",
    address: "г.Химки, ул. Кирова, с24",
    sportsPrices: {
      badminton: { min: 1075, prime: 2600 },
      tableTennis: { min: 400, prime: 800 },
      squash: { min: 1000, prime: 2250 },
    },
images: [
  `${BASE}img/Khimki-1.webp`,
  `${BASE}img/Khimki-2.webp`,
  `${BASE}img/Khimki-3.webp`,
  `${BASE}img/Khimki-4.webp`,
  `${BASE}img/Khimki-5.jpg`,
],
    metro: "МЦД Химки",
    phone: "+7 (495) 150-91-19",
    website: "https://racketspace.ru",
    note: "Запись осуществляется на сайте или по телефону",
    workHours: { start: "07:00", end: "23:00" },
  },

  {
    id: "v2",
    name: "Space ВДНХ",
    address: "Москва, ул. Касаткина, 19",
    sportsPrices: {
      badminton: { min: 1075, prime: 2600 },
      tableTennis: { min: 400, prime: 800 },
    },
    images: [
      `${BASE}img/VDNKH-1.jpg`,
      `${BASE}img/VDNKH-2.jpg`,
      `${BASE}img/VDNKH-3.jpg`,
    ],
    metro: "ВДНХ",
    phone: "+7 (495) 120-80-30",
    website: "https://racketspace.ru",
    note: "Запись осуществляется на сайте или по телефону",
    workHours: { start: "07:00", end: "23:00" },
  },

  {
    id: "v3",
    name: "Newton Арена",
    address: "Москва, 1-й нагатинский проезд, 10с1",
    sportsPrices: {
      badminton: { min: 2100, prime: 3300 },
      tableTennis: { min: 1200, prime: 1900 },
      squash: { min: 2100, prime: 3000 },
    },
    images: [
      `${BASE}img/Newton-1.png`,
      `${BASE}img/Newton-2.webp`,
      `${BASE}img/Newton-3.webp`,
      `${BASE}img/Newton-4.webp`,
      `${BASE}img/Newton-5.webp`,
      `${BASE}img/Newton-6.webp`,
      `${BASE}img/Newton-7.webp`,
    ],
    metro: "Нагатинская",
    phone: "+7 (495) 280-15-15",
    website: "https://newtonarena.ru/",
    note: "Запись осуществляется на сайте или по телефону",
    workHours: {
      weekdays: { start: "07:00", end: "24:00" },
      weekends: { start: "09:00", end: "24:00" },
    },
  },

  {
    id: "v13",
    name: "Корты-сетки",
    address: "Москва, 3-я Мытищинская ул., 16, стр. 3",
    sportsPrices: {
      badminton: { min: 1890, prime: 2250 },
      tableTennis: { min: 990, prime: 1190 },
      padel: { min: 1745, prime: 2495 },
    },
    images: [
      `${BASE}img/korty-setky-1.jpg`,
      `${BASE}img/korty-setky-2.jpg`,
      `${BASE}img/korty-setky-3.jpg`,
      `${BASE}img/korty-setky-4.jpg`,
      `${BASE}img/korty-setky-5.jpg`,
      `${BASE}img/korty-setky-6.jpg`,
    ],
    metro: "Алексеевская",
    phone: "+7 (936) 143-23-20",
    website: "https://korty-setki.ru/",
    note: "Запись осуществляется на сайте или по телефону",
    workHours: { start: "07:00", end: "23:00" },
  },

  {
    id: "v4",
    name: "Сквош Клуб Москва на Дубровке",
    address: "Москва, ул. Шарикоподшипниковская, 13, стр. 46",
    sportsPrices: {
      badminton: { min: 1700, prime: 2500 },
      squash: { min: 2800, prime: 3500 },
    },
    images: [
      `${BASE}img/Squash-1.webp`,
      `${BASE}img/Squash-2.webp`,
      `${BASE}img/Squash-3.webp`,
      `${BASE}img/Squash-4.webp`,
      `${BASE}img/Squash-5.webp`,
      `${BASE}img/Squash-6.webp`,
    ],
    metro: "Дубровка, Волгоградский проспект",
    phone: "+7 (499) 290-13-47",
    website: "https://squashclub.moscow/",
    note: "Запись осуществляется на сайте или по телефону",
    workHours: {
      weekdays: { start: "07:00", end: "23:00" },
      weekends: { start: "08:00", end: "23:00" },
    },
  },

  {
    id: "v5",
    name: "Сквош Клуб Москва на Лужниках",
    address: "Москва, Лужники д 24 с 21, Блок С. 4 этаж",
    sportsPrices: {
      tableTennis: { min: 1500, prime: 1700 },
      squash: { min: 3300, prime: 3900 },
    },
    images: [
      `${BASE}img/Squash-Luzhniki-1.webp`,
      `${BASE}img/Squash-Luzhniki-2.webp`,
      `${BASE}img/Squash-Luzhniki-3.webp`,
      `${BASE}img/Squash-Luzhniki-4.webp`,
    ],
    metro: "Воробьевы горы",
    phone: "+7 (936) 140-04-04",
    website: "https://squashclub.moscow/",
    note: "Запись осуществляется на сайте или по телефону",
    workHours: { start: "07:00", end: "23:00" },
  },

  {
    id: "v6",
    name: "New League Badminton Club, Парк Культуры",
    address: "Москва, Турчанинов переулок 3, стр. 1",
    sportsPrices: {
      badminton: { min: 2500, prime: 3500 },
    },
    images: [
      `${BASE}img/Chaika-1.webp`,
      `${BASE}img/Chaika-2.webp`,
      `${BASE}img/Chaika-3.webp`,
      `${BASE}img/Chaika-4.webp`,
      `${BASE}img/Chaika-5.webp`,
    ],
    metro: "Парк культуры",
    phone: "+7 (985) 589-97-67",
    website: "https://bc-newliga.ru/",
    note: "Запись осуществляется на сайте или по телефону",
    workHours: { start: "07:00", end: "23:00" },
  },

  {
    id: "v7",
    name: "New League Badminton Club, Лужники",
    address: "Москва, Лужники 24, стр. 21",
    sportsPrices: {
      badminton: { min: 2500, prime: 3500 },
    },
    images: [
      `${BASE}img/NLBC-1.webp`,
      `${BASE}img/NLBC-2.webp`,
      `${BASE}img/NLBC-3.webp`,
      `${BASE}img/NLBC-4.webp`,
      `${BASE}img/NLBC-5.webp`,
    ],
    metro: "Воробьевы горы",
    phone: "+7 (926) 791-13-33",
    website: "https://bc-newliga.ru/",
    note: "Запись осуществляется на сайте или по телефону",
    workHours: {
      weekdays: { start: "07:00", end: "23:00" },
      weekends: { start: "09:00", end: "23:00" },
    },
  },

  {
    id: "v8",
    name: "Натен, Юго-западная",
    address: "Москва, Проспект Вернадского 82с5",
    sportsPrices: {
      badminton: { min: 1800, prime: 1800 },
      tableTennis: { min: 1200, prime: 1200 },
    },
    images: [
      `${BASE}img/NatenU-1.webp`,
      `${BASE}img/NatenU-2.webp`,
      `${BASE}img/NatenU-3.webp`,
    ],
    metro: "Юго-западная",
    phone: "+7 499 553-09-96",
    website: "https://naten.club/",
    note: "Запись осуществляется только по телефону",
    workHours: {
      weekdays: { start: "10:00", end: "23:00" },
      weekends: { start: "10:00", end: "22:00" },
    },
  },

  {
    id: "v9",
    name: "Мультиспорт",
    address: "Москва, ул. Лужники, д. 24, стр. 10",
    sportsPrices: {
      badminton: { min: 3000, prime: 3000 },
      tableTennis: { min: 2500, prime: 2500 },
      squash: { min: 3000, prime: 3000 },
    },
    images: [
      `${BASE}img/Multisport-1.webp`,
      `${BASE}img/Multisport-2.webp`,
      `${BASE}img/Multisport-3.webp`,
      `${BASE}img/Multisport-4.webp`,
      `${BASE}img/Multisport-5.webp`,
    ],
    metro: "Лужники",
    phone: "+7 (495) 788-16-98",
    website: "https://multisport.ru/",
    note: "Запись осуществляется только по телефону",
    workHours: { start: "07:00", end: "23:00" },
  },
  {
  id: "v10",
  name: "ГАОУ Школа № 1518, Badmclub",
  address: "Москва, ВДНХ, ул. Цандера, д. 3",
  sportsPrices: {
    badminton: { min: 2500, prime: 2500 }, // 2500 ₽ за 1 час [web:83]
  },
  images: [`${BASE}img/1518-1.jpeg`],
  metro: "ВДНХ",
  phone: "+7-996-967-77-71",
  website: "https://badmclub.ru/zaly-dlja-igry-v-badminton-i-arenda-kortov/",
  note: "Аренда кортов: пн, ср, пт с 19:30 до 21:30, 2500 ₽ за 1 час, 3500 ₽ за 1,5 часа, 4000 ₽ за 2 часа \nЗапись осуществляется по телефону",
},

{
  id: "v11",
  name: "МТКП МГТУ им. Баумана, Badmclub",
  address: "Москва, Бауманская, Волховский пер., д. 11, стр. 1",
  sportsPrices: {
    badminton: { min: 2500, prime: 2500 }, // 2500 ₽ за 1 час [web:83]
  },
  images: [`${BASE}img/MGTU_Baumana-1.jpg`],
  metro: "Бауманская",
  phone: "+7-996-967-77-71",
  website: "https://badmclub.ru/zaly-dlja-igry-v-badminton-i-arenda-kortov/",
  note: "Аренда кортов: пт с 18:00 до 22:00, сб с 12:00 до 14:00, 2500 ₽ за 1 час, 3500 ₽ за 1,5 часа, 4000 ₽ за 2 часа \nЗапись осуществляется по телефону",
  },
{
  id: "v12",
  name: "Олимпийский центр им. братьев Знаменских, Badmclub",
  address: "Москва, Сокольники, ул. Стромынка, д. 4, стр. 1",
  sportsPrices: {
    badminton: { min: 2500, prime: 2500 }, // по аналогии с остальными арендами Бадмклуба [web:83]
  },
  images: [
      `${BASE}img/Sokolniki-1.jpg`,
      `${BASE}img/Sokolniki-2.jpg`,
      `${BASE}img/Sokolniki-3.jpg`
    ],
  metro: "Сокольники",
  phone: "+7-996-967-77-71",
  website: "https://badmclub.ru/zaly-dlja-igry-v-badminton-i-arenda-kortov/",
  note: "Суббота с 18.00 до 20.00, Воскресенье с 17.30 до 21.30, стоимость 2000 ₽ за 1 час, 3200 ₽ за 2 часа \nЗапись осуществляется по телефону",
},
];
