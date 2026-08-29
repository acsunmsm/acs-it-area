'use client';

import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGaugeHigh,
  faFire,
  faWater,
  faFlask,
  faCube,
  faThermometerHalf,
  faArrowRightArrowLeft,
  faCopy,
  faCheck,
  faLightbulb,
  faWeightHanging
} from '@fortawesome/free-solid-svg-icons';

// Definition of unit conversion datasets
const CATEGORIES = {
  pressure: {
    id: 'pressure',
    name: 'Presión',
    icon: faGaugeHigh,
    base: 'Pa',
    units: {
      Pa: { name: 'Pascal (Pa)', factor: 1 },
      kPa: { name: 'Kilopascal (kPa)', factor: 1e3 },
      bar: { name: 'Bar (bar)', factor: 1e5 },
      atm: { name: 'Atmósfera (atm)', factor: 101325 },
      psi: { name: 'Psi (lb/in²)', factor: 6894.757293 },
      mmHg: { name: 'mmHg / Torr', factor: 133.322368 },
      'kgf/cm2': { name: 'kgf/cm²', factor: 98066.5 }
    },
    presets: [
      { label: '1 atm estándar', val: 1, from: 'atm', to: 'kPa' },
      { label: '1 bar', val: 1, from: 'bar', to: 'psi' },
      { label: '14.7 psi (1 atm)', val: 14.7, from: 'psi', to: 'mmHg' },
      { label: '100 kPa', val: 100, from: 'kPa', to: 'bar' }
    ]
  },
  energy: {
    id: 'energy',
    name: 'Energía / Calor',
    icon: faFire,
    base: 'J',
    units: {
      J: { name: 'Joule (J)', factor: 1 },
      kJ: { name: 'Kilojoule (kJ)', factor: 1000 },
      cal: { name: 'Caloría (cal)', factor: 4.184 },
      kcal: { name: 'Kilocaloría (kcal)', factor: 4184 },
      BTU: { name: 'BTU (British Thermal Unit)', factor: 1055.05585 },
      kWh: { name: 'Kilovatio-hora (kWh)', factor: 3600000 }
    },
    presets: [
      { label: '1 kcal (alimentos)', val: 1, from: 'kcal', to: 'kJ' },
      { label: '1 BTU', val: 1, from: 'BTU', to: 'J' },
      { label: '1 kWh', val: 1, from: 'kWh', to: 'BTU' }
    ]
  },
  flow_volumetric: {
    id: 'flow_volumetric',
    name: 'Caudal Volumétrico',
    icon: faWater,
    base: 'm3_s',
    units: {
      m3_s: { name: 'm³/s', factor: 1 },
      L_min: { name: 'L/min (LPM)', factor: 1 / 60000 },
      gpm: { name: 'gpm (gal US/min)', factor: 6.30901964e-5 },
      ft3_s: { name: 'ft³/s (CFS)', factor: 0.0283168466 }
    },
    presets: [
      { label: '10 L/min', val: 10, from: 'L_min', to: 'gpm' },
      { label: '1 gpm', val: 1, from: 'gpm', to: 'L_min' },
      { label: '1 m³/s', val: 1, from: 'm3_s', to: 'ft3_s' }
    ]
  },
  flow_mass: {
    id: 'flow_mass',
    name: 'Caudal Másico',
    icon: faWeightHanging,
    base: 'kg_s',
    units: {
      kg_s: { name: 'kg/s', factor: 1 },
      kg_h: { name: 'kg/h', factor: 1 / 3600 },
      lb_s: { name: 'lb/s', factor: 0.45359237 },
      lb_h: { name: 'lb/h', factor: 0.45359237 / 3600 }
    },
    presets: [
      { label: '100 kg/h', val: 100, from: 'kg_h', to: 'lb_h' },
      { label: '1 lb/s', val: 1, from: 'lb_s', to: 'kg_s' }
    ]
  },
  viscosity_dynamic: {
    id: 'viscosity_dynamic',
    name: 'Viscosidad Dinámica',
    icon: faFlask,
    base: 'Pa_s',
    units: {
      Pa_s: { name: 'Pa·s (kg/(m·s))', factor: 1 },
      cP: { name: 'cP (centipoise)', factor: 0.001 },
      P: { name: 'P (poise)', factor: 0.1 },
      lb_ft_s: { name: 'lb/(ft·s)', factor: 1.48816394 }
    },
    presets: [
      { label: '1 cP (Agua a 20°C)', val: 1, from: 'cP', to: 'Pa_s' },
      { label: '1 Pa·s', val: 1, from: 'Pa_s', to: 'cP' }
    ]
  },
  viscosity_kinematic: {
    id: 'viscosity_kinematic',
    name: 'Viscosidad Cinemática',
    icon: faFlask,
    base: 'm2_s',
    units: {
      m2_s: { name: 'm²/s', factor: 1 },
      cSt: { name: 'cSt (centistokes)', factor: 1e-6 },
      St: { name: 'St (stokes)', factor: 1e-4 },
      ft2_s: { name: 'ft²/s', factor: 0.09290304 }
    },
    presets: [
      { label: '1 cSt (Agua a 20°C)', val: 1, from: 'cSt', to: 'm2_s' },
      { label: '1 St', val: 1, from: 'St', to: 'cSt' }
    ]
  },
  density: {
    id: 'density',
    name: 'Densidad',
    icon: faCube,
    base: 'kg_m3',
    units: {
      kg_m3: { name: 'kg/m³', factor: 1 },
      g_cm3: { name: 'g/cm³', factor: 1000 },
      lb_ft3: { name: 'lb/ft³', factor: 16.018463 },
      lb_gal: { name: 'lb/gal (US)', factor: 119.826427 }
    },
    presets: [
      { label: '1 g/cm³ (Agua)', val: 1, from: 'g_cm3', to: 'kg_m3' },
      { label: '62.4 lb/ft³ (Agua)', val: 62.4, from: 'lb_ft3', to: 'kg_m3' }
    ]
  },
  temperature: {
    id: 'temperature',
    name: 'Temperatura',
    icon: faThermometerHalf,
    isTemperature: true,
    units: {
      C: { name: 'Celsius (°C)' },
      K: { name: 'Kelvin (K)' },
      F: { name: 'Fahrenheit (°F)' },
      R: { name: 'Rankine (°R)' }
    },
    presets: [
      { label: '0 °C (Fusión H2O)', val: 0, from: 'C', to: 'K' },
      { label: '25 °C (Ambiente)', val: 25, from: 'C', to: 'F' },
      { label: '100 °C (Ebullición H2O)', val: 100, from: 'C', to: 'F' },
      { label: '98.6 °F (Cuerpo)', val: 98.6, from: 'F', to: 'C' }
    ]
  }
};

