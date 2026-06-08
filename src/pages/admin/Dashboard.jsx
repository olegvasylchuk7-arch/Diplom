import { useMemo } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { useApp } from '../../contexts/AppContext';
import { formatPrice } from '../../utils/format';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
  const { orders, lang, products, productTypes, getProduct } = useApp();

  const stats = useMemo(() => {
    const completed = orders.filter((o) => o.status !== 'cancelled');
    const revenue = completed.reduce((s, o) => s + o.total, 0);
    const avgCheck = completed.length ? Math.round(revenue / completed.length) : 0;
    const conversionPct = 4.2; // demo value
    return {
      revenue,
      ordersCount: orders.length,
      avgCheck,
      customers: new Set(orders.map((o) => o.email)).size,
      conversionPct,
    };
  }, [orders]);

  // продажі за днями (останні 7 днів)
  const salesByDay = useMemo(() => {
    const map = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map[key] = 0;
    }
    orders.forEach((o) => {
      if (o.status === 'cancelled') return;
      if (map[o.date] !== undefined) map[o.date] += o.total;
    });
    return map;
  }, [orders]);

  const lineData = {
    labels: Object.keys(salesByDay).map((d) => d.slice(5)),
    datasets: [{
      label: lang === 'ua' ? 'Виторг, грн' : 'Revenue, UAH',
      data: Object.values(salesByDay),
      borderColor: '#2E7D32',
      backgroundColor: 'rgba(76,175,80,0.2)',
      fill: true,
      tension: 0.35,
    }],
  };

  // топ-товари за к-стю продажів
  const topProducts = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      if (o.status === 'cancelled') return;
      o.items.forEach((it) => {
        map[it.productId] = (map[it.productId] || 0) + it.qty;
      });
    });
    return Object.entries(map).map(([id, qty]) => ({ id: Number(id), qty, product: getProduct(Number(id)) }))
      .filter((x) => x.product)
      .sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [orders]);

  const barData = {
    labels: topProducts.map((t) => t.product.name.slice(0, 20) + '…'),
    datasets: [{
      label: lang === 'ua' ? 'Продано упаковок' : 'Packs sold',
      data: topProducts.map((t) => t.qty),
      backgroundColor: ['#2E7D32', '#4CAF50', '#66BB6A', '#81C784', '#A5D6A7'],
    }],
  };

  // розподіл по категоріях
  const categoryStats = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      if (o.status === 'cancelled') return;
      o.items.forEach((it) => {
        const p = getProduct(it.productId);
        if (!p) return;
        map[p.type] = (map[p.type] || 0) + it.qty * it.price;
      });
    });
    return productTypes.map((t) => ({ ...t, sum: map[t.id] || 0 }))
      .filter((x) => x.sum > 0).sort((a, b) => b.sum - a.sum);
  }, [orders]);

  const doughnutData = {
    labels: categoryStats.map((c) => c.name),
    datasets: [{
      data: categoryStats.map((c) => c.sum),
      backgroundColor: ['#1B5E20', '#388E3C', '#66BB6A', '#A5D6A7', '#FFB74D', '#F57C00'],
      borderWidth: 0,
    }],
  };

  const recentOrders = orders.slice(0, 5);

  return (
    <>
      <div className="admin-header">
        <h1>📊 Dashboard</h1>
        <div className="muted">{lang === 'ua' ? 'Останні 30 днів' : 'Last 30 days'}</div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-label">{lang === 'ua' ? 'Виторг' : 'Revenue'}</div>
          <div className="stat-value">{formatPrice(stats.revenue, lang)}</div>
          <div className="stat-delta up">▲ 12.4% vs пред. місяць</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-label">{lang === 'ua' ? 'Замовлення' : 'Orders'}</div>
          <div className="stat-value">{stats.ordersCount}</div>
          <div className="stat-delta up">▲ 8 {lang === 'ua' ? 'нових сьогодні' : 'new today'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-label">{lang === 'ua' ? 'Клієнти' : 'Customers'}</div>
          <div className="stat-value">{stats.customers}</div>
          <div className="stat-delta up">▲ 3 {lang === 'ua' ? 'нових' : 'new'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-label">{lang === 'ua' ? 'Середній чек' : 'Avg order'}</div>
          <div className="stat-value">{formatPrice(stats.avgCheck, lang)}</div>
          <div className="stat-delta up">▲ {stats.conversionPct}% conv.</div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>{lang === 'ua' ? 'Виторг за тиждень' : 'Weekly revenue'}</h3>
          <Line data={lineData} options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { ticks: { callback: (v) => v.toLocaleString() + ' ₴' } } },
          }} height={100} />
        </div>
        <div className="chart-card">
          <h3>{lang === 'ua' ? 'Категорії' : 'Categories'}</h3>
          <Doughnut data={doughnutData} options={{
            plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
          }} />
        </div>
      </div>

      <div className="chart-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="chart-card">
          <h3>🏆 {lang === 'ua' ? 'Топ-5 товарів' : 'Top-5 products'}</h3>
          <Bar data={barData} options={{
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: { x: { ticks: { stepSize: 5 } } },
          }} height={140} />
        </div>
        <div className="chart-card">
          <h3>🆕 {lang === 'ua' ? 'Останні замовлення' : 'Recent orders'}</h3>
          <table className="table" style={{ boxShadow: 'none' }}>
            <thead><tr><th>№</th><th>{lang === 'ua' ? 'Клієнт' : 'Customer'}</th><th>{lang === 'ua' ? 'Сума' : 'Total'}</th><th>{lang === 'ua' ? 'Статус' : 'Status'}</th></tr></thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td><strong style={{ fontSize: 12 }}>{o.id}</strong></td>
                  <td>{o.customer}</td>
                  <td>{formatPrice(o.total, lang)}</td>
                  <td><span className={`status-dot status-${o.status}`}>●</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
