'use client';

import React, { useState, useMemo } from 'react';
import KatexMath from '../KatexMath';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloud, faCalculator } from '@fortawesome/free-solid-svg-icons';

const GASES = {
  co2: { name: 'Dióxido de Carbono (CO₂)', a: 3.64, b: 0.04267 },
  air: { name: 'Aire Seco', a: 1.358, b: 0.0364 },
  n2: { name: 'Nitrógeno (N₂)', a: 1.37, b: 0.0387 },
  o2: { name: 'Oxígeno (O₂)', a: 1.382, b: 0.03186 },
  ch4: { name: 'Metano (CH₄)', a: 2.283, b: 0.04278 },
  h2o: { name: 'Vapor de Agua (H₂O)', a: 5.536, b: 0.03049 },
  he: { name: 'Helio (He)', a: 0.0346, b: 0.0237 },
  custom: { name: '⚙️ Ingreso Manual', a: 1.0, b: 0.03 }
};

const R_BAR = 0.08314472; // bar·L / (mol·K)

export default function VanderWaalsSolver() {
  const [gasKey, setGasKey] = useState('co2');
  const [calcMode, setCalcMode] = useState('P'); // 'P' or 'V'
  const [tempVal, setTempVal] = useState('25'); // °C or K
  const [tempUnit, setTempUnit] = useState('C');
  const [molarVolInput, setMolarVolInput] = useState('1.0'); // L/mol
  const [pressureInput, setPressureInput] = useState('10.0'); // bar

  const [customA, setCustomA] = useState('3.640');
  const [customB, setCustomB] = useState('0.04267');

  const formulaLatex = `\\left( P + \\frac{a}{v^2} \\right) (v - b) = R T`;

  const activeConstants = useMemo(() => {
    if (gasKey === 'custom') {
      return {
        a: parseFloat(customA) || 0,
        b: parseFloat(customB) || 0
      };
    }
    return GASES[gasKey];
  }, [gasKey, customA, customB]);

  const solution = useMemo(() => {
    const rawT = parseFloat(tempVal);
    if (isNaN(rawT)) return { error: 'Ingrese una temperatura válida.' };

    const T = tempUnit === 'C' ? rawT + 273.15 : rawT;
    if (T <= 0) return { error: 'La temperatura absoluta T (K) debe ser > 0.' };

    const { a, b } = activeConstants;
    if (a < 0 || b < 0) return { error: 'Las constantes a y b deben ser no negativas.' };

    if (calcMode === 'P') {
      // Calculate P given v and T
      const v = parseFloat(molarVolInput);
      if (isNaN(v) || v <= b) {
        return { error: `El volumen molar v (${v} L/mol) debe ser mayor que la covariable b (${b} L/mol).` };
      }

      const P_vdW = (R_BAR * T) / (v - b) - a / (v * v);
      const P_ideal = (R_BAR * T) / v;
      const Z = (P_vdW * v) / (R_BAR * T);
      const devPct = Math.abs((P_vdW - P_ideal) / P_vdW) * 100;

      return {
        mode: 'P',
        P_vdW: P_vdW.toFixed(4),
        P_ideal: P_ideal.toFixed(4),
        v: v.toFixed(4),
        T: T.toFixed(2),
        Z: Z.toFixed(4),
        devPct: devPct.toFixed(2),
        a,
        b
      };
    } else {
      // Calculate v given P and T via Newton-Raphson on cubic equation
      const P = parseFloat(pressureInput);
      if (isNaN(P) || P <= 0) return { error: 'La presión P debe ser mayor a 0.' };

      // f(v) = P v^3 - (P b + R T) v^2 + a v - a b = 0
      const c2 = -(P * b + R_BAR * T);
      const c1 = a;
      const c0 = -a * b;

      // Initial guess from ideal gas law v0 = R T / P
      let v = (R_BAR * T) / P;
      if (v <= b) v = b * 1.1;

      const maxIter = 100;
      const tol = 1e-7;

      for (let i = 0; i < maxIter; i++) {
        const f = P * Math.pow(v, 3) + c2 * Math.pow(v, 2) + c1 * v + c0;
        const fPrime = 3 * P * Math.pow(v, 2) + 2 * c2 * v + c1;

        const vNext = v - f / fPrime;
        if (Math.abs(vNext - v) < tol) {
          v = vNext;
          break;
        }
        v = vNext;
      }

      const v_ideal = (R_BAR * T) / P;
      const Z = (P * v) / (R_BAR * T);
      const devPct = Math.abs((v - v_ideal) / v) * 100;

      return {
        mode: 'V',
        v_vdW: v.toFixed(4),
        v_ideal: v_ideal.toFixed(4),
        P: P.toFixed(4),
        T: T.toFixed(2),
        Z: Z.toFixed(4),
        devPct: devPct.toFixed(2),
        a,
        b
      };
    }
  }, [calcMode, tempVal, tempUnit, molarVolInput, pressureInput, activeConstants]);

  return (
    <div className="chemtools-card h-100">
      <div className="chemtools-card-header">
        <h3 className="chemtools-card-title">
          <FontAwesomeIcon icon={faCloud} />
          3. Gases Reales (Van der Waals)
        </h3>
        <span className="chemtools-badge">Ecuaciones de Estado</span>
      </div>

      {/* LaTeX Formula Rendering */}
      <div className="math-formula-container">
        <KatexMath math={formulaLatex} block={true} />
      </div>

      {/* Gas Selector */}
      <div className="row g-3 mb-3">
        <div className="col-md-7">
          <label className="form-label fw-bold text-secondary small">Gas Común:</label>
          <select
            className="solver-select"
            value={gasKey}
            onChange={(e) => setGasKey(e.target.value)}
          >
            {Object.entries(GASES).map(([key, g]) => (
              <option key={key} value={key}>
                {g.name} {key !== 'custom' ? `(a=${g.a}, b=${g.b})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-5">
          <label className="form-label fw-bold text-secondary small">Variable a Calcular:</label>
          <select
            className="solver-select"
            value={calcMode}
            onChange={(e) => setCalcMode(e.target.value)}
          >
            <option value="P">Presión (P)</option>
            <option value="V">Volumen Molar (v)</option>
          </select>
        </div>
      </div>

      {/* Custom constants if manual */}
      {gasKey === 'custom' && (
        <div className="row g-2 mb-3 bg-light p-2 rounded">
          <div className="col-6">
            <label className="small fw-bold">Cohesión a (bar·L²/mol²):</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={customA}
              onChange={(e) => setCustomA(e.target.value)}
            />
          </div>
          <div className="col-6">
            <label className="small fw-bold">Covulomen b (L/mol):</label>
            <input
              type="number"
              className="form-control form-control-sm"
              value={customB}
              onChange={(e) => setCustomB(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Inputs according to Mode */}
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label fw-bold text-secondary small">Temperatura (T):</label>
          <div className="input-group">
            <input
              type="number"
              className="solver-input"
              value={tempVal}
              onChange={(e) => setTempVal(e.target.value)}
              step="any"
            />
            <select
              className="solver-select"
              style={{ width: '80px' }}
              value={tempUnit}
              onChange={(e) => setTempUnit(e.target.value)}
            >
              <option value="C">°C</option>
              <option value="K">K</option>
            </select>
          </div>
        </div>

        {calcMode === 'P' ? (
          <div className="col-md-6">
            <label className="form-label fw-bold text-secondary small">Volumen Molar (v, L/mol):</label>
            <input
              type="number"
              className="solver-input"
              value={molarVolInput}
              onChange={(e) => setMolarVolInput(e.target.value)}
              step="any"
              min="0.01"
            />
          </div>
        ) : (
          <div className="col-md-6">
            <label className="form-label fw-bold text-secondary small">Presión (P, bar):</label>
            <input
              type="number"
              className="solver-input"
              value={pressureInput}
              onChange={(e) => setPressureInput(e.target.value)}
              step="any"
              min="0.1"
            />
          </div>
        )}
      </div>

      {/* Results */}
      {solution.error ? (
        <div className="alert alert-danger mt-3">{solution.error}</div>
      ) : (
        <div className="result-card mt-4">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-white-50 small fw-bold">
              {solution.mode === 'P' ? 'Presión Van der Waals (P):' : 'Volumen Molar Van der Waals (v):'}
            </span>
            <span className="badge bg-info text-dark font-monospace">Z = {solution.Z}</span>
          </div>

          <div className="result-card-value mb-2">
            {solution.mode === 'P' ? `${solution.P_vdW} bar` : `${solution.v_vdW} L/mol`}
          </div>

          <div className="d-flex justify-content-between align-items-center pt-2 border-top border-secondary flex-wrap gap-2">
            <span className="small text-white-50">
              Valor Gas Ideal:{' '}
              <strong className="text-white">
                {solution.mode === 'P' ? `${solution.P_ideal} bar` : `${solution.v_ideal} L/mol`}
              </strong>
            </span>
            <span className="small text-white-50">
              Desviación del Gas Ideal: <strong className="text-warning">{solution.devPct}%</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