// Temperature conversion functions
function convertTemp(value, from, to) {
  let val = parseFloat(value);
  if (isNaN(val)) return 0;

  // Convert from input to Celsius first
  let c = 0;
  if (from === 'C') c = val;
  else if (from === 'K') c = val - 273.15;
  else if (from === 'F') c = (val - 32) * (5 / 9);
  else if (from === 'R') c = (val - 491.67) * (5 / 9);

  // Convert Celsius to target
  if (to === 'C') return c;
  if (to === 'K') return c + 273.15;
  if (to === 'F') return c * (9 / 5) + 32;
  if (to === 'R') return (c + 273.15) * (9 / 5);
  return c;
}

function getTempFormulaString(from, to, inputVal, resultVal) {
  if (from === to) return `${inputVal} ${from} = ${resultVal} ${to}`;
  if (from === 'C' && to === 'K') return `K = °C + 273.15  ⇒  ${inputVal} + 273.15 = ${resultVal} K`;
  if (from === 'K' && to === 'C') return `°C = K - 273.15  ⇒  ${inputVal} - 273.15 = ${resultVal} °C`;
  if (from === 'C' && to === 'F') return `°F = (°C × 9/5) + 32  ⇒  (${inputVal} × 1.8) + 32 = ${resultVal} °F`;
  if (from === 'F' && to === 'C') return `°C = (°F - 32) × 5/9  ⇒  (${inputVal} - 32) × 0.5556 = ${resultVal} °C`;
  if (from === 'C' && to === 'R') return `°R = (°C + 273.15) × 9/5  ⇒  (${inputVal} + 273.15) × 1.8 = ${resultVal} °R`;
  if (from === 'F' && to === 'R') return `°R = °F + 459.67  ⇒  ${inputVal} + 459.67 = ${resultVal} °R`;
  if (from === 'K' && to === 'R') return `°R = K × 1.8  ⇒  ${inputVal} × 1.8 = ${resultVal} °R`;
  return `Conversión de ${from} a ${to}: ${resultVal}`;
}

