export const formatPrice = (val, lang = 'ua') => {
  const n = Math.round(Number(val) || 0);
  const formatted = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return lang === 'en' ? `${formatted} UAH` : `${formatted} грн`;
};

export const formatNumber = (val, digits = 2) => {
  const n = Number(val) || 0;
  return n.toFixed(digits).replace(/\.?0+$/, '');
};

export const formatDate = (iso, lang = 'ua') => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const months = lang === 'en'
    ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    : ['січ','лют','бер','кві','тра','чер','лип','сер','вер','жов','лис','гру'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

// forms = ['товар', 'товари', 'товарів']
export const pluralize = (n, forms) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
};

export const generateOrderId = () => {
  const d = new Date();
  const y = d.getFullYear();
  const stamp = Math.floor(Math.random() * 9000) + 1000;
  return `ORD-${y}-${stamp}`;
};
