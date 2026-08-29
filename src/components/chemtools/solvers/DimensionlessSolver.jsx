'use client';

import React, { useState, useMemo } from 'react';
import KatexMath from '../KatexMath';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator, faExchangeAlt, faLightbulb } from '@fortawesome/free-solid-svg-icons';

export default function DimensionlessSolver() {
  const [selectedNumber, setSelectedNumber] = useState('Re'); // 'Re', 'Pr', 'Nu'

  // Reynolds Inputs
  const [density, setDensity] = useState('998.2'); // kg/m3 (water)
  const [velocity, setVelocity] = useState('1.5'); // m/s
  const [diameter, setDiameter] = useState('0.05'); // m
  const [viscosity, setViscosity] = useState('0.001002'); // Pa·s

  // Prandtl Inputs
  const [cp, setCp] = useState('4182'); // J/(kg·K)
  const [kPr, setKPr] = useState('0.598'); // W/(m·K)
  const [muPr, setMuPr] = useState('0.001002'); // Pa·s

  // Nusselt Inputs
  const [nuMode, setNuMode] = useState('definition'); // 'definition' or 'dittus'
  const [hCoeff, setHCoeff] = useState('2500'); // W/(m2·K)
  const [dNu, setDNu] = useState('0.05'); // m
  const [kNu, setKNu] = useState('0.598'); // W/(m·K)
  const [reDittus, setReDittus] = useState('50000');
  const [prDittus, setPrDittus] = useState('7.0');
  const [processType, setProcessType] = useState('heating'); // 'heating' (n=0.4) or 'cooling' (n=0.3)

  // Reynolds Calculation
  const reSolution = useMemo(() => {
    const rho = parseFloat(density);
    const v = parseFloat(velocity);
    const D = parseFloat(diameter);
    const mu = parseFloat(viscosity);

    if (isNaN(rho) || isNaN(v) || isNaN(D) || isNaN(mu) || mu <= 0 || D <= 0) {
      return { error: 'Ingrese parámetros válidos para Reynolds.' };
    }

    const Re = (rho * v * D) / mu;
    let regime = 'Turbulento (Fuerzas inerciales dominan)';
    let regimeClass = 'regime-turbulent';
    if (Re < 2300) {
      regime = 'Laminar (Fuerzas viscosas dominan)';
      regimeClass = 'regime-laminar';
    } else if (Re <= 4000) {
      regime = 'Transición';
      regimeClass = 'regime-transition';
    }

    return {
      Re: Re.toFixed(2),
      ReSci: Re.toExponential(4),
      regime,
      regimeClass
    };
  }, [density, velocity, diameter, viscosity]);

  // Prandtl Calculation
  const prSolution = useMemo(() => {
    const C = parseFloat(cp);
    const mu = parseFloat(muPr);
    const k = parseFloat(kPr);

    if (isNaN(C) || isNaN(mu) || isNaN(k) || k <= 0) {
      return { error: 'Ingrese parámetros válidos para Prandtl.' };
    }

    const Pr = (C * mu) / k;
    let desc = 'Difusión de cantidad de movimiento e hidrodinámica balanceada.';
    if (Pr < 0.1) desc = 'Metales líquidos: Difusión térmica domina ampliamente (Capa límite térmica muy gruesa).';
    else if (Pr > 10) desc = 'Aceites / Fluidos viscosos: Difusión de momento domina (Capa límite hidrodinámica muy gruesa).';
    else desc = 'Gases / Agua: Capas límites térmica e hidrodinámica de orden de magnitud similar.';

    return {
      Pr: Pr.toFixed(4),
      desc
    };
  }, [cp, muPr, kPr]);

  // Nusselt Calculation
  const nuSolution = useMemo(() => {
    if (nuMode === 'definition') {
      const h = parseFloat(hCoeff);
      const D = parseFloat(dNu);
      const k = parseFloat(kNu);

      if (isNaN(h) || isNaN(D) || isNaN(k) || k <= 0) {
        return { error: 'Ingrese valores válidos para Nusselt por definición.' };
      }

      const Nu = (h * D) / k;
      return {
        Nu: Nu.toFixed(2),
        desc: 'Relación entre transferencia de calor por convección y conducción pura.'
      };
    } else {
      const Re = parseFloat(reDittus);
      const Pr = parseFloat(prDittus);

      if (isNaN(Re) || isNaN(Pr) || Re < 10000 || Pr < 0.6 || Pr > 160) {
        return { error: 'Dittus-Boelter requiere Re ≥ 10,000 y 0.6 ≤ Pr ≤ 160.' };
      }

      const n = processType === 'heating' ? 0.4 : 0.3;
      const Nu = 0.023 * Math.pow(Re, 0.8) * Math.pow(Pr, n);

      return {
        Nu: Nu.toFixed(2),
        desc: `Correlación Dittus-Boelter para tuberías lisas con n = ${n} (${processType === 'heating' ? 'Calentamiento' : 'Enfriamiento'}).`
      };
    }
  }, [nuMode, hCoeff, dNu, kNu, reDittus, prDittus, processType]);

  return (
    <div className="chemtools-card h-100">
      <div className="chemtools-card-header">
        <h3 className="chemtools-card-title">
          <FontAwesomeIcon icon={faCalculator} />
          4. Números Adimensionales ($Re$, $Pr$, $Nu$)
        </h3>
        <span className="chemtools-badge">Fenómenos de Transporte</span>
      </div>

      {/* Select Adimensional Number */}
      <div className="btn-group w-100 mb-4" role="group">
        <button
          type="button"
          className={`btn ${selectedNumber === 'Re' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setSelectedNumber('Re')}
        >
          Reynolds ($Re$)
        </button>
        <button
          type="button"
          className={`btn ${selectedNumber === 'Pr' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setSelectedNumber('Pr')}
        >
          Prandtl ($Pr$)
        </button>
        <button
          type="button"
          className={`btn ${selectedNumber === 'Nu' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setSelectedNumber('Nu')}
        >
          Nusselt ($Nu$)
        </button>
      </div>

      {/* REYNOLDS SECTION */}
      {selectedNumber === 'Re' && (
        <div>
          <div className="math-formula-container">
            <KatexMath math="Re = \frac{\rho \cdot v \cdot D}{\mu}" block={true} />
          </div>

          <div className="row g-3">
            <div className="col-6 col-md-3">
              <label className="form-label small fw-bold">Densidad ($\rho$, kg/m³):</label>
              <input
                type="number"
                className="solver-input"
                value={density}
                onChange={(e) => setDensity(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small fw-bold">Velocidad ($v$, m/s):</label>
              <input
                type="number"
                className="solver-input"
                value={velocity}
                onChange={(e) => setVelocity(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small fw-bold">Diámetro ($D$, m):</label>
              <input
                type="number"
                className="solver-input"
                value={diameter}
                onChange={(e) => setDiameter(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small fw-bold">Viscosidad ($\mu$, Pa·s):</label>
              <input
                type="number"
                className="solver-input"
                value={viscosity}
                onChange={(e) => setViscosity(e.target.value)}
                step="any"
              />
            </div>
          </div>

          {reSolution.error ? (
            <div className="alert alert-danger mt-3">{reSolution.error}</div>
          ) : (
            <div className="result-card mt-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-white-50 small fw-bold">Número de Reynolds (Re):</span>
                <span className={`regime-badge ${reSolution.regimeClass}`}>{reSolution.regime}</span>
              </div>
              <div className="result-card-value">{reSolution.Re}</div>
              <div className="small text-white-50 mt-1">Notación Científica: {reSolution.ReSci}</div>
            </div>
          )}
        </div>
      )}

      {/* PRANDTL SECTION */}
      {selectedNumber === 'Pr' && (
        <div>
          <div className="math-formula-container">
            <KatexMath math="Pr = \frac{C_p \cdot \mu}{k}" block={true} />
          </div>

          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label small fw-bold">Calor Específico ($C_p$, J/(kg·K)):</label>
              <input
                type="number"
                className="solver-input"
                value={cp}
                onChange={(e) => setCp(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-bold">Viscosidad Dinámica ($\mu$, Pa·s):</label>
              <input
                type="number"
                className="solver-input"
                value={muPr}
                onChange={(e) => setMuPr(e.target.value)}
                step="any"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-bold">Conductividad ($k$, W/(m·K)):</label>
              <input
                type="number"
                className="solver-input"
                value={kPr}
                onChange={(e) => setKPr(e.target.value)}
                step="any"
              />
            </div>
          </div>

          {prSolution.error ? (
            <div className="alert alert-danger mt-3">{prSolution.error}</div>
          ) : (
            <div className="result-card mt-4">
              <div className="text-white-50 small fw-bold mb-2">Número de Prandtl (Pr):</div>
              <div className="result-card-value mb-2">{prSolution.Pr}</div>
              <div className="small text-white-50 pt-2 border-top border-secondary">
                <FontAwesomeIcon icon={faLightbulb} className="text-warning me-1" />
                {prSolution.desc}
              </div>
            </div>
          )}
        </div>
      )}

      {/* NUSSELT SECTION */}
      {selectedNumber === 'Nu' && (
        <div>
          <div className="math-formula-container">
            <KatexMath
              math={
                nuMode === 'definition'
                  ? 'Nu = \\frac{h \\cdot D}{k}'
                  : 'Nu = 0.023 \\cdot Re^{0.8} \\cdot Pr^{n}'
              }
              block={true}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold">Modo de Cálculo:</label>
            <select
              className="solver-select"
              value={nuMode}
              onChange={(e) => setNuMode(e.target.value)}
            >
              <option value="definition">Por Definición Directa (h, D, k)</option>
              <option value="dittus">Correlación Dittus-Boelter (Re, Pr)</option>
            </select>
          </div>

          {nuMode === 'definition' ? (
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small fw-bold">Coef. Convectivo ($h$, W/(m²·K)):</label>
                <input
                  type="number"
                  className="solver-input"
                  value={hCoeff}
                  onChange={(e) => setHCoeff(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">Diámetro / Longitud ($D$, m):</label>
                <input
                  type="number"
                  className="solver-input"
                  value={dNu}
                  onChange={(e) => setDNu(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">Conductividad ($k$, W/(m·K)):</label>
                <input
                  type="number"
                  className="solver-input"
                  value={kNu}
                  onChange={(e) => setKNu(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small fw-bold">Reynolds ($Re \ge 10^4$):</label>
                <input
                  type="number"
                  className="solver-input"
                  value={reDittus}
                  onChange={(e) => setReDittus(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">Prandtl ($Pr$):</label>
                <input
                  type="number"
                  className="solver-input"
                  value={prDittus}
                  onChange={(e) => setPrDittus(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold">Proceso Térmico:</label>
                <select
                  className="solver-select"
                  value={processType}
                  onChange={(e) => setProcessType(e.target.value)}
                >
                  <option value="heating">Calentamiento del fluido (n = 0.4)</option>
                  <option value="cooling">Enfriamiento del fluido (n = 0.3)</option>
                </select>
              </div>
            </div>
          )}

          {nuSolution.error ? (
            <div className="alert alert-danger mt-3">{nuSolution.error}</div>
          ) : (
            <div className="result-card mt-4">
              <div className="text-white-50 small fw-bold mb-2">Número de Nusselt (Nu):</div>
              <div className="result-card-value mb-2">{nuSolution.Nu}</div>
              <div className="small text-white-50 pt-2 border-top border-secondary">
                <FontAwesomeIcon icon={faLightbulb} className="text-warning me-1" />
                {nuSolution.desc}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
