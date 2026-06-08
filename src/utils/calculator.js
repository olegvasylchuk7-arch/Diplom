// Формули калькулятора утеплення (ДБН В.2.6-31).
//   R_existing = δ_стіни / λ_стіни
//   R_needed   = R_dbn - R_existing
//   δ_утепл    = R_needed × λ_утепл
//   V          = S × δ_утепл × (1 + waste)
//   packs      = ceil(V / pack.m3)

import { R_NORMS, WASTE_FACTOR } from '../data/dbn';

export function calcExistingR(wallMaterial, thicknessMm) {
  if (!wallMaterial || wallMaterial.code === 'none' || !wallMaterial.lambda) return 0;
  return (thicknessMm / 1000) / wallMaterial.lambda;
}

// Підтримуємо два формати: regions з БД (rWall/rRoof/...) і seed (zone + R_NORMS)
const rByObject = (region, dbnKey) => {
  const map = { wall: region.rWall, roof: region.rRoof, floor: region.rFloor, facade: region.rFacade, mansard: region.rMansard };
  if (map[dbnKey] !== undefined && map[dbnKey] !== null) return Number(map[dbnKey]);
  return R_NORMS[region.zone]?.[dbnKey] || 0;
};

export function calcRequiredThickness({
  objectType, region, wallMaterial, wallThicknessMm, insulation,
}) {
  const rDbn = rByObject(region, objectType.dbnKey);
  const rExisting = calcExistingR(wallMaterial, wallThicknessMm);
  const rNeeded = Math.max(rDbn - rExisting, 0);
  const deltaMeters = rNeeded * insulation.lambda;
  return {
    rDbn,
    rExisting: Math.round(rExisting * 100) / 100,
    rNeeded: Math.round(rNeeded * 100) / 100,
    thicknessMm: Math.round(deltaMeters * 1000),
  };
}

export function calcMaterialVolume({ areaM2, thicknessMm, objectTypeCode }) {
  const waste = WASTE_FACTOR[objectTypeCode] ?? 0.10;
  const grossM3 = areaM2 * (thicknessMm / 1000) * (1 + waste);
  return Math.round(grossM3 * 1000) / 1000;
}

export function calcPacks(volumeM3, packM3) {
  if (!packM3) return 0;
  return Math.ceil(volumeM3 / packM3);
}

export function isSuitable(product, objectTypeCode) {
  if (!product.suitable) return true;
  return product.suitable.includes(objectTypeCode);
}

// shape: 'rect' | 'roof-rect' | 'pipe' | 'free'
export function calcArea({ shape, length, width, height, count = 1 }) {
  if (shape === 'free')    return Math.max(0, Number(length) || 0);
  if (shape === 'rect')    return Math.max(0, (Number(length)||0) * (Number(height)||0)) * count;
  if (shape === 'roof-rect') {
    const l = Number(length)||0, w = Number(width)||0, h = Number(height)||0;
    const slope = Math.sqrt((w/2)*(w/2) + h*h);
    return Math.max(0, 2 * l * slope);
  }
  if (shape === 'pipe') {
    const d = (Number(width) || 0) / 1000;
    const L = Number(length) || 0;
    return Math.PI * d * L;
  }
  return 0;
}
