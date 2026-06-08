// Друк документів через HTML + window.print() — щоб коректно показувати
// кирилицю (вбудовані шрифти jsPDF її не підтримують).

import { formatPrice, formatDate } from './format';
import { getProduct as getSeedProduct } from '../data/products';

const BASE_CSS = `
  * { box-sizing: border-box; }
  body {
    font-family: 'Inter', 'Segoe UI', Roboto, system-ui, sans-serif;
    color: #1a1a1a;
    margin: 0;
    padding: 28px 36px;
    font-size: 13px;
    line-height: 1.45;
  }
  h1 { font-size: 22px; margin: 0 0 6px; color: #1B5E20; }
  h2 { font-size: 16px; margin: 18px 0 8px; }
  h3 { font-size: 14px; margin: 16px 0 6px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th, td { padding: 8px 10px; border-bottom: 1px solid #E2E6E2; text-align: left; }
  th { background: #F1F8E9; font-weight: 600; color: #5F6B6F; text-transform: uppercase; font-size: 11px; letter-spacing: 0.3px; }
  .right { text-align: right; }
  .center { text-align: center; }
  .muted { color: #5F6B6F; }
  .brand-bar {
    display: flex; justify-content: space-between; align-items: flex-start;
    border-bottom: 2px solid #1B5E20; padding-bottom: 14px; margin-bottom: 18px;
  }
  .brand-bar .logo { font-size: 20px; font-weight: 800; color: #1B5E20; }
  .brand-bar .meta { text-align: right; font-size: 12px; color: #5F6B6F; }
  .info-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 12px 0;
  }
  .info-grid > div { padding: 10px 12px; background: #F6F8F6; border-radius: 6px; font-size: 12px; }
  .info-grid strong { display: block; color: #5F6B6F; font-size: 10px;
    text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 3px; font-weight: 600; }
  .totals { margin-top: 14px; width: 320px; margin-left: auto; }
  .totals tr td { border-bottom: 1px dashed #E2E6E2; padding: 6px 4px; }
  .totals .grand td { border-top: 2px solid #1B5E20; border-bottom: none;
    font-weight: 700; font-size: 16px; color: #1B5E20; padding-top: 10px; }
  .stamp {
    margin-top: 30px; padding: 14px; border: 2px dashed #4CAF50;
    border-radius: 8px; background: #F1F8E9; font-size: 12px; color: #1B5E20;
  }
  .footer-note {
    margin-top: 30px; padding-top: 14px; border-top: 1px solid #E2E6E2;
    font-size: 11px; color: #5F6B6F; text-align: center;
  }
  @media print {
    body { padding: 16mm 14mm; }
    @page { margin: 0; size: A4; }
  }
`;

const BRAND_HEADER = `
  <div class="brand-bar">
    <div>
      <div class="logo">🏠 ТеплоДім</div>
      <div class="muted" style="font-size:11px">Інтернет-магазин теплоізоляційних матеріалів</div>
    </div>
    <div class="meta">
      м. Київ, вул. Промислова 14<br/>
      +380 44 200 5050 • shop@teplodim.ua<br/>
      ЄДРПОУ 42158930 • ІПН 421589326587
    </div>
  </div>
`;

const ESC = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

function openPrintWindow(title, body) {
  const w = window.open('', '_blank', 'width=900,height=1100');
  if (!w) {
    alert('Будь ласка, дозвольте відкриття pop-up для друку документа.');
    return;
  }
  w.document.write(`<!DOCTYPE html>
<html lang="uk">
  <head>
    <meta charset="UTF-8" />
    <title>${ESC(title)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>${BASE_CSS}</style>
  </head>
  <body>
    ${body}
  </body>
</html>`);
  w.document.close();
  setTimeout(() => { try { w.focus(); w.print(); } catch { /* ignore */ } }, 600);
}

