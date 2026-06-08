// Імітація API Нової Пошти. У production — заміна на fetch до
// https://api.novaposhta.ua/v2.0/json/ з ключем API.

export const NP_CITIES = [
  { ref: 'kyiv',   name: 'Київ' },
  { ref: 'kharkiv',name: 'Харків' },
  { ref: 'lviv',   name: 'Львів' },
  { ref: 'dnipro', name: 'Дніпро' },
  { ref: 'odesa',  name: 'Одеса' },
  { ref: 'zapor',  name: 'Запоріжжя' },
  { ref: 'vinn',   name: 'Вінниця' },
  { ref: 'poltava',name: 'Полтава' },
  { ref: 'sumy',   name: 'Суми' },
  { ref: 'cherniv',name: 'Чернігів' },
  { ref: 'zhytomyr',name: 'Житомир' },
  { ref: 'khmel',  name: 'Хмельницький' },
  { ref: 'cherkasy',name: 'Черкаси' },
  { ref: 'kropy',  name: 'Кропивницький' },
  { ref: 'mykol',  name: 'Миколаїв' },
  { ref: 'kherson',name: 'Херсон' },
  { ref: 'lutsk',  name: 'Луцьк' },
  { ref: 'rivne',  name: 'Рівне' },
  { ref: 'ternop', name: 'Тернопіль' },
  { ref: 'ivfr',   name: 'Івано-Франківськ' },
  { ref: 'chernivtsi',name: 'Чернівці' },
  { ref: 'uzh',    name: 'Ужгород' },
];

const generateBranches = (cityName, count, type = 'branch') => {
  const out = [];
  for (let i = 1; i <= count; i++) {
    out.push({
      ref: `${cityName}-${type}-${i}`,
      number: i,
      type, // 'branch' | 'poshtomat' | 'cargo'
      address: type === 'poshtomat'
        ? `${cityName}, поштомат №${1000 + i}, ${['вул. Шевченка', 'вул. Грушевського', 'просп. Перемоги', 'вул. Сагайдачного', 'вул. Лесі Українки'][i % 5]}, ${i + 10}`
        : type === 'cargo'
        ? `${cityName}, вантажне відділення №${i}, ${['вул. Промислова', 'вул. Складська'][i % 2]}, ${i + 20}`
        : `${cityName}, відділення №${i}, ${['вул. Хрещатик', 'вул. Сумська', 'вул. Городоцька', 'просп. Соборний', 'вул. Дерибасівська'][i % 5]}, ${i + 5}`,
      hours: type === 'poshtomat' ? '24/7' : 'Пн-Пт 09:00–20:00, Сб-Нд 09:00–17:00',
    });
  }
  return out;
};

export const getBranches = (cityRef, type) => {
  const city = NP_CITIES.find((c) => c.ref === cityRef);
  if (!city) return [];
  if (type === 'np-branch')    return generateBranches(city.name, 12, 'branch');
  if (type === 'np-poshtomat') return generateBranches(city.name, 18, 'poshtomat');
  if (type === 'np-cargo')     return generateBranches(city.name, 4,  'cargo');
  return [];
};

export const SHIPPING_TYPES = [
  { code: 'np-branch',    name: 'Відділення Нової Пошти',     price: 220 },
  { code: 'np-poshtomat', name: 'Поштомат Нової Пошти',       price: 165 },
  { code: 'np-cargo',     name: 'Вантажне відділення (опт)',  price: 380 },
  { code: 'np-courier',   name: 'Кур\'єр НП «під двері»',     price: 320 },
];
