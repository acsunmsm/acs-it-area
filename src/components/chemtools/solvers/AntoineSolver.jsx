'use client';

import React, { useState, useMemo } from 'react';
import KatexMath from '../KatexMath';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlask, faExclamationTriangle, faThermometerHalf } from '@fortawesome/free-solid-svg-icons';

const SUBSTANCES = {
  water: {
    name: 'Agua (H₂O)',
    A: 8.07131,
    B: 1730.63,
    C: 233.426,
    Tmin: 1,
    Tmax: 100
  },
  ethanol: {
    name: 'Etanol (C₂H₅OH)',
    A: 8.20417,
    B: 1642.89,
    C: 230.3,
    Tmin: -3,
    Tmax: 96
  },
  benzene: {
    name: 'Benceno (C₆H₆)',
    A: 6.90565,
    B: 1211.033,
    C: 220.79,
    Tmin: 15,
    Tmax: 104
  },
  acetone: {
    name: 'Acetona (C₃H₆O)',
    A: 7.02447,
    B: 1161.0,
    C: 224.0,
    Tmin: -13,
    Tmax: 55
  },
  toluene: {
    name: 'Tolueno (C₇H₈)',
    A: 6.95464,
    B: 1344.8,
    C: 219.482,
    Tmin: 6,
    Tmax: 137
  },
  methanol: {
    name: 'Metanol (CH₃OH)',
    A: 8.08097,
    B: 1582.271,
    C: 239.726,
    Tmin: -15,
    Tmax: 83
  },
  custom: {
    name: '⚙️ Ingreso Manual',
    A: 8.0,
    B: 1500.0,
    C: 230.0,
    Tmin: -50,
    Tmax: 200
  }
};

