'use client';

import React, { useState, useMemo } from 'react';
import KatexMath from '../KatexMath';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWater, faInfoCircle, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default function ColebrookSolver() {
  const [roughnessRatio, setRoughnessRatio] = useState('0.0001'); // Relative roughness epsilon/D
  const [reynolds, setReynolds] = useState('50000'); // Reynolds number Re

  const formulaLatex = `\\frac{1}{\\sqrt{f}} = -2 \\log_{10} \\left( \\frac{\\epsilon / D}{3.7} + \\frac{2.51}{Re \\sqrt{f}} \\right)`;

  const solution = useMemo(() => {
    const ed = parseFloat(roughnessRatio);
    const re = parseFloat(reynolds);

    if (isNaN(ed) || isNaN(re) || ed < 0 || re <= 0) {
      return { error: 'Ingrese valores válidos para la rugosidad relativa ε/D (≥ 0) y Reynolds Re (> 0).' };
    }

    // Determine Flow Regime
    let regime = 'turbulent';
    let regimeLabel = 'Turbulento';
    let regimeClass = 'regime-turbulent';
    let iterations = 0;
    let fDarcy = 0;

    if (re < 2300) {
      regime = 'laminar';
      regimeLabel = 'Laminar';
      regimeClass = 'regime-laminar';
      fDarcy = 64 / re;
      iterations = 1;
    } else if (re >= 2300 && re <= 4000) {
      regime = 'transition';
      regimeLabel = 'Zona de Transición (Inestable)';
      regimeClass = 'regime-transition';
    }

    if (regime !== 'laminar') {
      // Swamee-Jain initial estimate for x = 1/sqrt(f)
      const term1 = ed / 3.7;
      const term2 = 5.74 / Math.pow(re, 0.9);
      let x = -2.0 * Math.log10(term1 + term2);

      const maxIter = 100;
      const tol = 1e-7;

      for (let i = 0; i < maxIter; i++) {
        iterations++;
        const g = x + 2.0 * Math.log10(ed / 3.7 + (2.51 * x) / re);
        const gPrime = 1.0 + (2.0 / Math.LN10) * (2.51 / re) / (ed / 3.7 + (2.51 * x) / re);

        const xNext = x - g / gPrime;
        if (Math.abs(xNext - x) < tol) {
          x = xNext;
          break;
        }
        x = xNext;
      }

      fDarcy = 1.0 / (x * x);
    }

    const fFanning = fDarcy / 4.0;

    return {
      fDarcy: fDarcy.toFixed(6),
      fFanning: fFanning.toFixed(6),
      regimeLabel,
      regimeClass,
      regime,
      iterations
    };
  }, [roughnessRatio, reynolds]);

  return (
    <div className="chemtools-card h-100">
      <div className="chemtools-card-header">
        <h3 className="chemtools-card-title">
          <FontAwesomeIcon icon={faWater} />
          1. Factor de Fricción de Colebrook-White
        </h3>
        <span className="chemtools-badge">Flujo en Tuberías</span>
      </div>

      {/* LaTeX Formula Rendering */}
      <div className="math-formula-container">
        <KatexMath math={formulaLatex} block={true} />
      </div>

      {/* Inputs */}
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label fw-bold text-secondary small">
            Rugosidad Relativa ($\epsilon / D$):
          </label>
          <input
            type="number"
            className="solver-input"
            value={roughnessRatio}
            onChange={(e) => setRoughnessRatio(e.target.value)}
            step="0.00001"
            min="0"
            placeholder="Ej. 0.0001"
          />
          <div className="form-text small">Tubería de acero comercial ≈ 0.00015</div>
        </div>

        <div className="col-md-6">
          <label className="form-label fw-bold text-secondary small">
            Número de Reynolds ($Re$):
          </label>
          <input
            type="number"
            className="solver-input"
            value={reynolds}
            onChange={(e) => setReynolds(e.target.value)}
            step="100"
            min="1"
            placeholder="Ej. 50000"
          />
          <div className="form-text small">Laminar &lt; 2300 | Turbulento &gt; 4000</div>
        </div>
      </div>

      {/* Result Display */}
      {solution.error ? (
        <div className="alert alert-danger mt-3">{solution.error}</div>
      ) : (
        <div className="result-card mt-4">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="text-white-50 small fw-bold">Factor de Fricción de Darcy (f):</span>
            <span className={`regime-badge ${solution.regimeClass}`}>{solution.regimeLabel}</span>
          </div>

          <div className="result-card-value mb-2">{solution.fDarcy}</div>

          <div className="d-flex justify-content-between align-items-center pt-2 border-top border-secondary">
            <span className="small text-white-50">
              Fanning Friction Factor ($f_{'{fanning}'}$): <strong className="text-white">{solution.fFanning}</strong>
            </span>
            <span className="small text-white-50">
              Iteraciones Newton-Raphson: <strong className="text-white">{solution.iterations}</strong>
            </span>
          </div>

          {solution.regime === 'transition' && (
            <div className="alert-range-warning mt-3 mb-0">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span>Zona Crítica / Transición: Se recomienda usar factor de seguridad en el diseño hidráulico.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
