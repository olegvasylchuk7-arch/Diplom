// Норми теплової ізоляції за ДБН В.2.6-31:2021.
// R — мінімальний приведений опір теплопередачі (м²·К/Вт),
// залежить від температурної зони (I-IV) та ГДОП.

export const REGIONS = [
  { code: 'KYIV',  name: 'Київ та область',       zone: 'II',  gsop: 3850 },
  { code: 'KHAR',  name: 'Харків / Сумська обл.', zone: 'III', gsop: 4300 },
  { code: 'LVIV',  name: 'Львів / Тернопіль',     zone: 'II',  gsop: 3900 },
  { code: 'DNIP',  name: 'Дніпро / Запоріжжя',    zone: 'II',  gsop: 3700 },
  { code: 'ODES',  name: 'Одеса',                 zone: 'I',   gsop: 2800 },
  { code: 'MYK',   name: 'Миколаїв / Херсон',     zone: 'I',   gsop: 2900 },
  { code: 'VINN',  name: 'Вінниця / Хмельницька', zone: 'II',  gsop: 3700 },
  { code: 'POLT',  name: 'Полтава / Черкаси',     zone: 'II',  gsop: 3900 },
  { code: 'SUMY',  name: 'Суми / Чернігів',       zone: 'III', gsop: 4400 },
  { code: 'ZHYT',  name: 'Житомир / Рівне',       zone: 'II',  gsop: 3850 },
  { code: 'CHERN', name: 'Чернівці',              zone: 'II',  gsop: 3500 },
  { code: 'IF',    name: 'Івано-Франківськ',      zone: 'III', gsop: 4000 },
  { code: 'UZH',   name: 'Закарпаття (Ужгород)',  zone: 'I',   gsop: 3200 },
  { code: 'LUTSK', name: 'Луцьк (Волинь)',        zone: 'II',  gsop: 3700 },
  { code: 'KROP',  name: 'Кропивницький',         zone: 'II',  gsop: 3700 },
];

// R-значення (м²·К/Вт) за типом конструкції і зоною
export const R_NORMS = {
  I:   { wall: 2.8, roof: 4.2,  floor: 3.1,  facade: 2.8, mansard: 4.5 },
  II:  { wall: 3.3, roof: 4.95, floor: 3.75, facade: 3.3, mansard: 5.0 },
  III: { wall: 3.6, roof: 5.4,  floor: 4.0,  facade: 3.6, mansard: 5.4 },
  IV:  { wall: 3.9, roof: 5.85, floor: 4.3,  facade: 3.9, mansard: 5.9 },
};

export const OBJECT_TYPES = [
  { code: 'wall',    name: 'Стіна',            nameEn: 'Wall',    icon: '🧱', dbnKey: 'wall',
    hint: 'Зовнішня стіна житлового або громадського будинку' },
  { code: 'roof',    name: 'Дах / покрівля',   nameEn: 'Roof',    icon: '🏠', dbnKey: 'roof',
    hint: 'Плоска або скатна покрівля над холодним горищем' },
  { code: 'floor',   name: 'Підлога',          nameEn: 'Floor',   icon: '🟫', dbnKey: 'floor',
    hint: 'Підлога по ґрунту, над холодним підвалом або проїздом' },
  { code: 'facade',  name: 'Фасад',            nameEn: 'Facade',  icon: '🏢', dbnKey: 'facade',
    hint: 'Зовнішнє утеплення фасаду під декоративну штукатурку' },
  { code: 'mansard', name: 'Мансарда',         nameEn: 'Mansard', icon: '🔺', dbnKey: 'mansard',
    hint: 'Утеплений мансардний поверх по кроквах' },
  { code: 'pipes',   name: 'Труби / комунікації', nameEn: 'Pipes', icon: '🟦', dbnKey: 'roof',
    hint: 'Теплоізоляція трубопроводів та інженерних мереж' },
];

export const WALL_MATERIALS = [
  { code: 'brick',     name: 'Цегла керамічна',  lambda: 0.70, defaultMm: 380 },
  { code: 'silbrick',  name: 'Силікатна цегла',  lambda: 0.81, defaultMm: 380 },
  { code: 'gasblock',  name: 'Газобетон D500',   lambda: 0.14, defaultMm: 300 },
  { code: 'foamblock', name: 'Пінобетон D600',   lambda: 0.22, defaultMm: 300 },
  { code: 'wood',      name: 'Дерев\'яний брус', lambda: 0.15, defaultMm: 150 },
  { code: 'concrete',  name: 'Залізобетон',      lambda: 1.74, defaultMm: 200 },
  { code: 'frame',     name: 'Каркасна стіна',   lambda: 0.18, defaultMm: 150 },
  { code: 'none',      name: 'Без існуючої конструкції', lambda: null, defaultMm: 0 },
];

// Запас на нахлести і відходи
export const WASTE_FACTOR = {
  wall: 0.10,
  roof: 0.15,
  floor: 0.07,
  facade: 0.10,
  mansard: 0.15,
  pipes: 0.10,
};