export default function AntoineSolver() {
  const [substanceKey, setSubstanceKey] = useState('water');
  const [tempValue, setTempValue] = useState('100');
  const [tempUnit, setTempUnit] = useState('C'); // 'C' or 'K'
  const [outPressureUnit, setOutPressureUnit] = useState('mmHg');

  // Custom constants if manual mode is enabled
  const [customA, setCustomA] = useState('8.07131');
  const [customB, setCustomB] = useState('1730.63');
  const [customC, setCustomC] = useState('233.426');

  const formulaLatex = `\\log_{10}(P) = A - \\frac{B}{T + C}`;

  const currentConsts = useMemo(() => {
    if (substanceKey === 'custom') {
      return {
        A: parseFloat(customA) || 0,
        B: parseFloat(customB) || 0,
        C: parseFloat(customC) || 0,
        Tmin: -100,
        Tmax: 500
      };
    }
    return SUBSTANCES[substanceKey];
  }, [substanceKey, customA, customB, customC]);

  const solution = useMemo(() => {
    const rawT = parseFloat(tempValue);
    if (isNaN(rawT)) return { error: 'Ingrese una temperatura válida.' };

    // Temperature in Celsius for Antoine equation
    const tempC = tempUnit === 'K' ? rawT - 273.15 : rawT;

    const { A, B, C, Tmin, Tmax } = currentConsts;

    if (tempC + C <= 0) {
      return { error: 'Singularidad en Antoine: (T + C) debe ser mayor a 0.' };
    }

    const log10P = A - B / (tempC + C);
    const pmmHg = Math.pow(10, log10P); // Pressure in mmHg

    // Unit conversion
    let pFinal = pmmHg;
    let unitLabel = 'mmHg';

    if (outPressureUnit === 'bar') {
      pFinal = pmmHg * 0.00133322368;
      unitLabel = 'bar';
    } else if (outPressureUnit === 'kPa') {
      pFinal = pmmHg * 0.133322368;
      unitLabel = 'kPa';
    } else if (outPressureUnit === 'atm') {
      pFinal = pmmHg / 760.0;
      unitLabel = 'atm';
    } else if (outPressureUnit === 'psi') {
      pFinal = pmmHg * 0.019336775;
      unitLabel = 'psi';
    }

    const isOutOfRange = tempC < Tmin || tempC > Tmax;

    return {
      tempC: tempC.toFixed(2),
      pVal: pFinal.toFixed(4),
      pmmHg: pmmHg.toFixed(2),
      unitLabel,
      isOutOfRange,
      Tmin,
      Tmax,
      A,
      B,
      C
    };
  }, [tempValue, tempUnit, currentConsts, outPressureUnit]);

  return (
    <div className="chemtools-card h-100">
      <div className="chemtools-card-header">
        <h3 className="chemtools-card-title">
          <FontAwesomeIcon icon={faFlask} />
          2. Presión de Vapor (Ecuación de Antoine)
        </h3>
        <span className="chemtools-badge">Termodinámica</span>
      </div>

      {/* LaTeX Formula Rendering */}
      <div className="math-formula-container">
        <KatexMath math={formulaLatex} block={true} />
      </div>

      {/* Substance Selector */}
      <div className="mb-3">
        <label className="form-label fw-bold text-secondary small">Sustancia Precargada:</label>
        <select
          className="solver-select"
          value={substanceKey}
          onChange={(e) => setSubstanceKey(e.target.value)}
        >
          {Object.entries(SUBSTANCES).map(([key, s]) => (
            <option key={key} value={key}>
              {s.name} {key !== 'custom' ? `[Rango: ${s.Tmin} °C a ${s.Tmax} °C]` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Manual Constants Input if custom */}
      {substanceKey === 'custom' && (
        <div className="row g-2 mb-3 bg-light p-2 rounded">
          <div className="col-4">
            <label className="small fw-bold">Constante A:</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={customA}
              onChange={(e) => setCustomA(e.target.value)}
            />
          </div>
          <div className="col-4">
            <label className="small fw-bold">Constante B:</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={customB}
              onChange={(e) => setCustomB(e.target.value)}
            />
          </div>
          <div className="col-4">
            <label className="small fw-bold">Constante C:</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={customC}
              onChange={(e) => setCustomC(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Temperature Input & Unit */}
      <div className="row g-3">
        <div className="col-md-7">
          <label className="form-label fw-bold text-secondary small">Temperatura ($T$):</label>
          <div className="input-group">
            <input
              type="number"
              className="solver-input"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              step="any"
              placeholder="Ej. 100"
            />
            <select
              className="solver-select"
              style={{ width: '90px' }}
              value={tempUnit}
              onChange={(e) => setTempUnit(e.target.value)}
            >
              <option value="C">°C</option>
              <option value="K">K</option>
            </select>
          </div>
        </div>

        <div className="col-md-5">
          <label className="form-label fw-bold text-secondary small">Unidad de Salida ($P_{'{sat}'}$):</label>
          <select
            className="solver-select"
            value={outPressureUnit}
            onChange={(e) => setOutPressureUnit(e.target.value)}
          >
            <option value="mmHg">mmHg (Torr)</option>
            <option value="bar">bar</option>
            <option value="kPa">kPa</option>
            <option value="atm">atm</option>
            <option value="psi">psi</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {solution.error ? (
        <div className="alert alert-danger mt-3">{solution.error}</div>
      ) : (
        <div className="result-card mt-4">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-white-50 small fw-bold">Presión de Saturación ($P_{'{sat}'}$):</span>
            <span className="badge bg-primary text-wrap">{SUBSTANCES[substanceKey].name}</span>
          </div>

          <div className="result-card-value mb-2">
            {solution.pVal} <span className="fs-5 text-white">{solution.unitLabel}</span>
          </div>

          <div className="d-flex justify-content-between align-items-center pt-2 border-top border-secondary">
            <span className="small text-white-50">
              Constantes: A={solution.A}, B={solution.B}, C={solution.C}
            </span>
            <span className="small text-white-50">
              Equiv: <strong className="text-white">{solution.pmmHg} mmHg</strong>
            </span>
          </div>

          {solution.isOutOfRange && substanceKey !== 'custom' && (
            <div className="alert-range-warning mt-3 mb-0">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span>
                ¡Atención! T = {solution.tempC} °C está fuera del rango experimental válido [{solution.Tmin} °C, {solution.Tmax} °C]. Los resultados pueden extrapolar erróneamente.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