/* ---------------- Накладна ---------------- */
export function generateInvoicePDF(order, getProduct = getSeedProduct) {
  const rows = order.items.map((it, i) => {
    const p = getProduct(it.productId);
    const sum = it.qty * it.price;
    return `
      <tr>
        <td>${i + 1}</td>
        <td>
          <div style="font-weight:600">${ESC(p?.name || 'Товар')}</div>
          <div class="muted" style="font-size:11px">${ESC(p?.sku || '')}</div>
        </td>
        <td class="center">${it.qty}</td>
        <td class="right">${ESC(formatPrice(it.price))}</td>
        <td class="right"><strong>${ESC(formatPrice(sum))}</strong></td>
      </tr>`;
  }).join('');

  const body = `
    ${BRAND_HEADER}
    <h1>Видаткова накладна № ${ESC(order.id)}</h1>
    <div class="muted">від ${ESC(formatDate(order.date))}</div>

    <div class="info-grid">
      <div>
        <strong>Покупець</strong>
        ${ESC(order.customer)}<br/>
        ${ESC(order.phone || '')}<br/>
        ${ESC(order.email || '')}
      </div>
      <div>
        <strong>Доставка</strong>
        ${ESC(order.shipping?.city || '—')}<br/>
        ${ESC(order.shipping?.branch || '')}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:28px">#</th>
          <th>Найменування</th>
          <th class="center" style="width:60px">К-сть</th>
          <th class="right" style="width:100px">Ціна, грн</th>
          <th class="right" style="width:120px">Сума, грн</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <table class="totals">
      <tr><td>Усього товарів</td><td class="right">${ESC(formatPrice(order.total))}</td></tr>
      <tr class="grand"><td>До сплати</td><td class="right">${ESC(formatPrice(order.total))}</td></tr>
    </table>

    <div class="stamp">
      <strong>Спосіб оплати:</strong> ${({
        liqpay: 'Карткою онлайн (LiqPay) — сплачено',
        cod: 'Післяплата при отриманні',
        bank: 'Безготівковий розрахунок',
      })[order.payment] || '—'}<br/>
      <strong>Статус:</strong> ${ESC(order.status)}
    </div>

    <div class="footer-note">
      Дякуємо за покупку! Збережіть накладну для звернення у разі гарантійного випадку.<br/>
      teplodim.ua • support@teplodim.ua
    </div>
  `;
  openPrintWindow(`Накладна ${order.id}`, body);
}

/* ---------------- Гарантійний талон ---------------- */
export function generateWarrantyPDF(order, getProduct = getSeedProduct) {
  const items = order.items.map((it) => {
    const p = getProduct(it.productId);
    return `
      <tr>
        <td>
          <div style="font-weight:600">${ESC(p?.name || '')}</div>
          <div class="muted" style="font-size:11px">SKU ${ESC(p?.sku || '')}</div>
        </td>
        <td class="center">${it.qty} уп.</td>
      </tr>`;
  }).join('');

  const validUntil = new Date(order.date);
  validUntil.setFullYear(validUntil.getFullYear() + 1);

  const body = `
    ${BRAND_HEADER}
    <h1>Гарантійний талон № ${ESC(order.id)}</h1>

    <div class="info-grid">
      <div>
        <strong>Власник</strong>
        ${ESC(order.customer)}<br/>
        ${ESC(order.phone || '')}
      </div>
      <div>
        <strong>Термін дії гарантії</strong>
        12 місяців<br/>
        до ${ESC(formatDate(validUntil.toISOString().slice(0, 10)))}
      </div>
    </div>

    <h2>Перелік товарів</h2>
    <table>
      <thead><tr><th>Найменування</th><th class="center" style="width:120px">Кількість</th></tr></thead>
      <tbody>${items}</tbody>
    </table>

    <h2>Умови гарантії</h2>
    <p>Магазин «ТеплоДім» надає гарантію на якість матеріалів терміном на 12 місяців з дати продажу
    (${ESC(formatDate(order.date))}). У гарантійний період здійснюється безкоштовна заміна або повернення
    коштів за товар, у якому виявлено заводський дефект.</p>

    <h3>Гарантія не поширюється на:</h3>
    <ul>
      <li>пошкодження, спричинені порушенням правил монтажу та експлуатації;</li>
      <li>механічні пошкодження після передачі товару покупцю;</li>
      <li>наслідки контакту з відкритим вогнем (для горючих матеріалів класу Г1–Г4);</li>
      <li>зміни характеристик утеплювача внаслідок зволоження після монтажу.</li>
    </ul>

    <div class="stamp">
      <strong>Підпис продавця:</strong> _________________________ /Терлецький О.І./<br/>
      <strong>М.П.</strong> (місце для печатки)
    </div>

    <div class="footer-note">
      Для звернення за гарантією напишіть на warranty@teplodim.ua або зателефонуйте +380 44 200 5050.
    </div>
  `;
  openPrintWindow(`Гарантія ${order.id}`, body);
}

