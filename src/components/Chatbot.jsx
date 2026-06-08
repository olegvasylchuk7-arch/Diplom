import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { QUESTIONS_FAQ } from '../data/reviews';

const RULES = [
  { keys: ['калькулятор', 'розрахун', 'товщина', 'скільки треба', 'calc'],
    answer: 'Скористайтесь нашим розумним калькулятором — він враховує регіон за ДБН і тип конструкції.',
    link: { to: '/calculator', label: 'Відкрити калькулятор →' } },
  { keys: ['доставка', 'нова пошта', 'shipping', 'delivery'],
    answer: 'Доставляємо Новою Поштою на відділення, поштомати або кур\'єром. При замовленні від 15 000 грн — безкоштовно.' },
  { keys: ['оплата', 'liqpay', 'fondy', 'картка', 'pay'],
    answer: 'Приймаємо оплату карткою (LiqPay), післяплатою та безготівковим розрахунком для юросіб.' },
  { keys: ['опт', 'гурт', 'wholesale', 'b2b'],
    answer: 'Від 10 м³ — 5%, від 30 м³ — 8%, від 50 м³ — 10%. Для індивідуальних умов залиште заявку.',
    link: { to: '/wholesale', label: 'Запит на гуртову ціну →' } },
  { keys: ['вата', 'мінвата', 'mineral'],
    answer: 'Мінеральна та базальтова вата негорючі (НГ), мають високу паропроникність. Підходять для фасадів, дахів, перекриттів.',
    link: { to: '/catalog?type=mineral', label: 'Мінеральна вата →' } },
  { keys: ['пінопласт', 'eps'],
    answer: 'Пінопласт ПСБ-С 25/35 — економічний варіант для фасадів. Дешевший за вату, але горючий (Г1-Г3) і слабо «дихає».',
    link: { to: '/catalog?type=eps', label: 'Пінопласт →' } },
  { keys: ['xps', 'пеноплекс', 'екструд'],
    answer: 'XPS — найміцніший утеплювач, не вбирає воду. Для цоколя, фундаменту, підлоги під стяжку.',
    link: { to: '/catalog?type=xps', label: 'XPS →' } },
  { keys: ['порівн', 'compare'],
    answer: 'Додайте до 4-х товарів у порівняння (кнопка ⚖ на картці) і відкрийте сторінку порівняння.',
    link: { to: '/compare', label: 'Порівняти товари →' } },
  { keys: ['гарантія', 'повернення', 'warranty', 'return'],
    answer: '12 місяців гарантії на матеріал. Повернення протягом 14 днів за умови збереження товарного виду.' },
];

const SUGGESTIONS = [
  'Як розрахувати кількість утеплювача?',
  'Скільки коштує доставка?',
  'Опт від 50 м³',
  'Вата чи пінопласт?',
  'Гарантія і повернення',
];

function findAnswer(text) {
  const norm = text.toLowerCase();
  for (const r of RULES) if (r.keys.some((k) => norm.includes(k))) return r;
  for (const q of QUESTIONS_FAQ) {
    const norm2 = q.q.toLowerCase();
    if (norm2.includes(norm) || norm.split(' ').some((w) => w.length > 3 && norm2.includes(w))) {
      return { answer: q.a };
    }
  }
  return {
    answer: 'Не знайшов точної відповіді. Спробуйте переформулювати або напишіть нам на shop@teplodim.ua — менеджер відповість протягом години.',
  };
}

export default function Chatbot() {
  const { lang } = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: lang === 'ua'
        ? 'Вітаю! Я допоможу обрати утеплювач, розрахувати кількість і відповім на типові питання. Що цікавить?'
        : 'Hi! I can help you choose insulation, calculate quantity and answer common questions. What do you need?' },
  ]);
  const [input, setInput] = useState('');
  const bodyRef = useRef();

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, open]);

  const send = (text) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setMessages((prev) => [...prev, { from: 'user', text: q }]);
    setInput('');
    setTimeout(() => {
      const { answer, link } = findAnswer(q);
      setMessages((prev) => [...prev, { from: 'bot', text: answer, link }]);
    }, 350);
  };

  return (
    <>
      <button className="chatbot-fab" onClick={() => setOpen((v) => !v)} title="Чат-бот">
        {open ? '×' : '💬'}
      </button>

      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div>
              <strong>{lang === 'ua' ? 'ТеплоБот' : 'TeploBot'}</strong>
              <div style={{ fontSize: 11, opacity: 0.85 }}>● {lang === 'ua' ? 'онлайн' : 'online'}</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ color: '#fff', fontSize: 20 }}>×</button>
          </div>

          <div className="chatbot-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-msg ${m.from}`}>
                {m.text}
                {m.link && (
                  <div style={{ marginTop: 8 }}>
                    <Link to={m.link.to} onClick={() => setOpen(false)} style={{ color: 'inherit', fontWeight: 600 }}>
                      {m.link.label}
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          {messages.length < 3 && (
            <div className="chatbot-suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            style={{ display: 'flex', borderTop: '1px solid var(--c-border)', padding: 8, gap: 6 }}
          >
            <input
              className="input"
              placeholder={lang === 'ua' ? 'Введіть питання...' : 'Ask anything...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">➤</button>
          </form>
        </div>
      )}
    </>
  );
}