export default function UnitConverter() {
  const [categoryKey, setCategoryKey] = useState('pressure');
  const [inputValue, setInputValue] = useState(1);
  const [fromUnit, setFromUnit] = useState('atm');
  const [toUnit, setToUnit] = useState('kPa');
  const [copied, setCopied] = useState(false);

  const activeCategory = CATEGORIES[categoryKey];

  // Handle category switch
  const handleCategoryChange = (key) => {
    setCategoryKey(key);
    const cat = CATEGORIES[key];
    const unitKeys = Object.keys(cat.units);
    setFromUnit(unitKeys[0]);
    setToUnit(unitKeys[1] || unitKeys[0]);
    setInputValue(1);
  };

  // Bidirectional swap
  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  // Perform calculation
  const { result, formulaText } = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return { result: '0', formulaText: '' };

    if (activeCategory.isTemperature) {
      const resVal = convertTemp(num, fromUnit, toUnit);
      // Format cleanly
      const formattedRes = Number.isInteger(resVal) ? resVal.toString() : parseFloat(resVal.toFixed(6)).toString();
      const formula = getTempFormulaString(fromUnit, toUnit, num, formattedRes);
      return { result: formattedRes, formulaText: formula };
    } else {
      const fromObj = activeCategory.units[fromUnit];
      const toObj = activeCategory.units[toUnit];
      if (!fromObj || !toObj) return { result: '0', formulaText: '' };

      const baseValue = num * fromObj.factor;
      const resValue = baseValue / toObj.factor;

      let formattedRes = resValue.toPrecision(7);
      if (Math.abs(resValue) >= 1e-4 && Math.abs(resValue) < 1e7) {
        formattedRes = parseFloat(resValue.toFixed(6)).toString();
      }

      const ratio = fromObj.factor / toObj.factor;
      const ratioStr = ratio.toPrecision(6);

      const text = `1 ${fromUnit} = ${ratioStr} ${toUnit}  ⇒  ${num} × ${ratioStr} = ${formattedRes} ${toUnit}`;
      return { result: formattedRes, formulaText: text };
    }
  }, [inputValue, fromUnit, toUnit, activeCategory]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${inputValue} ${fromUnit} = ${result} ${toUnit}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyPreset = (preset) => {
    setInputValue(preset.val);
    setFromUnit(preset.from);
    setToUnit(preset.to);
  };

  return (
    <div className="chemtools-card animate-fade-in">
      <div className="chemtools-card-header">
        <h2 className="chemtools-card-title">
          <FontAwesomeIcon icon={faArrowRightArrowLeft} />
          Conversor Multimagnitud de Ingeniería Química
        </h2>
        <span className="chemtools-badge">SI · Inglés · Técnico</span>
      </div>

      {/* Category Pills */}
      <div className="unit-category-pills">
        {Object.values(CATEGORIES).map((cat) => (
          <button
            key={cat.id}
            className={`category-pill-btn ${categoryKey === cat.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat.id)}
          >
            <FontAwesomeIcon icon={cat.icon} />
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Main Interactive Converter Box */}
      <div className="converter-box">
        <div className="row g-4 align-items-center">
          {/* Input Source */}
          <div className="col-md-5">
            <div className="converter-input-group">
              <label>Valor y Unidad de Origen</label>
              <div className="converter-field-wrap">
                <input
                  type="number"
                  className="converter-number-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  step="any"
                  placeholder="0.0"
                />
                <select
                  className="converter-unit-select"
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                >
                  {Object.entries(activeCategory.units).map(([key, u]) => (
                    <option key={key} value={key}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="col-md-2 text-center my-2 my-md-0">
            <button
              className="converter-swap-btn"
              onClick={handleSwap}
              title="Intercambiar unidades de Origen y Destino"
            >
              <FontAwesomeIcon icon={faArrowRightArrowLeft} />
            </button>
          </div>

          {/* Target Result */}
          <div className="col-md-5">
            <div className="converter-input-group">
              <label>Resultado en Unidad de Destino</label>
              <div className="converter-field-wrap" style={{ background: '#f8fafc' }}>
                <input
                  type="text"
                  className="converter-number-input"
                  value={result}
                  readOnly
                  style={{ color: '#0054a6', background: 'transparent' }}
                />
                <select
                  className="converter-unit-select"
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                >
                  {Object.entries(activeCategory.units).map(([key, u]) => (
                    <option key={key} value={key}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Presets Bar */}
        {activeCategory.presets && activeCategory.presets.length > 0 && (
          <div className="mt-4 pt-2 border-top d-flex align-items-center flex-wrap gap-2">
            <span className="small text-muted fw-bold me-2">Presets Comunes:</span>
            {activeCategory.presets.map((p, idx) => (
              <button key={idx} className="preset-chip" onClick={() => applyPreset(p)}>
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Formula breakdown & Copy button */}
        <div className="formula-display-box d-flex align-items-center justify-content-between flex-wrap gap-3 mt-4">
          <div className="d-flex align-items-center gap-2">
            <FontAwesomeIcon icon={faLightbulb} className="text-warning fs-5" />
            <div>
              <div className="small text-muted fw-bold">Ecuación / Factor de Conversión:</div>
              <div className="fw-bold text-dark font-monospace">{formulaText}</div>
            </div>
          </div>

          <button className="copy-toast-btn text-dark border" onClick={handleCopy}>
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="me-1" />
            {copied ? '¡Copiado!' : 'Copiar Resultado'}
          </button>
        </div>
      </div>
    </div>
  );
}