/* ---------------- Комерційна пропозиція ---------------- */
export function generateQuotePDF({ items, total, customer = 'ТОВ «___________»' }, getProduct = getSeedProduct) {
  const rows = items.map((it, i) => {
    const p = it.product || getProduct(it.productId);
    const price = it.price ?? p?.pricePerPack ?? 0;
    const sum = it.qty * price;
    return `
      <tr>
        <td>${i + 1}</td>
        <td>
          <div style="font-weight:600">${ESC(p?.name || '')}</div>
          <div class="muted" style="font-size:11px">${ESC(p?.brand || '')} • λ ${ESC(p?.lambda)} • ${ESC(p?.combustibility)}</div>
        </td>
        <td class="center">${it.qty}</td>
        <td class="right">${ESC(formatPrice(price))}</td>
        <td class="right"><strong>${ESC(formatPrice(sum))}</strong></td>
      </tr>`;
  }).join('');

  const today = formatDate(new Date().toISOString().slice(0, 10));
  const vat = Math.round(total / 6);
  const noVat = total - vat;

  const body = `
    ${BRAND_HEADER}
    <h1>Комерційна пропозиція</h1>
    <div class="muted">№ КП-${Date.now().toString().slice(-6)} від ${ESC(today)}</div>

    <div class="info-grid">
      <div>
        <strong>Постачальник</strong>
        ТОВ «ТеплоДім»<br/>
        ЄДРПОУ 42158930<br/>
        м. Київ, вул. Промислова 14
      </div>
      <div>
        <strong>Контрагент</strong>
        ${ESC(customer)}
      </div>
    </div>

    <h2>Специфікація товарів</h2>
    <table>
      <thead>
        <tr>
          <th style="width:28px">#</th>
          <th>Найменування</th>
          <th class="center" style="width:60px">К-сть, уп.</th>
          <th class="right" style="width:100px">Ціна з ПДВ</th>
          <th class="right" style="width:120px">Сума з ПДВ</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <table class="totals">
      <tr><td>Сума без ПДВ</td><td class="right">${ESC(formatPrice(noVat))}</td></tr>
      <tr><td>ПДВ (20%)</td><td class="right">${ESC(formatPrice(vat))}</td></tr>
      <tr class="grand"><td>Всього з ПДВ</td><td class="right">${ESC(formatPrice(total))}</td></tr>
    </table>

    <h3>Умови співпраці</h3>
    <ul>
      <li><strong>Термін дії пропозиції:</strong> 14 календарних днів з моменту створення.</li>
      <li><strong>Оплата:</strong> безготівковий розрахунок, після виставлення рахунку.</li>
      <li><strong>Доставка:</strong> Новою Поштою або вантажним перевізником (вартість додатково).</li>
      <li><strong>Гарантія:</strong> 12 місяців на всі позиції.</li>
      <li><strong>При обсязі від 50 м³:</strong> додаткова знижка 10% (вже врахована).</li>
    </ul>

    <div class="stamp">
      <strong>Контактна особа:</strong> Терлецький Олег Ігорович<br/>
      <strong>Тел.:</strong> +380 44 200 5050 (доб. 102)<br/>
      <strong>Email:</strong> b2b@teplodim.ua
    </div>

    <div class="footer-note">
      Дякуємо за зацікавленість! Очікуємо на співпрацю.<br/>
      teplodim.ua • b2b@teplodim.ua
    </div>
  `;
  openPrintWindow(`КП ${today}`, body);
}
