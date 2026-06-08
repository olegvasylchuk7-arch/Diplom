import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export default function Footer() {
  const { lang } = useApp();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>🏠 ТеплоДім</h4>
            <p>{lang === 'ua'
              ? 'Інтернет-магазин теплоізоляційних матеріалів від провідних виробників. Працюємо з 2014 року, обслуговуємо клієнтів по всій Україні.'
              : 'Online store of thermal insulation materials from leading manufacturers. Operating since 2014, serving customers across Ukraine.'}
            </p>
            <p style={{ marginTop: 14 }}>
              🏪 {lang === 'ua' ? 'м. Київ, вул. Промислова 14' : 'Kyiv, 14 Promyslova str.'}<br />
              📞 +380 44 200 5050<br />
              ✉ shop@teplodim.ua
            </p>
          </div>
          <div>
            <h4>{lang === 'ua' ? 'Каталог' : 'Catalog'}</h4>
            <ul>
              <li><Link to="/catalog?type=mineral">{lang === 'ua' ? 'Мінеральна вата' : 'Mineral wool'}</Link></li>
              <li><Link to="/catalog?type=basalt">{lang === 'ua' ? 'Базальтова вата' : 'Basalt wool'}</Link></li>
              <li><Link to="/catalog?type=eps">{lang === 'ua' ? 'Пінопласт' : 'EPS'}</Link></li>
              <li><Link to="/catalog?type=xps">XPS</Link></li>
              <li><Link to="/catalog?type=pur">{lang === 'ua' ? 'Поліуретан' : 'PUR'}</Link></li>
              <li><Link to="/catalog?type=eco">{lang === 'ua' ? 'Ековата' : 'Cellulose'}</Link></li>
            </ul>
          </div>
          <div>
            <h4>{lang === 'ua' ? 'Сервіси' : 'Services'}</h4>
            <ul>
              <li><Link to="/calculator">🧮 {lang === 'ua' ? 'Калькулятор утеплення' : 'Insulation calculator'}</Link></li>
              <li><Link to="/compare">{lang === 'ua' ? 'Порівняння товарів' : 'Compare products'}</Link></li>
              <li><Link to="/wholesale">{lang === 'ua' ? 'Гуртова ціна' : 'Wholesale prices'}</Link></li>
              <li><Link to="/blog">{lang === 'ua' ? 'Блог' : 'Blog'}</Link></li>
              <li><Link to="/about">{lang === 'ua' ? 'Про нас' : 'About us'}</Link></li>
              <li><Link to="/contacts">{lang === 'ua' ? 'Контакти' : 'Contacts'}</Link></li>
            </ul>
          </div>
          <div>
            <h4>{lang === 'ua' ? 'Допомога' : 'Help'}</h4>
            <ul>
              <li><Link to="/delivery">{lang === 'ua' ? 'Доставка та оплата' : 'Delivery & payment'}</Link></li>
              <li><Link to="/warranty">{lang === 'ua' ? 'Гарантія та повернення' : 'Warranty & returns'}</Link></li>
              <li><Link to="/account">{lang === 'ua' ? 'Особистий кабінет' : 'My account'}</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="copyright">
          <div>© 2014–{new Date().getFullYear()} ТеплоДім. {lang === 'ua' ? 'Всі права захищено.' : 'All rights reserved.'}</div>
          <div>{lang === 'ua' ? 'Дипломна робота • О. Васельчук' : 'Diploma project • O. Terletskyi'}</div>
        </div>
      </div>
    </footer>
  );
}
