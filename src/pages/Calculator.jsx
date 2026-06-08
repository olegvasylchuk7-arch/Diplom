import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { OBJECT_TYPES, WASTE_FACTOR } from '../data/dbn';
import { calcRequiredThickness, calcMaterialVolume, calcPacks, calcArea, isSuitable } from '../utils/calculator';
import { formatPrice, formatNumber } from '../utils/format';
import Breadcrumbs from '../components/Breadcrumbs';

const STEPS = ['Об\'єкт', 'Регіон', 'Розміри', 'Утеплювач', 'Результат'];

export default function Calculator() {
  const { lang, addToCart, saveCalculation, user, pushToast, products, regions, wallMaterials } = useApp();
  const [step, setStep] = useState(1);

  /* --------- стан майстра --------- */
  const [objectType, setObjectType] = useState(null);
  const [region, setRegion] = useState(null);

  // Розміри
  const [areaMode, setAreaMode] = useState('rect');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [areaCount, setAreaCount] = useState(1);

  // Стіна
  const [wallCode, setWallCode] = useState('brick');
  const [wallMm, setWallMm] = useState(380);

  // Утеплювач
  const [insulationId, setInsulationId] = useState(null);

  const wallMaterial = useMemo(() => wallMaterials.find((w) => w.code === wallCode), [wallCode]);
  const insulation = useMemo(() => products.find((p) => p.id === insulationId), [insulationId]);

  const area = useMemo(
    () => calcArea({ shape: areaMode, length, width, height, count: areaCount }),
    [areaMode, length, width, height, areaCount]
  );

  const result = useMemo(() => {
    if (!objectType || !region || !insulation || area <= 0) return null;
    const calc = calcRequiredThickness({
      objectType, region, wallMaterial,
      wallThicknessMm: wallMm,
      insulation,
    });
    const recommendedMm = Math.max(calc.thicknessMm, insulation.thicknessMm);
    const volumeM3 = calcMaterialVolume({
      areaM2: area,
      thicknessMm: recommendedMm,
      objectTypeCode: objectType.code,
    });
    const packs = calcPacks(volumeM3, insulation.packM3);
    const totalPrice = packs * insulation.pricePerPack;
    return { ...calc, recommendedMm, area, volumeM3, packs, totalPrice };
  }, [objectType, region, insulation, area, wallMaterial, wallMm]);

  const next = () => setStep((s) => Math.min(STEPS.length, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const canNext =
    (step === 1 && objectType) ||
    (step === 2 && region) ||
    (step === 3 && area > 0) ||
    (step === 4 && insulation);

  const suitableInsulations = products.filter((p) => objectType && isSuitable(p, objectType.code));

  const handleAddToCart = () => {
    if (!result) return;
    addToCart(insulation.id, result.packs, { fromCalc: true });
  };

  const handleSave = () => {
    if (!user) {
      pushToast(lang === 'ua' ? 'Увійдіть, щоб зберегти розрахунок' : 'Sign in to save', 'info');
      return;
    }
    saveCalculation({
      objectType: objectType.code,
      objectTypeName: objectType.name,
      regionCode: region.code,
      regionName: region.name,
      area: result.area,
      recommendedMm: result.recommendedMm,
      insulationId: insulation.id,
      insulationName: insulation.name,
      packs: result.packs,
      totalPrice: result.totalPrice,
    });
  };

  /* --------- рендер --------- */
  return (
    <>
      <Breadcrumbs items={[
        { label: lang === 'ua' ? 'Головна' : 'Home', to: '/' },
        { label: lang === 'ua' ? 'Калькулятор' : 'Calculator' },
      ]} />
      <div className="container">
        <div className="calc-wizard">
          <div className="center mb-30">
            <h1>🧮 {lang === 'ua' ? 'Розумний калькулятор утеплення' : 'Smart insulation calculator'}</h1>
            <p className="muted">{lang === 'ua'
              ? 'Розраховуємо точну потребу за ДБН В.2.6-31. Регіон, тип конструкції, наявна стіна — все враховано.'
              : 'Accurate calculation according to DBN V.2.6-31 standard.'}</p>
          </div>

          {/* стрічка кроків */}
          <div className="calc-steps">
            {STEPS.map((label, i) => {
              const idx = i + 1;
              const cls = idx < step ? 'done' : idx === step ? 'active' : '';
              return (
                <div key={label} className={`calc-step-circle ${cls}`}>
                  <div className="num">{idx < step ? '✓' : idx}</div>
                  <div className="label">{label}</div>
                </div>
              );
            })}
          </div>

          <div className="card" style={{ padding: 28 }}>
            {/* ========= STEP 1 — тип об'єкта ========= */}
            {step === 1 && (
              <div>
                <h3>{lang === 'ua' ? 'Що ви утеплюєте?' : 'What are you insulating?'}</h3>
                <p className="muted">{lang === 'ua'
                  ? 'Це визначить нормативний опір теплопередачі (R) за ДБН.'
                  : 'This determines required thermal resistance R per DBN.'}</p>
                <div className="tiles-grid mt-20">
                  {OBJECT_TYPES.map((ot) => (
                    <div
                      key={ot.code}
                      className={`tile-select ${objectType?.code === ot.code ? 'active' : ''}`}
                      onClick={() => setObjectType(ot)}
                    >
                      <div className="icon">{ot.icon}</div>
                      <div className="name">{lang === 'ua' ? ot.name : ot.nameEn}</div>
                      <div className="hint">{ot.hint}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========= STEP 2 — регіон ========= */}
            {step === 2 && (
              <div>
                <h3>{lang === 'ua' ? 'У якому регіоні будівля?' : 'Which region?'}</h3>
                <p className="muted">{lang === 'ua'
                  ? 'Україна розділена на 4 температурні зони. Нормативний R залежить від кількості градусо-діб опалювального періоду.'
                  : 'Ukraine has 4 temperature zones. Required R depends on heating degree days.'}</p>
                <div className="tiles-grid mt-20">
                  {regions.map((r) => (
                    <div
                      key={r.code}
                      className={`tile-select ${region?.code === r.code ? 'active' : ''}`}
                      onClick={() => setRegion(r)}
                    >
                      <div className="icon">📍</div>
                      <div className="name">{r.name}</div>
                      <div className="hint">Зона {r.zone} • ГДОП {r.gsop}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========= STEP 3 — розміри ========= */}
            {step === 3 && (
              <div>
                <h3>{lang === 'ua' ? 'Розміри і існуюча конструкція' : 'Dimensions and existing structure'}</h3>

                <div className="field-group">
                  <label className="label">{lang === 'ua' ? 'Як ввести площу?' : 'How to input area?'}</label>
                  <div className="flex-center" style={{ gap: 8, flexWrap: 'wrap' }}>
                    <button className={`chip ${areaMode === 'rect' ? 'active' : ''}`} onClick={() => setAreaMode('rect')}>
                      {lang === 'ua' ? 'Прямокутник (Д×В)' : 'Rectangle (L×H)'}
                    </button>
                    <button className={`chip ${areaMode === 'roof-rect' ? 'active' : ''}`} onClick={() => setAreaMode('roof-rect')}>
                      {lang === 'ua' ? 'Двоскатний дах' : 'Double-slope roof'}
                    </button>
                    <button className={`chip ${areaMode === 'pipe' ? 'active' : ''}`} onClick={() => setAreaMode('pipe')}>
                      {lang === 'ua' ? 'Труба (Ø, довжина)' : 'Pipe (Ø, length)'}
                    </button>
                    <button className={`chip ${areaMode === 'free' ? 'active' : ''}`} onClick={() => setAreaMode('free')}>
                      {lang === 'ua' ? 'Просто площа (м²)' : 'Just area (m²)'}
                    </button>
                  </div>
                </div>

                {areaMode === 'rect' && (
                  <>
                    <div className="field-row">
                      <div className="field-group">
                        <label className="label">{lang === 'ua' ? 'Довжина, м' : 'Length, m'}</label>
                        <input type="number" step="0.1" className="input" value={length}
                          onChange={(e) => setLength(e.target.value)} placeholder="10" />
                      </div>
                      <div className="field-group">
                        <label className="label">{lang === 'ua' ? 'Висота, м' : 'Height, m'}</label>
                        <input type="number" step="0.1" className="input" value={height}
                          onChange={(e) => setHeight(e.target.value)} placeholder="3" />
                      </div>
                    </div>
                    <div className="field-group">
                      <label className="label">{lang === 'ua' ? 'Кількість таких ділянок' : 'Number of such sections'}</label>
                      <input type="number" min="1" className="input" value={areaCount}
                        onChange={(e) => setAreaCount(Math.max(1, Number(e.target.value) || 1))} style={{ maxWidth: 120 }} />
                    </div>
                  </>
                )}
                {areaMode === 'roof-rect' && (
                  <div className="field-row-3">
                    <div className="field-group">
                      <label className="label">{lang === 'ua' ? 'Довжина будинку, м' : 'House length, m'}</label>
                      <input type="number" step="0.1" className="input" value={length}
                        onChange={(e) => setLength(e.target.value)} placeholder="12" />
                    </div>
                    <div className="field-group">
                      <label className="label">{lang === 'ua' ? 'Ширина, м' : 'Width, m'}</label>
                      <input type="number" step="0.1" className="input" value={width}
                        onChange={(e) => setWidth(e.target.value)} placeholder="8" />
                    </div>
                    <div className="field-group">
                      <label className="label">{lang === 'ua' ? 'Висота коника від карнизу, м' : 'Ridge height above eaves, m'}</label>
                      <input type="number" step="0.1" className="input" value={height}
                        onChange={(e) => setHeight(e.target.value)} placeholder="2" />
                    </div>
                  </div>
                )}
                {areaMode === 'pipe' && (
                  <div className="field-row">
                    <div className="field-group">
                      <label className="label">{lang === 'ua' ? 'Діаметр труби, мм' : 'Pipe Ø, mm'}</label>
                      <input type="number" className="input" value={width}
                        onChange={(e) => setWidth(e.target.value)} placeholder="108" />
                    </div>
                    <div className="field-group">
                      <label className="label">{lang === 'ua' ? 'Загальна довжина, м' : 'Total length, m'}</label>
                      <input type="number" step="0.1" className="input" value={length}
                        onChange={(e) => setLength(e.target.value)} placeholder="50" />
                    </div>
                  </div>
                )}
                {areaMode === 'free' && (
                  <div className="field-group">
                    <label className="label">{lang === 'ua' ? 'Площа, м²' : 'Area, m²'}</label>
                    <input type="number" step="0.1" className="input" value={length}
                      onChange={(e) => setLength(e.target.value)} placeholder="100" style={{ maxWidth: 200 }} />
                  </div>
                )}

                <div className="card mt-20" style={{ background: '#E3F2FD' }}>
                  <strong>📐 {lang === 'ua' ? 'Розрахована площа:' : 'Calculated area:'} {formatNumber(area, 1)} м²</strong>
                </div>

                <h4 className="mt-30">{lang === 'ua' ? 'Існуюча конструкція' : 'Existing structure'}</h4>
                <p className="muted">{lang === 'ua'
                  ? 'З якого матеріалу побудована стіна? Це впливає на необхідну товщину утеплювача.'
                  : 'What is the wall made of? This affects required insulation thickness.'}</p>

                <div className="field-row">
                  <div className="field-group">
                    <label className="label">{lang === 'ua' ? 'Матеріал' : 'Material'}</label>
                    <select className="select" value={wallCode} onChange={(e) => {
                      const code = e.target.value;
                      setWallCode(code);
                      const m = wallMaterials.find((w) => w.code === code);
                      if (m) setWallMm(m.defaultMm);
                    }}>
                      {wallMaterials.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.name}{w.lambda ? ` (λ=${w.lambda})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="label">{lang === 'ua' ? 'Товщина, мм' : 'Thickness, mm'}</label>
                    <input type="number" className="input" value={wallMm}
                      onChange={(e) => setWallMm(Number(e.target.value) || 0)}
                      disabled={wallCode === 'none'} />
                  </div>
                </div>
              </div>
            )}

            {/* ========= STEP 4 — утеплювач ========= */}
            {step === 4 && (
              <div>
                <h3>{lang === 'ua' ? 'Оберіть утеплювач' : 'Choose insulation'}</h3>
                <p className="muted">{lang === 'ua'
                  ? `Підходить для типу «${objectType?.name}». Менше λ — кращі теплоізоляційні властивості.`
                  : `Suitable for ${objectType?.nameEn}. Lower λ = better insulation.`}</p>

                <div className="product-grid mt-20" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                  {suitableInsulations.map((p) => (
                    <div
                      key={p.id}
                      className={`tile-select ${insulationId === p.id ? 'active' : ''}`}
                      onClick={() => setInsulationId(p.id)}
                      style={{ padding: 16, textAlign: 'left' }}
                    >
                      <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 8 }}>
                        {({ mineral: '🟨', basalt: '🟫', eps: '🤍', xps: '🟦', pur: '🟧', eco: '🟩' })[p.type] || '📦'}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, minHeight: 36, lineHeight: 1.35 }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--c-text-2)' }}>
                        λ {p.lambda} • {p.combustibility} • {p.density} кг/м³
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-primary)', marginTop: 8 }}>
                        {formatPrice(p.pricePerM3, lang)}/м³
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========= STEP 5 — результат ========= */}
            {step === 5 && result && (
              <div>
                <h3>📋 {lang === 'ua' ? 'Результат розрахунку' : 'Calculation result'}</h3>

                <div className="result-summary">
                  <div className="muted">{lang === 'ua' ? 'Рекомендована товщина утеплення' : 'Recommended insulation thickness'}</div>
                  <div className="big-num">{result.recommendedMm} <small>мм</small></div>
                  <div style={{ marginTop: 10 }}>
                    {lang === 'ua'
                      ? `На основі ДБН для «${objectType.name}» у регіоні ${region.name}.`
                      : `Based on DBN for "${objectType.nameEn}" in ${region.name}.`}
                    {result.thicknessMm < insulation.thicknessMm &&
                      <em> {lang === 'ua' ? 'Розрахункова товщина менша за товщину плити — використовуємо стандартну.' : 'Calculated value is less than slab thickness — using standard.'}</em>
                    }
                  </div>

                  <div className="result-grid">
                    <div className="result-cell">
                      <div className="l">{lang === 'ua' ? 'Норма R за ДБН' : 'R per DBN'}</div>
                      <div className="v">{result.rDbn} м²К/Вт</div>
                    </div>
                    <div className="result-cell">
                      <div className="l">{lang === 'ua' ? 'R існуючої стіни' : 'R of existing wall'}</div>
                      <div className="v">{result.rExisting} м²К/Вт</div>
                    </div>
                    <div className="result-cell">
                      <div className="l">{lang === 'ua' ? 'Площа утеплення' : 'Insulation area'}</div>
                      <div className="v">{formatNumber(result.area, 1)} м²</div>
                    </div>
                    <div className="result-cell">
                      <div className="l">{lang === 'ua' ? 'Запас на відходи' : 'Waste factor'}</div>
                      <div className="v">+{(WASTE_FACTOR[objectType.code] * 100).toFixed(0)}%</div>
                    </div>
                    <div className="result-cell">
                      <div className="l">{lang === 'ua' ? 'Об\'єм матеріалу' : 'Material volume'}</div>
                      <div className="v">{formatNumber(result.volumeM3, 2)} м³</div>
                    </div>
                    <div className="result-cell">
                      <div className="l">{lang === 'ua' ? 'Кількість упаковок' : 'Pack count'}</div>
                      <div className="v">{result.packs} {lang === 'ua' ? 'уп.' : 'pcs'}</div>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ background: '#F1F8E9' }}>
                  <div className="space-between">
                    <div>
                      <div className="muted" style={{ fontSize: 12, textTransform: 'uppercase', fontWeight: 600 }}>
                        {lang === 'ua' ? 'Обрано:' : 'Selected:'}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>{insulation.name}</div>
                      <div className="muted" style={{ fontSize: 13 }}>
                        {insulation.packM3} м³ × {result.packs} {lang === 'ua' ? 'уп.' : 'pcs'} = {formatNumber(result.packs * insulation.packM3, 2)} м³
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="muted" style={{ fontSize: 12 }}>{lang === 'ua' ? 'Орієнтовна вартість' : 'Estimated price'}</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--c-primary)' }}>
                        {formatPrice(result.totalPrice, lang)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-center mt-20" style={{ gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
                    🛒 {lang === 'ua' ? 'Додати все в кошик' : 'Add all to cart'}
                  </button>
                  <button className="btn btn-outline" onClick={handleSave}>
                    💾 {lang === 'ua' ? 'Зберегти в кабінеті' : 'Save to my account'}
                  </button>
                  <Link to={`/product/${insulation.id}`} className="btn btn-ghost">
                    {lang === 'ua' ? 'Деталі товару' : 'Product details'}
                  </Link>
                </div>

                <div className="card mt-20" style={{ background: '#E3F2FD' }}>
                  <strong>ℹ {lang === 'ua' ? 'Як ми рахували:' : 'How we calculated:'}</strong>
                  <ul style={{ fontSize: 13, marginTop: 8 }}>
                    <li>{lang === 'ua' ? `R-норма за ДБН (зона ${region.zone}) для «${objectType.name}»: ${result.rDbn} м²К/Вт` : `DBN R-norm for zone ${region.zone}: ${result.rDbn} m²K/W`}</li>
                    <li>{lang === 'ua' ? `R існуючої стіни: ${wallMm} мм / λ ${wallMaterial.lambda} = ${result.rExisting} м²К/Вт` : `Existing R: ${result.rExisting} m²K/W`}</li>
                    <li>{lang === 'ua' ? `Додатковий R: ${result.rNeeded} м²К/Вт. Товщина = R × λ_утепл = ${result.rNeeded} × ${insulation.lambda} = ${result.thicknessMm} мм` : `Required additional R: ${result.rNeeded} m²K/W → thickness ${result.thicknessMm} mm`}</li>
                    <li>{lang === 'ua' ? `Об'єм: ${formatNumber(result.area, 1)} × ${(result.recommendedMm / 1000).toFixed(3)} × (1 + ${WASTE_FACTOR[objectType.code]}) = ${formatNumber(result.volumeM3, 2)} м³` : `Volume: ${formatNumber(result.volumeM3, 2)} m³`}</li>
                    <li>{lang === 'ua' ? `Упаковки: ⌈${formatNumber(result.volumeM3, 2)} / ${insulation.packM3}⌉ = ${result.packs} шт` : `Packs: ${result.packs}`}</li>
                  </ul>
                </div>
              </div>
            )}

            {/* кнопки */}
            <div className="space-between mt-30">
              <button className="btn btn-ghost" onClick={back} disabled={step === 1}>← {lang === 'ua' ? 'Назад' : 'Back'}</button>
              {step < STEPS.length && (
                <button className="btn btn-primary" onClick={next} disabled={!canNext}>
                  {lang === 'ua' ? 'Далі' : 'Next'} →
                </button>
              )}
              {step === STEPS.length && (
                <button className="btn btn-outline" onClick={() => {
                  setStep(1); setObjectType(null); setRegion(null);
                  setLength(''); setWidth(''); setHeight(''); setInsulationId(null);
                }}>↺ {lang === 'ua' ? 'Новий розрахунок' : 'New calculation'}</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
