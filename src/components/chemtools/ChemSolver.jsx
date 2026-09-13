'use client';

import React, { useState, useMemo } from 'react';
import KatexMath from './KatexMath';
import ColebrookSolver from './solvers/ColebrookSolver';
import AntoineSolver from './solvers/AntoineSolver';
import VanderWaalsSolver from './solvers/VanderWaalsSolver';
import DimensionlessSolver from './solvers/DimensionlessSolver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalculator,
  faFilter,
  faSearch,
  faGlobe,
  faWater,
  faFlask,
  faBolt,
  faMicroscope,
  faScaleBalanced,
  faCogs,
  faLightbulb,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faArrowRight,
  faAtom,
  faFire,
  faVial,
  faDraftingCompass
} from '@fortawesome/free-solid-svg-icons';

// Physical Constants
const R_GAS_ATM = 0.082057; // L·atm / (mol·K)
const R_GAS_J = 8.31447;   // J / (mol·K)
const G_GRAVITY = 9.80665;  // m/s²
const FARADAY_C = 96485.3;  // C/mol e-

export default function ChemSolver() {
  const [activeSubject, setActiveSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ---------------------------------------------------------------------------
  // STATE FOR EQUATION INPUTS
  // ---------------------------------------------------------------------------

  // 1. GENERALES
  const [rule3A, setRule3A] = useState('10');
  const [rule3B, setRule3B] = useState('50');
  const [rule3X, setRule3X] = useState('25');

  const [quadA, setQuadA] = useState('1');
  const [quadB, setQuadB] = useState('-5');
  const [quadC, setQuadC] = useState('6');

  const [errMode, setErrMode] = useState('sum');
  const [errValX, setErrValX] = useState('10.0');
  const [errSigmaX, setErrSigmaX] = useState('0.2');
  const [errValY, setErrValY] = useState('5.0');
  const [errSigmaY, setErrSigmaY] = useState('0.1');

  const [densMass, setDensMass] = useState('500');
  const [densVol, setDensVol] = useState('250');
  const [densRef, setDensRef] = useState('1.0');

  // 2. FÍSICA 1
  const [mruvSolve, setMruvSolve] = useState('v');
  const [mruvV0, setMruvV0] = useState('0');
  const [mruvV, setMruvV] = useState('20');
  const [mruvA, setMruvA] = useState('2.5');
  const [mruvT, setMruvT] = useState('8');
  const [mruvX0, setMruvX0] = useState('0');

  const [newtonMass, setNewtonMass] = useState('15');
  const [newtonForce, setNewtonForce] = useState('80');
  const [newtonMu, setNewtonMu] = useState('0.25');

  const [workForce, setWorkForce] = useState('50');
  const [workDist, setWorkDist] = useState('10');
  const [workAngle, setWorkAngle] = useState('0');
  const [workMass, setWorkMass] = useState('5');
  const [workVel, setWorkVel] = useState('12');

  const [epMass, setEpMass] = useState('10');
  const [epHeight, setEpHeight] = useState('15');

  const [pMass, setPMass] = useState('8');
  const [pVel, setPVel] = useState('15');
  const [pForce, setPForce] = useState('40');
  const [pTime, setPTime] = useState('0.5');

  const [torqueRadius, setTorqueRadius] = useState('0.75');
  const [torqueForce, setTorqueForce] = useState('120');
  const [torqueAngle, setTorqueAngle] = useState('90');

  // 3. FÍSICA 2
  const [pascalP0, setPascalP0] = useState('101325');
  const [pascalRho, setPascalRho] = useState('1000');
  const [pascalH, setPascalH] = useState('10');
  const [pascalF1, setPascalF1] = useState('500');
  const [pascalA1, setPascalA1] = useState('0.01');
  const [pascalA2, setPascalA2] = useState('0.2');

  const [arqRhoFluid, setArqRhoFluid] = useState('1000');
  const [arqVSub, setArqVSub] = useState('0.05');
  const [arqMassReal, setArqMassReal] = useState('80');

  const [contA1, setContA1] = useState('0.05');
  const [contV1, setContV1] = useState('2.0');
  const [contA2, setContA2] = useState('0.02');

  const [bernP1, setBernP1] = useState('200000');
  const [bernV1, setBernV1] = useState('1.5');
  const [bernZ1, setBernZ1] = useState('5.0');
  const [bernV2, setBernV2] = useState('4.0');
  const [bernZ2, setBernZ2] = useState('8.0');
  const [bernRho, setBernRho] = useState('1000');

  const [masType, setMasType] = useState('pendulum');
  const [masLength, setMasLength] = useState('1.0');
  const [masMass, setMasMass] = useState('0.5');
  const [masK, setMasK] = useState('50');

  const [waveLambda, setWaveLambda] = useState('0.65');
  const [waveFreq, setWaveFreq] = useState('440');

  // 4. QUÍMICA GENERAL
  const [gasSolve, setGasSolve] = useState('P');
  const [gasP, setGasP] = useState('1.0');
  const [gasV, setGasV] = useState('22.414');
  const [gasN, setGasN] = useState('1.0');
  const [gasT, setGasT] = useState('273.15');

  const [concMolSolute, setConcMolSolute] = useState('0.5');
  const [concVolSol, setConcVolSol] = useState('0.5');
  const [concValence, setConcValence] = useState('1');
  const [concKgSolvent, setConcKgSolvent] = useState('0.47');

  const [dilC1, setDilC1] = useState('6.0');
  const [dilV1, setDilV1] = useState('50');
  const [dilC2, setDilC2] = useState('0.5');
  const [dilV2, setDilV2] = useState('600');
  const [dilMode, setDilMode] = useState('C2');

  const [phMode, setPhMode] = useState('strong');
  const [phConcH, setPhConcH] = useState('0.01');
  const [phKa, setPhKa] = useState('1.8e-5');
  const [phC0, setPhC0] = useState('0.1');

  // 5. FISICOQUÍMICA 1
  const [thermoQ, setThermoQ] = useState('1500');
  const [thermoW, setThermoW] = useState('600');

  const [isoN, setIsoN] = useState('2.0');
  const [isoT, setIsoT] = useState('300');
  const [isoV1, setIsoV1] = useState('10.0');
  const [isoV2, setIsoV2] = useState('25.0');

  const [hSensMass, setHSensMass] = useState('2.5');
  const [hSensCp, setHSensCp] = useState('4.184');
  const [hSensT1, setHSensT1] = useState('20');
  const [hSensT2, setHSensT2] = useState('85');

  const [ccP1, setCcP1] = useState('1.0');
  const [ccT1, setCcT1] = useState('373.15');
  const [ccT2, setCcT2] = useState('340.0');
  const [ccHvap, setCcHvap] = useState('40.65');

  // 6. FISICOQUÍMICA 2
  const [arrA, setArrA] = useState('1.0e11');
  const [arrEa, setArrEa] = useState('75.0');
  const [arrT, setArrT] = useState('350');

  const [kinOrder, setKinOrder] = useState('1');
  const [kinA0, setKinA0] = useState('1.0');
  const [kinK, setKinK] = useState('0.05');
  const [kinTime, setKinTime] = useState('20');

  const [nernstE0, setNernstE0] = useState('1.10');
  const [nernstN, setNernstN] = useState('2');
  const [nernstQ, setNernstQ] = useState('0.01');
  const [nernstTemp, setNernstTemp] = useState('298.15');

  const [gibbsC, setGibbsC] = useState('2');
  const [gibbsP, setGibbsP] = useState('2');

  const [langK, setLangK] = useState('0.15');
  const [langP, setLangP] = useState('5.0');

  // 7. BALANCE DE MATERIA Y ENERGÍA
  const [balFin1, setBalFin1] = useState('1000');
  const [balXin1, setBalXin1] = useState('0.40');
  const [balXout1, setBalXout1] = useState('0.85');
  const [balXout2, setBalXout2] = useState('0.05');

  const [recircFeed, setRecircFeed] = useState('100');
  const [recircRatio, setRecircRatio] = useState('3.0');
  const [recircPurgeFrac, setRecircPurgeFrac] = useState('0.1');

  const [rxnA0, setRxnA0] = useState('100');
  const [rxnNuA, setRxnNuA] = useState('-1');
  const [rxnConv, setRxnConv] = useState('0.75');

  const [eBalMin, setEBalMin] = useState('50');
  const [eBalHin, setEBalHin] = useState('2500');
  const [eBalMout, setEBalMout] = useState('50');
  const [eBalHout, setEBalHout] = useState('3100');
  const [eBalWork, setEBalWork] = useState('2000');

  const [kirchH298, setKirchH298] = useState('-92.2');
  const [kirchDcp, setKirchDcp] = useState('-35.5');
  const [kirchT, setKirchT] = useState('450');

  // SUBJECT CATEGORIES DEFINITION
  const SUBJECTS = [
    { id: 'all', label: 'Todas las Materias', icon: faGlobe, badgeClass: 'badge-generales' },
    { id: 'generales', label: 'Generales', icon: faCalculator, badgeClass: 'badge-generales' },
    { id: 'fisica1', label: 'Física 1 (Mecánica/Dinámica)', icon: faAtom, badgeClass: 'badge-fisica1' },
    { id: 'fisica2', label: 'Física 2 (Fluidos/Ondas)', icon: faWater, badgeClass: 'badge-fisica2' },
    { id: 'quimica_gen', label: 'Química General', icon: faFlask, badgeClass: 'badge-quimica_gen' },
    { id: 'fisicoquimica1', label: 'Fisicoquímica 1', icon: faFire, badgeClass: 'badge-fisicoquimica1' },
    { id: 'fisicoquimica2', label: 'Fisicoquímica 2', icon: faMicroscope, badgeClass: 'badge-fisicoquimica2' },
    { id: 'balances', label: 'Balance Materia & Energía', icon: faScaleBalanced, badgeClass: 'badge-balances' },
    { id: 'especializados', label: 'Solvers Especializados', icon: faCogs, badgeClass: 'badge-especializados' }
  ];

  const isCategoryVisible = (catId) => {
    if (activeSubject !== 'all' && activeSubject !== catId) return false;
    return true;
  };

  const matchesSearch = (title, keywords) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const fullText = (title + ' ' + (keywords || '')).toLowerCase();
    return fullText.includes(q);
  };

  // CALCULATIONS (USEMEMO)
  // 1. GENERALES
  const resRule3 = useMemo(() => {
    const a = parseFloat(rule3A), b = parseFloat(rule3B), x = parseFloat(rule3X);
    if (isNaN(a) || isNaN(b) || isNaN(x)) return { error: 'Valores numéricos requeridos.' };
    if (a === 0) return { error: 'División entre cero: "a" no puede ser 0.' };
    const y = (x * b) / a;
    return { y: y.toFixed(4) };
  }, [rule3A, rule3B, rule3X]);

  const resQuad = useMemo(() => {
    const a = parseFloat(quadA), b = parseFloat(quadB), c = parseFloat(quadC);
    if (isNaN(a) || isNaN(b) || isNaN(c)) return { error: 'Ingrese coeficientes válidos.' };
    if (a === 0) return { error: 'No es una ecuación cuadrática (a = 0).' };
    const disc = b * b - 4 * a * c;
    if (disc >= 0) {
      const x1 = (-b + Math.sqrt(disc)) / (2 * a);
      const x2 = (-b - Math.sqrt(disc)) / (2 * a);
      return { disc: disc.toFixed(4), x1: x1.toFixed(4), x2: x2.toFixed(4), complex: false };
    } else {
      const real = (-b / (2 * a)).toFixed(4);
      const imag = (Math.sqrt(-disc) / (2 * a)).toFixed(4);
      return { disc: disc.toFixed(4), real, imag, complex: true };
    }
  }, [quadA, quadB, quadC]);

  const resErrorProp = useMemo(() => {
    const X = parseFloat(errValX), sX = parseFloat(errSigmaX);
    const Y = parseFloat(errValY), sY = parseFloat(errSigmaY);
    if (isNaN(X) || isNaN(sX) || isNaN(Y) || isNaN(sY) || sX < 0 || sY < 0) {
      return { error: 'Ingrese valores e incertidumbres válidas (≥ 0).' };
    }
    if (errMode === 'sum') {
      const Z = X + Y;
      const sigmaZ = Math.sqrt(sX * sX + sY * sY);
      return { Z: Z.toFixed(4), sigmaZ: sigmaZ.toFixed(4), relErr: ((sigmaZ / Math.abs(Z)) * 100).toFixed(2) };
    } else {
      if (X === 0 || Y === 0) return { error: 'Valores deben ser ≠ 0 para producto/cociente.' };
      const Z = X * Y;
      const relX = sX / Math.abs(X);
      const relY = sY / Math.abs(Y);
      const relZ = Math.sqrt(relX * relX + relY * relY);
      const sigmaZ = Math.abs(Z) * relZ;
      return { Z: Z.toFixed(4), sigmaZ: sigmaZ.toFixed(4), relErr: (relZ * 100).toFixed(2) };
    }
  }, [errMode, errValX, errSigmaX, errValY, errSigmaY]);

  const resDensity = useMemo(() => {
    const m = parseFloat(densMass), v = parseFloat(densVol), ref = parseFloat(densRef);
    if (isNaN(m) || isNaN(v) || isNaN(ref) || v <= 0 || ref <= 0 || m < 0) {
      return { error: 'El volumen V y la densidad de referencia deben ser mayores a 0.' };
    }
    const rho = m / v;
    const ge = rho / ref;
    const rhoSI = rho * 1000;
    return { rho: rho.toFixed(4), rhoSI: rhoSI.toFixed(2), ge: ge.toFixed(4) };
  }, [densMass, densVol, densRef]);

  // 2. FÍSICA 1
  const resMRUV = useMemo(() => {
    const v0 = parseFloat(mruvV0), v = parseFloat(mruvV), a = parseFloat(mruvA), t = parseFloat(mruvT), x0 = parseFloat(mruvX0);
    if (mruvSolve === 'v') {
      if (isNaN(v0) || isNaN(a) || isNaN(t)) return { error: 'Ingrese v0, a, t.' };
      const resV = v0 + a * t;
      const x = x0 + v0 * t + 0.5 * a * t * t;
      return { val: resV.toFixed(4), label: 'Velocidad Final (v)', unit: 'm/s', x: x.toFixed(4) };
    } else if (mruvSolve === 'x') {
      if (isNaN(v0) || isNaN(a) || isNaN(t) || isNaN(x0)) return { error: 'Ingrese x0, v0, a, t.' };
      const resX = x0 + v0 * t + 0.5 * a * t * t;
      return { val: resX.toFixed(4), label: 'Posición Final (x)', unit: 'm' };
    } else if (mruvSolve === 'a') {
      if (isNaN(v0) || isNaN(v) || isNaN(t) || t === 0) return { error: 'El tiempo t debe ser ≠ 0.' };
      const resA = (v - v0) / t;
      return { val: resA.toFixed(4), label: 'Aceleración (a)', unit: 'm/s²' };
    } else {
      if (isNaN(v0) || isNaN(v) || isNaN(a) || a === 0) return { error: 'La aceleración a debe ser ≠ 0.' };
      const resT = (v - v0) / a;
      return { val: resT.toFixed(4), label: 'Tiempo (t)', unit: 's' };
    }
  }, [mruvSolve, mruvV0, mruvV, mruvA, mruvT, mruvX0]);

  const resNewton = useMemo(() => {
    const m = parseFloat(newtonMass), f = parseFloat(newtonForce), mu = parseFloat(newtonMu);
    if (isNaN(m) || isNaN(f) || isNaN(mu) || m <= 0 || mu < 0) {
      return { error: 'Masa m > 0 y μ ≥ 0 requeridos.' };
    }
    const N = m * G_GRAVITY;
    const fk = mu * N;
    const fNet = f - fk;
    const accel = fNet / m;
    return { N: N.toFixed(2), fk: fk.toFixed(2), fNet: fNet.toFixed(2), accel: accel.toFixed(4) };
  }, [newtonMass, newtonForce, newtonMu]);

  const resWork = useMemo(() => {
    const F = parseFloat(workForce), d = parseFloat(workDist), ang = parseFloat(workAngle);
    const m = parseFloat(workMass), v = parseFloat(workVel);
    if (isNaN(F) || isNaN(d) || isNaN(ang) || isNaN(m) || isNaN(v) || m <= 0) {
      return { error: 'Ingrese parámetros válidos.' };
    }
    const rad = (ang * Math.PI) / 180;
    const W = F * d * Math.cos(rad);
    const Ec = 0.5 * m * v * v;
    return { W: W.toFixed(2), Ec: Ec.toFixed(2) };
  }, [workForce, workDist, workAngle, workMass, workVel]);

  const resEp = useMemo(() => {
    const m = parseFloat(epMass), h = parseFloat(epHeight);
    if (isNaN(m) || isNaN(h) || m <= 0) return { error: 'Masa m debe ser > 0.' };
    const Ep = m * G_GRAVITY * h;
    return { Ep: Ep.toFixed(2), EpkJ: (Ep / 1000).toFixed(4) };
  }, [epMass, epHeight]);

  const resMomentum = useMemo(() => {
    const m = parseFloat(pMass), v = parseFloat(pVel), F = parseFloat(pForce), dt = parseFloat(pTime);
    if (isNaN(m) || isNaN(v) || isNaN(F) || isNaN(dt) || m <= 0 || dt <= 0) {
      return { error: 'Masa m > 0 y tiempo Δt > 0 requeridos.' };
    }
    const p = m * v;
    const J = F * dt;
    const deltaV = J / m;
    return { p: p.toFixed(2), J: J.toFixed(2), deltaV: deltaV.toFixed(2) };
  }, [pMass, pVel, pForce, pTime]);

  const resTorque = useMemo(() => {
    const r = parseFloat(torqueRadius), F = parseFloat(torqueForce), ang = parseFloat(torqueAngle);
    if (isNaN(r) || isNaN(F) || isNaN(ang) || r < 0 || F < 0) {
      return { error: 'Radio y Fuerza deben ser ≥ 0.' };
    }
    const rad = (ang * Math.PI) / 180;
    const tau = r * F * Math.sin(rad);
    return { tau: tau.toFixed(4) };
  }, [torqueRadius, torqueForce, torqueAngle]);

  // 3. FÍSICA 2
  const resPascal = useMemo(() => {
    const P0 = parseFloat(pascalP0), rho = parseFloat(pascalRho), h = parseFloat(pascalH);
    const F1 = parseFloat(pascalF1), A1 = parseFloat(pascalA1), A2 = parseFloat(pascalA2);
    if (isNaN(P0) || isNaN(rho) || isNaN(h) || isNaN(F1) || isNaN(A1) || isNaN(A2) || A1 <= 0 || A2 <= 0) {
      return { error: 'Áreas A1 y A2 deben ser mayores a 0.' };
    }
    const P_hydro = rho * G_GRAVITY * h;
    const P_abs = P0 + P_hydro;
    const F2 = F1 * (A2 / A1);
    return {
      Phydro: (P_hydro / 1000).toFixed(2),
      Pabs: (P_abs / 1000).toFixed(2),
      F2: F2.toFixed(2),
      mult: (A2 / A1).toFixed(2)
    };
  }, [pascalP0, pascalRho, pascalH, pascalF1, pascalA1, pascalA2]);

  const resArquimedes = useMemo(() => {
    const rho = parseFloat(arqRhoFluid), vSub = parseFloat(arqVSub), mReal = parseFloat(arqMassReal);
    if (isNaN(rho) || isNaN(vSub) || isNaN(mReal) || rho <= 0 || vSub < 0 || mReal < 0) {
      return { error: 'Valores físicos coherentes requeridos.' };
    }
    const E = rho * vSub * G_GRAVITY;
    const Wreal = mReal * G_GRAVITY;
    const Wapp = Wreal - E;
    const floats = E >= Wreal;
    return { E: E.toFixed(2), Wreal: Wreal.toFixed(2), Wapp: Wapp.toFixed(2), floats };
  }, [arqRhoFluid, arqVSub, arqMassReal]);

  const resContinuity = useMemo(() => {
    const A1 = parseFloat(contA1), v1 = parseFloat(contV1), A2 = parseFloat(contA2);
    if (isNaN(A1) || isNaN(v1) || isNaN(A2) || A1 <= 0 || A2 <= 0 || v1 < 0) {
      return { error: 'Áreas A1, A2 > 0 requeridos.' };
    }
    const Q = A1 * v1;
    const v2 = Q / A2;
    return { Q: Q.toFixed(4), Q_Lps: (Q * 1000).toFixed(2), v2: v2.toFixed(4) };
  }, [contA1, contV1, contA2]);

  const resBernoulli = useMemo(() => {
    const P1 = parseFloat(bernP1), v1 = parseFloat(bernV1), z1 = parseFloat(bernZ1);
    const v2 = parseFloat(bernV2), z2 = parseFloat(bernZ2), rho = parseFloat(bernRho);
    if (isNaN(P1) || isNaN(v1) || isNaN(z1) || isNaN(v2) || isNaN(z2) || isNaN(rho) || rho <= 0) {
      return { error: 'Densidad ρ debe ser > 0.' };
    }
    const term1 = P1 + 0.5 * rho * v1 * v1 + rho * G_GRAVITY * z1;
    const P2 = term1 - 0.5 * rho * v2 * v2 - rho * G_GRAVITY * z2;
    return { P2_kPa: (P2 / 1000).toFixed(2), P2_Pa: P2.toFixed(0) };
  }, [bernP1, bernV1, bernZ1, bernV2, bernZ2, bernRho]);

  const resMAS = useMemo(() => {
    if (masType === 'pendulum') {
      const L = parseFloat(masLength);
      if (isNaN(L) || L <= 0) return { error: 'Longitud L debe ser > 0.' };
      const T = 2 * Math.PI * Math.sqrt(L / G_GRAVITY);
      const freq = 1 / T;
      return { T: T.toFixed(4), freq: freq.toFixed(4), typeLabel: 'Péndulo Simple' };
    } else {
      const m = parseFloat(masMass), k = parseFloat(masK);
      if (isNaN(m) || isNaN(k) || m <= 0 || k <= 0) return { error: 'Masa m > 0 y constante k > 0 requeridas.' };
      const T = 2 * Math.PI * Math.sqrt(m / k);
      const freq = 1 / T;
      const omega = Math.sqrt(k / m);
      return { T: T.toFixed(4), freq: freq.toFixed(4), omega: omega.toFixed(4), typeLabel: 'Sistema Masa-Resorte' };
    }
  }, [masType, masLength, masMass, masK]);

  const resWave = useMemo(() => {
    const lambda = parseFloat(waveLambda), f = parseFloat(waveFreq);
    if (isNaN(lambda) || isNaN(f) || lambda <= 0 || f <= 0) return { error: 'Longitud λ > 0 y Frecuencia f > 0.' };
    const v = lambda * f;
    const period = 1 / f;
    return { v: v.toFixed(2), T: period.toFixed(6) };
  }, [waveLambda, waveFreq]);

  // 4. QUÍMICA GENERAL
  const resGasIdeal = useMemo(() => {
    const P = parseFloat(gasP), V = parseFloat(gasV), n = parseFloat(gasN), T = parseFloat(gasT);
    if (gasSolve === 'P') {
      if (isNaN(V) || isNaN(n) || isNaN(T) || V <= 0 || n <= 0 || T <= 0) return { error: 'V, n, T deben ser > 0.' };
      const resP = (n * R_GAS_ATM * T) / V;
      return { val: resP.toFixed(4), unit: 'atm', label: 'Presión (P)' };
    } else if (gasSolve === 'V') {
      if (isNaN(P) || isNaN(n) || isNaN(T) || P <= 0 || n <= 0 || T <= 0) return { error: 'P, n, T deben ser > 0.' };
      const resV = (n * R_GAS_ATM * T) / P;
      return { val: resV.toFixed(4), unit: 'L', label: 'Volumen (V)' };
    } else if (gasSolve === 'n') {
      if (isNaN(P) || isNaN(V) || isNaN(T) || P <= 0 || V <= 0 || T <= 0) return { error: 'P, V, T deben ser > 0.' };
      const resN = (P * V) / (R_GAS_ATM * T);
      return { val: resN.toFixed(4), unit: 'mol', label: 'Moles (n)' };
    } else {
      if (isNaN(P) || isNaN(V) || isNaN(n) || P <= 0 || V <= 0 || n <= 0) return { error: 'P, V, n deben ser > 0.' };
      const resT = (P * V) / (n * R_GAS_ATM);
      return { val: resT.toFixed(2), unit: 'K', label: 'Temperatura (T)', celcius: (resT - 273.15).toFixed(2) + ' °C' };
    }
  }, [gasSolve, gasP, gasV, gasN, gasT]);

  const resConcentration = useMemo(() => {
    const nSol = parseFloat(concMolSolute), vSol = parseFloat(concVolSol);
    const z = parseFloat(concValence), kgSolvent = parseFloat(concKgSolvent);
    if (isNaN(nSol) || isNaN(vSol) || isNaN(z) || isNaN(kgSolvent) || vSol <= 0 || kgSolvent <= 0 || z <= 0) {
      return { error: 'Volumen V > 0, kg solvente > 0 y valencia z ≥ 1.' };
    }
    const M = nSol / vSol;
    const N = M * z;
    const m = nSol / kgSolvent;
    return { M: M.toFixed(4), N: N.toFixed(4), m: m.toFixed(4) };
  }, [concMolSolute, concVolSol, concValence, concKgSolvent]);

  const resDilution = useMemo(() => {
    const C1 = parseFloat(dilC1), V1 = parseFloat(dilV1);
    const C2 = parseFloat(dilC2), V2 = parseFloat(dilV2);
    if (dilMode === 'C2') {
      if (isNaN(C1) || isNaN(V1) || isNaN(V2) || V2 <= 0) return { error: 'V2 debe ser > 0.' };
      const resC2 = (C1 * V1) / V2;
      return { val: resC2.toFixed(4), label: 'Concentración Final (C2)', unit: 'M' };
    } else {
      if (isNaN(C1) || isNaN(V1) || isNaN(C2) || C2 <= 0) return { error: 'C2 debe ser > 0.' };
      const resV2 = (C1 * V1) / C2;
      const vWater = resV2 - V1;
      return { val: resV2.toFixed(2), label: 'Volumen Final (V2)', unit: 'mL', vWater: vWater.toFixed(2) + ' mL' };
    }
  }, [dilMode, dilC1, dilV1, dilC2, dilV2]);

  const resPh = useMemo(() => {
    if (phMode === 'strong') {
      const concH = parseFloat(phConcH);
      if (isNaN(concH) || concH <= 0 || concH > 14) return { error: 'Concentración [H+] debe ser > 0 y ≤ 14 M.' };
      const pH = -Math.log10(concH);
      const pOH = 14 - pH;
      const concOH = Math.pow(10, -pOH);
      return { pH: pH.toFixed(2), pOH: pOH.toFixed(2), concOH: concOH.toExponential(3) };
    } else {
      const Ka = parseFloat(phKa), C0 = parseFloat(phC0);
      if (isNaN(Ka) || isNaN(C0) || Ka <= 0 || C0 <= 0) return { error: 'Ka y C0 deben ser > 0.' };
      const concH = (-Ka + Math.sqrt(Ka * Ka + 4 * Ka * C0)) / 2;
      const pH = -Math.log10(concH);
      const alpha = (concH / C0) * 100;
      return { pH: pH.toFixed(2), concH: concH.toExponential(3), alpha: alpha.toFixed(2) };
    }
  }, [phMode, phConcH, phKa, phC0]);

  // 5. FISICOQUÍMICA 1
  const resThermo1 = useMemo(() => {
    const Q = parseFloat(thermoQ), W = parseFloat(thermoW);
    if (isNaN(Q) || isNaN(W)) return { error: 'Ingrese Q y W válidos.' };
    const dU = Q - W;
    return { dU: dU.toFixed(2), dUkJ: (dU / 1000).toFixed(4) };
  }, [thermoQ, thermoW]);

  const resIsoWork = useMemo(() => {
    const n = parseFloat(isoN), T = parseFloat(isoT), v1 = parseFloat(isoV1), v2 = parseFloat(isoV2);
    if (isNaN(n) || isNaN(T) || isNaN(v1) || isNaN(v2) || n <= 0 || T <= 0 || v1 <= 0 || v2 <= 0) {
      return { error: 'n, T, V1, V2 deben ser mayores a 0.' };
    }
    const W = n * R_GAS_J * T * Math.log(v2 / v1);
    const isExp = v2 > v1;
    return { W_J: W.toFixed(2), W_kJ: (W / 1000).toFixed(4), isExp };
  }, [isoN, isoT, isoV1, isoV2]);

  const resSensibleH = useMemo(() => {
    const m = parseFloat(hSensMass), cp = parseFloat(hSensCp);
    const t1 = parseFloat(hSensT1), t2 = parseFloat(hSensT2);
    if (isNaN(m) || isNaN(cp) || isNaN(t1) || isNaN(t2) || m <= 0 || cp <= 0) {
      return { error: 'Masa m > 0 y Cp > 0 requeridos.' };
    }
    const dT = t2 - t1;
    const dH = m * cp * dT;
    return { dH: dH.toFixed(2), dT: dT.toFixed(2) };
  }, [hSensMass, hSensCp, hSensT1, hSensT2]);

  const resClausiusClapeyron = useMemo(() => {
    const P1 = parseFloat(ccP1), T1 = parseFloat(ccT1), T2 = parseFloat(ccT2), Hvap = parseFloat(ccHvap);
    if (isNaN(P1) || isNaN(T1) || isNaN(T2) || isNaN(Hvap) || P1 <= 0 || T1 <= 0 || T2 <= 0 || Hvap <= 0) {
      return { error: 'P1, T1, T2 y ΔHvap deben ser mayores a 0.' };
    }
    const R_kJ = 0.00831447;
    const exponent = -(Hvap / R_kJ) * (1 / T2 - 1 / T1);
    const P2 = P1 * Math.exp(exponent);
    return { P2: P2.toFixed(4) };
  }, [ccP1, ccT1, ccT2, ccHvap]);

  // 6. FISICOQUÍMICA 2
  const resArrhenius = useMemo(() => {
    const A = parseFloat(arrA), Ea = parseFloat(arrEa), T = parseFloat(arrT);
    if (isNaN(A) || isNaN(Ea) || isNaN(T) || A <= 0 || T <= 0) {
      return { error: 'Factor A > 0 y Temperatura T > 0 requeridos.' };
    }
    const R_kJ = 0.00831447;
    const k = A * Math.exp(-Ea / (R_kJ * T));
    return { k: k.toExponential(4) };
  }, [arrA, arrEa, arrT]);

  const resKinetics = useMemo(() => {
    const A0 = parseFloat(kinA0), k = parseFloat(kinK), t = parseFloat(kinTime);
    if (isNaN(A0) || isNaN(k) || isNaN(t) || A0 <= 0 || k <= 0 || t < 0) {
      return { error: '[A]0 > 0, k > 0 y t ≥ 0 requeridos.' };
    }
    let At = 0, tHalf = 0;
    if (kinOrder === '0') {
      At = A0 - k * t;
      tHalf = A0 / (2 * k);
      if (At < 0) At = 0;
    } else if (kinOrder === '1') {
      At = A0 * Math.exp(-k * t);
      tHalf = Math.LN2 / k;
    } else {
      At = 1 / (1 / A0 + k * t);
      tHalf = 1 / (k * A0);
    }
    const conv = ((A0 - At) / A0) * 100;
    return { At: At.toFixed(4), tHalf: tHalf.toFixed(2), conv: conv.toFixed(2) };
  }, [kinOrder, kinA0, kinK, kinTime]);

  const resNernst = useMemo(() => {
    const E0 = parseFloat(nernstE0), n = parseFloat(nernstN), Q = parseFloat(nernstQ), T = parseFloat(nernstTemp);
    if (isNaN(E0) || isNaN(n) || isNaN(Q) || isNaN(T) || n <= 0 || Q <= 0 || T <= 0) {
      return { error: 'n ≥ 1, Q > 0, T > 0 requeridos.' };
    }
    const term = (R_GAS_J * T) / (n * FARADAY_C);
    const E = E0 - term * Math.log(Q);
    return { E: E.toFixed(4) };
  }, [nernstE0, nernstN, nernstQ, nernstTemp]);

  const resGibbsPhase = useMemo(() => {
    const C = parseInt(gibbsC), P = parseInt(gibbsP);
    if (isNaN(C) || isNaN(P) || C < 1 || P < 1) return { error: 'C ≥ 1 y P ≥ 1.' };
    const F = C - P + 2;
    return { F, desc: F === 0 ? 'Invariante (Punto fijo)' : F === 1 ? 'Monovariante' : 'Divariante / Multivariable' };
  }, [gibbsC, gibbsP]);

  const resLangmuir = useMemo(() => {
    const K = parseFloat(langK), P = parseFloat(langP);
    if (isNaN(K) || isNaN(P) || K <= 0 || P < 0) return { error: 'K > 0 y P ≥ 0 requeridos.' };
    const theta = (K * P) / (1 + K * P);
    return { theta: theta.toFixed(4), pct: (theta * 100).toFixed(2) + '%' };
  }, [langK, langP]);

  // 7. BALANCE DE MATERIA Y ENERGÍA
  const resBalanceGlobal = useMemo(() => {
    const F_in = parseFloat(balFin1), x_in = parseFloat(balXin1);
    const x_out1 = parseFloat(balXout1), x_out2 = parseFloat(balXout2);
    if (isNaN(F_in) || isNaN(x_in) || isNaN(x_out1) || isNaN(x_out2) || F_in <= 0 || x_out1 === x_out2) {
      return { error: 'F_in > 0 y x_out1 ≠ x_out2.' };
    }
    const D = (F_in * (x_in - x_out2)) / (x_out1 - x_out2);
    const B = F_in - D;
    if (D < 0 || B < 0) return { error: 'Balance imposible con las fracciones indicadas.' };
    return { D: D.toFixed(2), B: B.toFixed(2) };
  }, [balFin1, balXin1, balXout1, balXout2]);

  const resRecirculation = useMemo(() => {
    const Feed = parseFloat(recircFeed), R_ratio = parseFloat(recircRatio), P_frac = parseFloat(recircPurgeFrac);
    if (isNaN(Feed) || isNaN(R_ratio) || isNaN(P_frac) || Feed <= 0 || P_frac <= 0 || P_frac > 1) {
      return { error: 'Flujo alimento > 0 y 0 < Fracción purga ≤ 1.' };
    }
    const Purge = Feed * P_frac;
    const Recirc = Purge * R_ratio;
    const GrossFeed = Feed + Recirc;
    return { Purge: Purge.toFixed(2), Recirc: Recirc.toFixed(2), GrossFeed: GrossFeed.toFixed(2) };
  }, [recircFeed, recircRatio, recircPurgeFrac]);

  const resReactionExtent = useMemo(() => {
    const nA0 = parseFloat(rxnA0), nuA = parseFloat(rxnNuA), conv = parseFloat(rxnConv);
    if (isNaN(nA0) || isNaN(nuA) || isNaN(conv) || nA0 <= 0 || nuA >= 0 || conv < 0 || conv > 1) {
      return { error: 'nA0 > 0, νA < 0 (reactivo) y 0 ≤ Conversión X ≤ 1.' };
    }
    const nA = nA0 * (1 - conv);
    const xi = (nA - nA0) / nuA;
    return { nA: nA.toFixed(2), xi: xi.toFixed(4) };
  }, [rxnA0, rxnNuA, rxnConv]);

  const resEnergyBalance = useMemo(() => {
    const mIn = parseFloat(eBalMin), hIn = parseFloat(eBalHin);
    const mOut = parseFloat(eBalMout), hOut = parseFloat(eBalHout);
    const W = parseFloat(eBalWork);
    if (isNaN(mIn) || isNaN(hIn) || isNaN(mOut) || isNaN(hOut) || isNaN(W)) {
      return { error: 'Ingrese parámetros de balance válidos.' };
    }
    const Q = mOut * hOut - mIn * hIn + W;
    return { Q: Q.toFixed(2) };
  }, [eBalMin, eBalHin, eBalMout, eBalHout, eBalWork]);

  const resKirchhoff = useMemo(() => {
    const dH298 = parseFloat(kirchH298), dCp = parseFloat(kirchDcp), T_C = parseFloat(kirchT);
    if (isNaN(dH298) || isNaN(dCp) || isNaN(T_C)) return { error: 'Valores numéricos requeridos.' };
    const T_K = T_C + 273.15;
    const dT = T_K - 298.15;
    const dH_T = dH298 + (dCp * dT) / 1000;
    return { dH_T: dH_T.toFixed(2), dT: dT.toFixed(2) };
  }, [kirchH298, kirchDcp, kirchT]);

  return (
    <div className="animate-fade-in">
      {/* Search Bar & Header Toolbar */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <div className="search-solver-box">
          <FontAwesomeIcon icon={faSearch} className="search-solver-icon" />
          <input
            type="text"
            className="search-solver-input"
            placeholder="Buscar fórmula por nombre (ej. Bernoulli, Molaridad, Arrhenius)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-primary text-white p-2 px-3 rounded-pill fw-bold">
            Catálogo ChemSolver: 30+ Ecuaciones
          </span>
        </div>
      </div>

      {/* Academic Subject Pills Bar */}
      <div className="subject-nav-container">
        {SUBJECTS.map((s) => (
          <button
            key={s.id}
            className={`subject-tab-pill ${activeSubject === s.id ? 'active' : ''}`}
            onClick={() => setActiveSubject(s.id)}
          >
            <FontAwesomeIcon icon={s.icon} />
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Grid of Formulas */}
      <div className="row g-4">
        {/* 1. GENERALES */}
        {isCategoryVisible('generales') && matchesSearch('Factor de Conversión Regla de Tres', 'lineal tres proporcion general') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faCalculator} />
                  1. Regla de Tres / Conversión Lineal
                </h4>
                <span className="subject-badge-tag badge-generales">Generales</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="\frac{a}{b} = \frac{x}{y} \implies y = \frac{x \cdot b}{a}" block={true} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-4">
                  <label className="form-label small fw-bold">Valor Base a:</label>
                  <input type="number" className="solver-input" value={rule3A} onChange={(e) => setRule3A(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Proporción b:</label>
                  <input type="number" className="solver-input" value={rule3B} onChange={(e) => setRule3B(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Nuevo x:</label>
                  <input type="number" className="solver-input" value={rule3X} onChange={(e) => setRule3X(e.target.value)} />
                </div>
              </div>
              {resRule3.error ? (
                <div className="alert alert-danger">{resRule3.error}</div>
              ) : (
                <div className="result-card">
                  <div className="text-white-50 small fw-bold mb-1">Resultado Despejado (y):</div>
                  <div className="result-card-value">{resRule3.y}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('generales') && matchesSearch('Ecuación Cuadrática Raíces', 'cuadratica ax2 bx c raices') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faDraftingCompass} />
                  2. Ecuación Cuadrática
                </h4>
                <span className="subject-badge-tag badge-generales">Generales</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="a x^2 + b x + c = 0 \implies x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}" block={true} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-4">
                  <label className="form-label small fw-bold">Coef. a:</label>
                  <input type="number" className="solver-input" value={quadA} onChange={(e) => setQuadA(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Coef. b:</label>
                  <input type="number" className="solver-input" value={quadB} onChange={(e) => setQuadB(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Coef. c:</label>
                  <input type="number" className="solver-input" value={quadC} onChange={(e) => setQuadC(e.target.value)} />
                </div>
              </div>
              {resQuad.error ? (
                <div className="alert alert-danger">{resQuad.error}</div>
              ) : (
                <div className="result-card">
                  <div className="text-white-50 small fw-bold mb-1">Discriminante Δ = {resQuad.disc}:</div>
                  {!resQuad.complex ? (
                    <div>
                      <div className="result-card-value text-info mb-1">x₁ = {resQuad.x1}</div>
                      <div className="result-card-value text-info">x₂ = {resQuad.x2}</div>
                    </div>
                  ) : (
                    <div className="result-card-value text-warning fs-4">
                      {resQuad.real} ± {resQuad.imag} i
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('generales') && matchesSearch('Propagación de Errores Suma Producto Incertidumbre', 'errores propagacion desviacion suma producto') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faCalculator} />
                  3. Propagación de Errores
                </h4>
                <span className="subject-badge-tag badge-generales">Generales</span>
              </div>
              <div className="math-formula-container">
                <KatexMath
                  math={
                    errMode === 'sum'
                      ? '\\sigma_Z = \\sqrt{\\sigma_X^2 + \\sigma_Y^2}'
                      : '\\frac{\\sigma_Z}{|Z|} = \\sqrt{\\left(\\frac{\\sigma_X}{X}\\right)^2 + \\left(\\frac{\\sigma_Y}{Y}\\right)^2}'
                  }
                  block={true}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Operación:</label>
                <select className="solver-select" value={errMode} onChange={(e) => setErrMode(e.target.value)}>
                  <option value="sum">Suma / Resta (Z = X ± Y)</option>
                  <option value="prod">Producto / Cociente (Z = X · Y)</option>
                </select>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Valor X:</label>
                  <input type="number" className="solver-input" value={errValX} onChange={(e) => setErrValX(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Error σ_X:</label>
                  <input type="number" className="solver-input" value={errSigmaX} onChange={(e) => setErrSigmaX(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Valor Y:</label>
                  <input type="number" className="solver-input" value={errValY} onChange={(e) => setErrValY(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Error σ_Y:</label>
                  <input type="number" className="solver-input" value={errSigmaY} onChange={(e) => setErrSigmaY(e.target.value)} />
                </div>
              </div>
              {resErrorProp.error ? (
                <div className="alert alert-danger">{resErrorProp.error}</div>
              ) : (
                <div className="result-card">
                  <div className="text-white-50 small fw-bold">Resultado Z ± σ_Z:</div>
                  <div className="result-card-value">{resErrorProp.Z} ± {resErrorProp.sigmaZ}</div>
                  <div className="small text-warning mt-1">Error Relativo: {resErrorProp.relErr}%</div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('generales') && matchesSearch('Densidad y Densidad Relativa Gravedad Específica', 'densidad masa volumen relativa ge') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faScaleBalanced} />
                  4. Densidad y Densidad Relativa
                </h4>
                <span className="subject-badge-tag badge-generales">Generales</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="\rho = \frac{m}{V}, \quad GE = \frac{\rho}{\rho_{\text{ref}}}" block={true} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-4">
                  <label className="form-label small fw-bold">Masa m (g):</label>
                  <input type="number" className="solver-input" value={densMass} onChange={(e) => setDensMass(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Volumen V (cm³):</label>
                  <input type="number" className="solver-input" value={densVol} onChange={(e) => setDensVol(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">ρ_ref (g/cm³):</label>
                  <input type="number" className="solver-input" value={densRef} onChange={(e) => setDensRef(e.target.value)} />
                </div>
              </div>
              {resDensity.error ? (
                <div className="alert alert-danger">{resDensity.error}</div>
              ) : (
                <div className="result-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-white-50 small fw-bold">Densidad (ρ):</div>
                      <div className="result-card-value">{resDensity.rho} <span className="fs-6 text-white">g/cm³</span></div>
                      <div className="small text-white-50">{resDensity.rhoSI} kg/m³</div>
                    </div>
                    <div className="text-end">
                      <div className="text-white-50 small fw-bold">Densidad Relativa (GE):</div>
                      <div className="result-card-value text-warning">{resDensity.ge}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. FÍSICA 1 (MECÁNICA Y DINÁMICA CLÁSICA) */}
        {isCategoryVisible('fisica1') && matchesSearch('Cinemática MRUV Velocidad Aceleración Posición Tiempo', 'mruv cinemática velocidad aceleración tiempo posicion') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faAtom} />
                  1. Cinemática MRUV
                </h4>
                <span className="subject-badge-tag badge-fisica1">Física 1</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="v = v_0 + a t, \quad x = x_0 + v_0 t + \frac{1}{2} a t^2" block={true} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Variable a Despejar:</label>
                <select className="solver-select" value={mruvSolve} onChange={(e) => setMruvSolve(e.target.value)}>
                  <option value="v">Velocidad Final (v)</option>
                  <option value="x">Posición Final (x)</option>
                  <option value="a">Aceleración (a)</option>
                  <option value="t">Tiempo (t)</option>
                </select>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Velocidad inicial v₀ (m/s):</label>
                  <input type="number" className="solver-input" value={mruvV0} onChange={(e) => setMruvV0(e.target.value)} />
                </div>
                {mruvSolve !== 'v' && (
                  <div className="col-6">
                    <label className="form-label small fw-bold">Velocidad final v (m/s):</label>
                    <input type="number" className="solver-input" value={mruvV} onChange={(e) => setMruvV(e.target.value)} />
                  </div>
                )}
                {mruvSolve !== 'a' && (
                  <div className="col-6">
                    <label className="form-label small fw-bold">Aceleración a (m/s²):</label>
                    <input type="number" className="solver-input" value={mruvA} onChange={(e) => setMruvA(e.target.value)} />
                  </div>
                )}
                {mruvSolve !== 't' && (
                  <div className="col-6">
                    <label className="form-label small fw-bold">Tiempo t (s):</label>
                    <input type="number" className="solver-input" value={mruvT} onChange={(e) => setMruvT(e.target.value)} />
                  </div>
                )}
              </div>
              {resMRUV.error ? (
                <div className="alert alert-danger">{resMRUV.error}</div>
              ) : (
                <div className="result-card">
                  <div className="text-white-50 small fw-bold">{resMRUV.label}:</div>
                  <div className="result-card-value">{resMRUV.val} <span className="fs-5 text-white">{resMRUV.unit}</span></div>
                  {resMRUV.x && <div className="small text-white-50 mt-1">Desplazamiento total: {resMRUV.x} m</div>}
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('fisica1') && matchesSearch('Segunda Ley Newton Fuerza Fricción Masa Aceleración', 'newton fuerza friccion masa aceleracion rozamiento') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faAtom} />
                  2. 2ª Ley de Newton y Fricción
                </h4>
                <span className="subject-badge-tag badge-fisica1">Física 1</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="F_{\text{neta}} = m \cdot a, \quad f_k = \mu_k \cdot N" block={true} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-4">
                  <label className="form-label small fw-bold">Masa m (kg):</label>
                  <input type="number" className="solver-input" value={newtonMass} onChange={(e) => setNewtonMass(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Fuerza F (N):</label>
                  <input type="number" className="solver-input" value={newtonForce} onChange={(e) => setNewtonForce(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Coef. μ_k:</label>
                  <input type="number" className="solver-input" value={newtonMu} onChange={(e) => setNewtonMu(e.target.value)} step="0.05" />
                </div>
              </div>
              {resNewton.error ? (
                <div className="alert alert-danger">{resNewton.error}</div>
              ) : (
                <div className="result-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-white-50 small fw-bold">Aceleración Resultante (a):</div>
                      <div className="result-card-value">{resNewton.accel} <span className="fs-6 text-white">m/s²</span></div>
                    </div>
                    <div className="text-end">
                      <div className="small text-white-50">Fricción f_k: <strong className="text-warning">{resNewton.fk} N</strong></div>
                      <div className="small text-white-50">Fuerza Neta: <strong className="text-info">{resNewton.fNet} N</strong></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('fisica1') && matchesSearch('Trabajo Teorema Energía Cinética', 'trabajo energia cinetica teorema distancia fuerza') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faAtom} />
                  3. Trabajo y Energía Cinética
                </h4>
                <span className="subject-badge-tag badge-fisica1">Física 1</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="W = F \cdot d \cdot \cos(\theta), \quad E_c = \frac{1}{2} m v^2" block={true} />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Fuerza F (N):</label>
                  <input type="number" className="solver-input" value={workForce} onChange={(e) => setWorkForce(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Distancia d (m):</label>
                  <input type="number" className="solver-input" value={workDist} onChange={(e) => setWorkDist(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Ángulo θ (°):</label>
                  <input type="number" className="solver-input" value={workAngle} onChange={(e) => setWorkAngle(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Masa m (kg):</label>
                  <input type="number" className="solver-input" value={workMass} onChange={(e) => setWorkMass(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Velocidad v (m/s):</label>
                  <input type="number" className="solver-input" value={workVel} onChange={(e) => setWorkVel(e.target.value)} />
                </div>
              </div>
              {resWork.error ? (
                <div className="alert alert-danger">{resWork.error}</div>
              ) : (
                <div className="result-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-white-50 small fw-bold">Trabajo (W):</div>
                      <div className="result-card-value">{resWork.W} <span className="fs-6 text-white">J</span></div>
                    </div>
                    <div className="text-end">
                      <div className="text-white-50 small fw-bold">Energía Cinética (E_c):</div>
                      <div className="result-card-value text-info">{resWork.Ec} <span className="fs-6 text-white">J</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('fisica1') && matchesSearch('Energía Potencial Gravitatoria Altura Masa', 'energia potencial gravitatoria altura masa peso') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faAtom} />
                  4. Energía Potencial Gravitatoria
                </h4>
                <span className="subject-badge-tag badge-fisica1">Física 1</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="E_p = m \cdot g \cdot h" block={true} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Masa m (kg):</label>
                  <input type="number" className="solver-input" value={epMass} onChange={(e) => setEpMass(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Altura h (m):</label>
                  <input type="number" className="solver-input" value={epHeight} onChange={(e) => setEpHeight(e.target.value)} />
                </div>
              </div>
              {resEp.error ? (
                <div className="alert alert-danger">{resEp.error}</div>
              ) : (
                <div className="result-card">
                  <div className="text-white-50 small fw-bold">Energía Potencial (E_p):</div>
                  <div className="result-card-value">{resEp.Ep} <span className="fs-5 text-white">J</span></div>
                  <div className="small text-white-50 mt-1">Equivalente: {resEp.EpkJ} kJ</div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('fisica1') && matchesSearch('Impulso y Cantidad de Movimiento Momentum', 'impulso cantidad movimiento momentum masa fuerza tiempo') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faAtom} />
                  5. Momentum e Impulso
                </h4>
                <span className="subject-badge-tag badge-fisica1">Física 1</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="p = m \cdot v, \quad J = F \cdot \Delta t = \Delta p" block={true} />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Masa m (kg):</label>
                  <input type="number" className="solver-input" value={pMass} onChange={(e) => setPMass(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Velocidad v (m/s):</label>
                  <input type="number" className="solver-input" value={pVel} onChange={(e) => setPVel(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Fuerza F (N):</label>
                  <input type="number" className="solver-input" value={pForce} onChange={(e) => setPForce(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Tiempo Δt (s):</label>
                  <input type="number" className="solver-input" value={pTime} onChange={(e) => setPTime(e.target.value)} />
                </div>
              </div>
              {resMomentum.error ? (
                <div className="alert alert-danger">{resMomentum.error}</div>
              ) : (
                <div className="result-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-white-50 small fw-bold">Momentum (p):</div>
                      <div className="result-card-value">{resMomentum.p} <span className="fs-6 text-white">kg·m/s</span></div>
                    </div>
                    <div className="text-end">
                      <div className="text-white-50 small fw-bold">Impulso (J):</div>
                      <div className="result-card-value text-warning">{resMomentum.J} <span className="fs-6 text-white">N·s</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('fisica1') && matchesSearch('Torque Momento Torsión Fuerza Brazo Ángulo', 'torque momento torsion fuerza brazo angulo palanca') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faAtom} />
                  6. Momento de Torsión (Torque)
                </h4>
                <span className="subject-badge-tag badge-fisica1">Física 1</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="\tau = r \cdot F \cdot \sin(\theta)" block={true} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-4">
                  <label className="form-label small fw-bold">Radio r (m):</label>
                  <input type="number" className="solver-input" value={torqueRadius} onChange={(e) => setTorqueRadius(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Fuerza F (N):</label>
                  <input type="number" className="solver-input" value={torqueForce} onChange={(e) => setTorqueForce(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Ángulo θ (°):</label>
                  <input type="number" className="solver-input" value={torqueAngle} onChange={(e) => setTorqueAngle(e.target.value)} />
                </div>
              </div>
              {resTorque.error ? (
                <div className="alert alert-danger">{resTorque.error}</div>
              ) : (
                <div className="result-card">
                  <div className="text-white-50 small fw-bold">Torque Resultante (τ):</div>
                  <div className="result-card-value">{resTorque.tau} <span className="fs-5 text-white">N·m</span></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. FÍSICA 2 (FLUIDOS Y ONDAS - SIN ELECTROMAGNETISMO / ÓPTICA) */}
        {isCategoryVisible('fisica2') && matchesSearch('Presión Hidrostática Pascal Prensa Hidráulica', 'presion hidrostatica pascal prensa hidraulica profundidad') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faWater} />
                  1. Presión Hidrostática y Pascal
                </h4>
                <span className="subject-badge-tag badge-fisica2">Física 2</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="P = P_0 + \rho g h, \quad F_2 = F_1 \left(\frac{A_2}{A_1}\right)" block={true} />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-4">
                  <label className="form-label small fw-bold">Densidad ρ (kg/m³):</label>
                  <input type="number" className="solver-input" value={pascalRho} onChange={(e) => setPascalRho(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Profundidad h (m):</label>
                  <input type="number" className="solver-input" value={pascalH} onChange={(e) => setPascalH(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">F₁ entrada (N):</label>
                  <input type="number" className="solver-input" value={pascalF1} onChange={(e) => setPascalF1(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Área A₁ (m²):</label>
                  <input type="number" className="solver-input" value={pascalA1} onChange={(e) => setPascalA1(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Área A₂ (m²):</label>
                  <input type="number" className="solver-input" value={pascalA2} onChange={(e) => setPascalA2(e.target.value)} />
                </div>
              </div>
              {resPascal.error ? (
                <div className="alert alert-danger">{resPascal.error}</div>
              ) : (
                <div className="result-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-white-50 small fw-bold">Presión Absoluta (P):</div>
                      <div className="result-card-value">{resPascal.Pabs} <span className="fs-6 text-white">kPa</span></div>
                    </div>
                    <div className="text-end">
                      <div className="text-white-50 small fw-bold">Fuerza Multiplicada (F₂):</div>
                      <div className="result-card-value text-warning">{resPascal.F2} <span className="fs-6 text-white">N</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('fisica2') && matchesSearch('Fuerza Flotación Empuje Arquímedes Volumen Sumergido', 'flotacion empuje arquimedes volumen sumergido peso aparente') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faWater} />
                  2. Fuerza de Flotación (Arquímedes)
                </h4>
                <span className="subject-badge-tag badge-fisica2">Física 2</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="E = \rho_{\text{fluido}} \cdot V_{\text{sumergido}} \cdot g" block={true} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-4">
                  <label className="form-label small fw-bold">ρ_fluido (kg/m³):</label>
                  <input type="number" className="solver-input" value={arqRhoFluid} onChange={(e) => setArqRhoFluid(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">V_sumergido (m³):</label>
                  <input type="number" className="solver-input" value={arqVSub} onChange={(e) => setArqVSub(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Masa Real m (kg):</label>
                  <input type="number" className="solver-input" value={arqMassReal} onChange={(e) => setArqMassReal(e.target.value)} />
                </div>
              </div>
              {resArquimedes.error ? (
                <div className="alert alert-danger">{resArquimedes.error}</div>
              ) : (
                <div className="result-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-white-50 small fw-bold">Empuje (E):</div>
                      <div className="result-card-value">{resArquimedes.E} <span className="fs-6 text-white">N</span></div>
                    </div>
                    <div className="text-end">
                      <span className={`badge ${resArquimedes.floats ? 'bg-success' : 'bg-danger'} mb-1`}>
                        {resArquimedes.floats ? '¡El cuerpo Flota!' : 'El cuerpo se Hunde'}
                      </span>
                      <div className="small text-white-50">Peso Aparente: {resArquimedes.Wapp} N</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('fisica2') && matchesSearch('Ecuación Continuidad Caudal Flujo Cañeria', 'continuidad caudal flujo velocidad area tubería') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faWater} />
                  3. Ecuación de Continuidad
                </h4>
                <span className="subject-badge-tag badge-fisica2">Física 2</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="A_1 \cdot v_1 = A_2 \cdot v_2 = Q \text{ (Caudal)}" block={true} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-4">
                  <label className="form-label small fw-bold">Área A₁ (m²):</label>
                  <input type="number" className="solver-input" value={contA1} onChange={(e) => setContA1(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Velocidad v₁ (m/s):</label>
                  <input type="number" className="solver-input" value={contV1} onChange={(e) => setContV1(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Área A₂ (m²):</label>
                  <input type="number" className="solver-input" value={contA2} onChange={(e) => setContA2(e.target.value)} />
                </div>
              </div>
              {resContinuity.error ? (
                <div className="alert alert-danger">{resContinuity.error}</div>
              ) : (
                <div className="result-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-white-50 small fw-bold">Velocidad de salida (v₂):</div>
                      <div className="result-card-value text-info">{resContinuity.v2} <span className="fs-6 text-white">m/s</span></div>
                    </div>
                    <div className="text-end">
                      <div className="text-white-50 small fw-bold">Caudal Volumétrico (Q):</div>
                      <div className="result-card-value">{resContinuity.Q_Lps} <span className="fs-6 text-white">L/s</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('fisica2') && matchesSearch('Ecuación Bernoulli Presión Energía Fluidos', 'bernoulli presion velocidad altura fluidos hidrodinamica') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faWater} />
                  4. Ecuación de Bernoulli
                </h4>
                <span className="subject-badge-tag badge-fisica2">Física 2</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="P_1 + \frac{1}{2}\rho v_1^2 + \rho g z_1 = P_2 + \frac{1}{2}\rho v_2^2 + \rho g z_2" block={true} />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-4">
                  <label className="form-label small fw-bold">P₁ (Pa):</label>
                  <input type="number" className="solver-input" value={bernP1} onChange={(e) => setBernP1(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">v₁ (m/s):</label>
                  <input type="number" className="solver-input" value={bernV1} onChange={(e) => setBernV1(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">z₁ (m):</label>
                  <input type="number" className="solver-input" value={bernZ1} onChange={(e) => setBernZ1(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">v₂ (m/s):</label>
                  <input type="number" className="solver-input" value={bernV2} onChange={(e) => setBernV2(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">z₂ (m):</label>
                  <input type="number" className="solver-input" value={bernZ2} onChange={(e) => setBernZ2(e.target.value)} />
                </div>
              </div>
              {resBernoulli.error ? (
                <div className="alert alert-danger">{resBernoulli.error}</div>
              ) : (
                <div className="result-card">
                  <div className="text-white-50 small fw-bold">Presión Resultante P₂:</div>
                  <div className="result-card-value">{resBernoulli.P2_kPa} <span className="fs-5 text-white">kPa</span></div>
                  <div className="small text-white-50">Equivalente: {resBernoulli.P2_Pa} Pa</div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('fisica2') && matchesSearch('Movimiento Armónico Simple MAS Péndulo Resorte Período', 'mas movimiento armónico simple pendulo resorte periodo frecuencia') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faWater} />
                  5. MAS (Péndulo & Resorte)
                </h4>
                <span className="subject-badge-tag badge-fisica2">Física 2</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="T_{\text{péndulo}} = 2\pi\sqrt{\frac{L}{g}}, \quad T_{\text{resorte}} = 2\pi\sqrt{\frac{m}{k}}" block={true} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Sistema Oscilatorio:</label>
                <select className="solver-select" value={masType} onChange={(e) => setMasType(e.target.value)}>
                  <option value="pendulum">Péndulo Simple (Longitud L)</option>
                  <option value="spring">Masa-Resorte (Masa m, Constante k)</option>
                </select>
              </div>
              {masType === 'pendulum' ? (
                <div className="mb-3">
                  <label className="form-label small fw-bold">Longitud del péndulo L (m):</label>
                  <input type="number" className="solver-input" value={masLength} onChange={(e) => setMasLength(e.target.value)} />
                </div>
              ) : (
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold">Masa m (kg):</label>
                    <input type="number" className="solver-input" value={masMass} onChange={(e) => setMasMass(e.target.value)} />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Constante k (N/m):</label>
                    <input type="number" className="solver-input" value={masK} onChange={(e) => setMasK(e.target.value)} />
                  </div>
                </div>
              )}
              {resMAS.error ? (
                <div className="alert alert-danger">{resMAS.error}</div>
              ) : (
                <div className="result-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-white-50 small fw-bold">Período (T):</div>
                      <div className="result-card-value">{resMAS.T} <span className="fs-6 text-white">s</span></div>
                    </div>
                    <div className="text-end">
                      <div className="text-white-50 small fw-bold">Frecuencia (f):</div>
                      <div className="result-card-value text-info">{resMAS.freq} <span className="fs-6 text-white">Hz</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('fisica2') && matchesSearch('Velocidad Frecuencia Ondas Mecánicas Longitud Onda', 'ondas mecanicas velocidad frecuencia longitud onda periodo') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faWater} />
                  6. Ondas Mecánicas
                </h4>
                <span className="subject-badge-tag badge-fisica2">Física 2</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="v = \lambda \cdot f \implies f = \frac{1}{T}" block={true} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Longitud de Onda λ (m):</label>
                  <input type="number" className="solver-input" value={waveLambda} onChange={(e) => setWaveLambda(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Frecuencia f (Hz):</label>
                  <input type="number" className="solver-input" value={waveFreq} onChange={(e) => setWaveFreq(e.target.value)} />
                </div>
              </div>
              {resWave.error ? (
                <div className="alert alert-danger">{resWave.error}</div>
              ) : (
                <div className="result-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-white-50 small fw-bold">Velocidad de Propagación (v):</div>
                      <div className="result-card-value">{resWave.v} <span className="fs-6 text-white">m/s</span></div>
                    </div>
                    <div className="text-end">
                      <div className="small text-white-50">Período T: <strong className="text-warning">{resWave.T} s</strong></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. QUÍMICA GENERAL */}
        {isCategoryVisible('quimica_gen') && matchesSearch('Ley Gases Ideales Presión Volumen Moles Temperatura', 'gases ideales presion volumen moles temperatura PV nRT') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faFlask} />
                  1. Ley de los Gases Ideales
                </h4>
                <span className="subject-badge-tag badge-quimica_gen">Química General</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="P \cdot V = n \cdot R \cdot T" block={true} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Despejar Variable:</label>
                <select className="solver-select" value={gasSolve} onChange={(e) => setGasSolve(e.target.value)}>
                  <option value="P">Presión (P)</option>
                  <option value="V">Volumen (V)</option>
                  <option value="n">Moles (n)</option>
                  <option value="T">Temperatura (T)</option>
                </select>
              </div>
              <div className="row g-2 mb-3">
                {gasSolve !== 'P' && (
                  <div className="col-6">
                    <label className="form-label small fw-bold">Presión P (atm):</label>
                    <input type="number" className="solver-input" value={gasP} onChange={(e) => setGasP(e.target.value)} />
                  </div>
                )}
                {gasSolve !== 'V' && (
                  <div className="col-6">
                    <label className="form-label small fw-bold">Volumen V (L):</label>
                    <input type="number" className="solver-input" value={gasV} onChange={(e) => setGasV(e.target.value)} />
                  </div>
                )}
                {gasSolve !== 'n' && (
                  <div className="col-6">
                    <label className="form-label small fw-bold">Moles n (mol):</label>
                    <input type="number" className="solver-input" value={gasN} onChange={(e) => setGasN(e.target.value)} />
                  </div>
                )}
                {gasSolve !== 'T' && (
                  <div className="col-6">
                    <label className="form-label small fw-bold">Temperatura T (K):</label>
                    <input type="number" className="solver-input" value={gasT} onChange={(e) => setGasT(e.target.value)} />
                  </div>
                )}
              </div>
              {resGasIdeal.error ? (
                <div className="alert alert-danger">{resGasIdeal.error}</div>
              ) : (
                <div className="result-card">
                  <div className="text-white-50 small fw-bold">{resGasIdeal.label}:</div>
                  <div className="result-card-value">{resGasIdeal.val} <span className="fs-5 text-white">{resGasIdeal.unit}</span></div>
                  {resGasIdeal.celcius && <div className="small text-white-50 mt-1">Equiv: {resGasIdeal.celcius}</div>}
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('quimica_gen') && matchesSearch('Concentraciones Molaridad Normalidad Molalidad', 'concentracion molaridad normalidad molalidad soluciones soluto solvente') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faFlask} />
                  2. Concentraciones M, N, m
                </h4>
                <span className="subject-badge-tag badge-quimica_gen">Química General</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="M = \frac{n}{V_{\text{L}}}, \quad N = M \cdot z, \quad m = \frac{n}{\text{kg}_{\text{solvente}}}" block={true} />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Moles de soluto (mol):</label>
                  <input type="number" className="solver-input" value={concMolSolute} onChange={(e) => setConcMolSolute(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Vol. solución (L):</label>
                  <input type="number" className="solver-input" value={concVolSol} onChange={(e) => setConcVolSol(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Valencia z (eq/mol):</label>
                  <input type="number" className="solver-input" value={concValence} onChange={(e) => setConcValence(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Masa solvente (kg):</label>
                  <input type="number" className="solver-input" value={concKgSolvent} onChange={(e) => setConcKgSolvent(e.target.value)} />
                </div>
              </div>
              {resConcentration.error ? (
                <div className="alert alert-danger">{resConcentration.error}</div>
              ) : (
                <div className="result-card">
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="text-white-50 small fw-bold">Molaridad (M)</div>
                      <div className="result-card-value fs-3">{resConcentration.M}</div>
                    </div>
                    <div className="col-4">
                      <div className="text-white-50 small fw-bold">Normalidad (N)</div>
                      <div className="result-card-value fs-3 text-info">{resConcentration.N}</div>
                    </div>
                    <div className="col-4">
                      <div className="text-white-50 small fw-bold">Molalidad (m)</div>
                      <div className="result-card-value fs-3 text-warning">{resConcentration.m}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('quimica_gen') && matchesSearch('Ecuación Dilución C1V1 C2V2 Mezclas Concentración', 'dilucion c1v1 c2v2 mezclas concentracion volumen agua') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faFlask} />
                  3. Ecuación de Dilución
                </h4>
                <span className="subject-badge-tag badge-quimica_gen">Química General</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="C_1 \cdot V_1 = C_2 \cdot V_2" block={true} />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Conc. Inicial C₁:</label>
                  <input type="number" className="solver-input" value={dilC1} onChange={(e) => setDilC1(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Vol. Inicial V₁:</label>
                  <input type="number" className="solver-input" value={dilV1} onChange={(e) => setDilV1(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Conc. Deseada C₂:</label>
                  <input type="number" className="solver-input" value={dilC2} onChange={(e) => setDilC2(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Vol. Final V₂:</label>
                  <input type="number" className="solver-input" value={dilV2} onChange={(e) => setDilV2(e.target.value)} />
                </div>
              </div>
              {resDilution.error ? (
                <div className="alert alert-danger">{resDilution.error}</div>
              ) : (
                <div className="result-card">
                  <div className="text-white-50 small fw-bold">{resDilution.label}:</div>
                  <div className="result-card-value">{resDilution.val} <span className="fs-5 text-white">{resDilution.unit}</span></div>
                  {resDilution.vWater && <div className="small text-warning mt-1">Agua a agregar: {resDilution.vWater}</div>}
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('quimica_gen') && matchesSearch('pH pOH Ácido Base Ka Hidronio Constante', 'ph poh acido base ka constante equilibrio hidronio') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faFlask} />
                  4. Cálculo de pH y pOH
                </h4>
                <span className="subject-badge-tag badge-quimica_gen">Química General</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="\text{pH} = -\log_{10}[\text{H}^+], \quad \text{pH} + \text{pOH} = 14" block={true} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Tipo de Ácido/Base:</label>
                <select className="solver-select" value={phMode} onChange={(e) => setPhMode(e.target.value)}>
                  <option value="strong">Ácido Fuerte (Disociación Completa)</option>
                  <option value="weak">Ácido Débil (Equilibrio Ka)</option>
                </select>
              </div>
              {phMode === 'strong' ? (
                <div className="mb-3">
                  <label className="form-label small fw-bold">Concentración [H⁺] (M):</label>
                  <input type="number" className="solver-input" value={phConcH} onChange={(e) => setPhConcH(e.target.value)} step="any" />
                </div>
              ) : (
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold">Constante Ka:</label>
                    <input type="number" className="solver-input" value={phKa} onChange={(e) => setPhKa(e.target.value)} step="any" />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">Conc. Inicial C₀ (M):</label>
                    <input type="number" className="solver-input" value={phC0} onChange={(e) => setPhC0(e.target.value)} />
                  </div>
                </div>
              )}
              {resPh.error ? (
                <div className="alert alert-danger">{resPh.error}</div>
              ) : (
                <div className="result-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-white-50 small fw-bold">pH Resultante:</div>
                      <div className="result-card-value text-info">{resPh.pH}</div>
                    </div>
                    <div className="text-end">
                      {resPh.pOH && <div className="small text-white-50">pOH: <strong className="text-white">{resPh.pOH}</strong></div>}
                      {resPh.alpha && <div className="small text-warning">Ionización: {resPh.alpha}%</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. FISICOQUÍMICA 1 */}
        {isCategoryVisible('fisicoquimica1') && matchesSearch('Primera Ley Termodinámica Calor Trabajo Energía Interna', 'primera ley termodinamica calor trabajo energia interna Q W dU') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faFire} />
                  1. 1ª Ley de la Termodinámica
                </h4>
                <span className="subject-badge-tag badge-fisicoquimica1">Fisicoquímica 1</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="\Delta U = Q - W" block={true} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Calor Q (J):</label>
                  <input type="number" className="solver-input" value={thermoQ} onChange={(e) => setThermoQ(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Trabajo W (J):</label>
                  <input type="number" className="solver-input" value={thermoW} onChange={(e) => setThermoW(e.target.value)} />
                </div>
              </div>
              {resThermo1.error ? (
                <div className="alert alert-danger">{resThermo1.error}</div>
              ) : (
                <div className="result-card">
                  <div className="text-white-50 small fw-bold">Variación de Energía Interna (ΔU):</div>
                  <div className="result-card-value">{resThermo1.dU} <span className="fs-5 text-white">J</span></div>
                  <div className="small text-white-50 mt-1">{resThermo1.dUkJ} kJ</div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('fisicoquimica1') && matchesSearch('Trabajo Isotérmico Reversible Gas Ideal Expansión Compresión', 'trabajo isotermico reversible expansion compresion gas ideal W nRT ln') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faFire} />
                  2. Trabajo Isotérmico Reversible
                </h4>
                <span className="subject-badge-tag badge-fisicoquimica1">Fisicoquímica 1</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="W = n R T \ln\left(\frac{V_2}{V_1}\right)" block={true} />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Moles n (mol):</label>
                  <input type="number" className="solver-input" value={isoN} onChange={(e) => setIsoN(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Temp. T (K):</label>
                  <input type="number" className="solver-input" value={isoT} onChange={(e) => setIsoT(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Vol. Inicial V₁ (L):</label>
                  <input type="number" className="solver-input" value={isoV1} onChange={(e) => setIsoV1(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Vol. Final V₂ (L):</label>
                  <input type="number" className="solver-input" value={isoV2} onChange={(e) => setIsoV2(e.target.value)} />
                </div>
              </div>
              {resIsoWork.error ? (
                <div className="alert alert-danger">{resIsoWork.error}</div>
              ) : (
                <div className="result-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-white-50 small fw-bold">Trabajo (W):</div>
                      <div className="result-card-value">{resIsoWork.W_kJ} <span className="fs-6 text-white">kJ</span></div>
                    </div>
                    <div className="text-end">
                      <span className={`badge ${resIsoWork.isExp ? 'bg-success' : 'bg-warning'} mb-1`}>
                        {resIsoWork.isExp ? 'Expansión (W > 0)' : 'Compresión (W < 0)'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('fisicoquimica1') && matchesSearch('Entalpía Calor Sensible Cp Temperatura', 'entalpia calor sensible cp temperatura dH m Cp dT') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faFire} />
                  3. Variación de Entalpía (ΔH)
                </h4>
                <span className="subject-badge-tag badge-fisicoquimica1">Fisicoquímica 1</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="\Delta H = m \cdot C_p \cdot (T_2 - T_1)" block={true} />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Masa m (kg):</label>
                  <input type="number" className="solver-input" value={hSensMass} onChange={(e) => setHSensMass(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">C_p (kJ/(kg·K)):</label>
                  <input type="number" className="solver-input" value={hSensCp} onChange={(e) => setHSensCp(e.target.value)} step="0.01" />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">T₁ (°C):</label>
                  <input type="number" className="solver-input" value={hSensT1} onChange={(e) => setHSensT1(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">T₂ (°C):</label>
                  <input type="number" className="solver-input" value={hSensT2} onChange={(e) => setHSensT2(e.target.value)} />
                </div>
              </div>
              {resSensibleH.error ? (
                <div className="alert alert-danger">{resSensibleH.error}</div>
              ) : (
                <div className="result-card">
                  <div className="text-white-50 small fw-bold">Calor Sensible (ΔH):</div>
                  <div className="result-card-value">{resSensibleH.dH} <span className="fs-5 text-white">kJ</span></div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('fisicoquimica1') && matchesSearch('Clausius Clapeyron Presión Vapor Calor Vaporización', 'clausius clapeyron presion vapor calor vaporizacion Hvap T1 T2 P1 P2') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faFire} />
                  4. Clausius-Clapeyron Integrada
                </h4>
                <span className="subject-badge-tag badge-fisicoquimica1">Fisicoquímica 1</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="\ln\left(\frac{P_2}{P_1}\right) = -\frac{\Delta H_{\text{vap}}}{R}\left(\frac{1}{T_2} - \frac{1}{T_1}\right)" block={true} />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Presión P₁ (atm):</label>
                  <input type="number" className="solver-input" value={ccP1} onChange={(e) => setCcP1(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Temp. T₁ (K):</label>
                  <input type="number" className="solver-input" value={ccT1} onChange={(e) => setCcT1(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Temp. T₂ (K):</label>
                  <input type="number" className="solver-input" value={ccT2} onChange={(e) => setCcT2(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">ΔH_vap (kJ/mol):</label>
                  <input type="number" className="solver-input" value={ccHvap} onChange={(e) => setCcHvap(e.target.value)} />
                </div>
              </div>
              {resClausiusClapeyron.error ? (
                <div className="alert alert-danger">{resClausiusClapeyron.error}</div>
              ) : (
                <div className="result-card">
                  <div className="text-white-50 small fw-bold">Presión de Vapor Resultante P₂:</div>
                  <div className="result-card-value">{resClausiusClapeyron.P2} <span className="fs-5 text-white">atm</span></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. FISICOQUÍMICA 2 */}
        {isCategoryVisible('fisicoquimica2') && matchesSearch('Arrhenius Energía Activación Constante Velocidad', 'arrhenius energia activacion constante velocidad k Ea T') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faMicroscope} />
                  1. Ecuación de Arrhenius
                </h4>
                <span className="subject-badge-tag badge-fisicoquimica2">Fisicoquímica 2</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="k = A \cdot e^{-\frac{E_a}{R T}}" block={true} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-4">
                  <label className="form-label small fw-bold">Factor A:</label>
                  <input type="number" className="solver-input" value={arrA} onChange={(e) => setArrA(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">E_a (kJ/mol):</label>
                  <input type="number" className="solver-input" value={arrEa} onChange={(e) => setArrEa(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Temp. T (K):</label>
                  <input type="number" className="solver-input" value={arrT} onChange={(e) => setArrT(e.target.value)} />
                </div>
              </div>
              {resArrhenius.error ? (
                <div className="alert alert-danger">{resArrhenius.error}</div>
              ) : (
                <div className="result-card">
                  <div className="text-white-50 small fw-bold">Constante de Velocidad (k):</div>
                  <div className="result-card-value">{resArrhenius.k}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('fisicoquimica2') && matchesSearch('Cinéticas Integradas Orden 0 1 2 Vida Media t1/2', 'cinetica integrada orden cero uno dos vida media t1/2 concentracion tiempo') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faMicroscope} />
                  2. Cinéticas (Orden 0, 1 y 2)
                </h4>
                <span className="subject-badge-tag badge-fisicoquimica2">Fisicoquímica 2</span>
              </div>
              <div className="math-formula-container">
                <KatexMath
                  math={
                    kinOrder === '0'
                      ? '[A] = [A]_0 - k t, \\quad t_{1/2} = \\frac{[A]_0}{2k}'
                      : kinOrder === '1'
                      ? '[A] = [A]_0 e^{-k t}, \\quad t_{1/2} = \\frac{\\ln 2}{k}'
                      : '\\frac{1}{[A]} = \\frac{1}{[A]_0} + k t, \\quad t_{1/2} = \\frac{1}{k [A]_0}'
                  }
                  block={true}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Orden de Reacción:</label>
                <select className="solver-select" value={kinOrder} onChange={(e) => setKinOrder(e.target.value)}>
                  <option value="0">Orden 0 (Lineal)</option>
                  <option value="1">Orden 1 (Exponencial)</option>
                  <option value="2">Orden 2 (Inversa)</option>
                </select>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-4">
                  <label className="form-label small fw-bold">[A]₀ (M):</label>
                  <input type="number" className="solver-input" value={kinA0} onChange={(e) => setKinA0(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Constante k:</label>
                  <input type="number" className="solver-input" value={kinK} onChange={(e) => setKinK(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Tiempo t (s):</label>
                  <input type="number" className="solver-input" value={kinTime} onChange={(e) => setKinTime(e.target.value)} />
                </div>
              </div>
              {resKinetics.error ? (
                <div className="alert alert-danger">{resKinetics.error}</div>
              ) : (
                <div className="result-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-white-50 small fw-bold">Conc. Final [A]:</div>
                      <div className="result-card-value">{resKinetics.At} <span className="fs-6 text-white">M</span></div>
                    </div>
                    <div className="text-end">
                      <div className="small text-white-50">Vida media t_1/2: <strong className="text-warning">{resKinetics.tHalf} s</strong></div>
                      <div className="small text-white-50">Conversión: <strong className="text-info">{resKinetics.conv}%</strong></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('fisicoquimica2') && matchesSearch('Ecuación Nernst Potencial Celda Electroquímica', 'nernst potencial celda electroquimica voltaje Q n') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faMicroscope} />
                  3. Ecuación de Nernst
                </h4>
                <span className="subject-badge-tag badge-fisicoquimica2">Fisicoquímica 2</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="E = E^\circ - \frac{R T}{n F} \ln(Q)" block={true} />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Potencial E° (V):</label>
                  <input type="number" className="solver-input" value={nernstE0} onChange={(e) => setNernstE0(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Electrones n:</label>
                  <input type="number" className="solver-input" value={nernstN} onChange={(e) => setNernstN(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Cociente Q:</label>
                  <input type="number" className="solver-input" value={nernstQ} onChange={(e) => setNernstQ(e.target.value)} step="any" />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Temp. T (K):</label>
                  <input type="number" className="solver-input" value={nernstTemp} onChange={(e) => setNernstTemp(e.target.value)} />
                </div>
              </div>
              {resNernst.error ? (
                <div className="alert alert-danger">{resNernst.error}</div>
              ) : (
                <div className="result-card">
                  <div className="text-white-50 small fw-bold">Potencial Celda (E):</div>
                  <div className="result-card-value">{resNernst.E} <span className="fs-5 text-white">V</span></div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('fisicoquimica2') && matchesSearch('Regla Fases Gibbs Libertad Componentes', 'regla fases gibbs grados libertad componentes fases F C P') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faMicroscope} />
                  4. Regla de las Fases de Gibbs
                </h4>
                <span className="subject-badge-tag badge-fisicoquimica2">Fisicoquímica 2</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="F = C - P + 2" block={true} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Componentes C:</label>
                  <input type="number" className="solver-input" value={gibbsC} onChange={(e) => setGibbsC(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Fases P:</label>
                  <input type="number" className="solver-input" value={gibbsP} onChange={(e) => setGibbsP(e.target.value)} />
                </div>
              </div>
              {resGibbsPhase.error ? (
                <div className="alert alert-danger">{resGibbsPhase.error}</div>
              ) : (
                <div className="result-card">
                  <div className="text-white-50 small fw-bold">Grados de Libertad (F):</div>
                  <div className="result-card-value">{resGibbsPhase.F}</div>
                  <div className="small text-warning mt-1">{resGibbsPhase.desc}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('fisicoquimica2') && matchesSearch('Isoterma Adsorción Langmuir Cobertura Presión', 'isoterma adsorcion langmuir cobertura presion K P theta') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faMicroscope} />
                  5. Isoterma de Langmuir
                </h4>
                <span className="subject-badge-tag badge-fisicoquimica2">Fisicoquímica 2</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="\theta = \frac{K \cdot P}{1 + K \cdot P}" block={true} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Constante K (bar⁻¹):</label>
                  <input type="number" className="solver-input" value={langK} onChange={(e) => setLangK(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Presión P (bar):</label>
                  <input type="number" className="solver-input" value={langP} onChange={(e) => setLangP(e.target.value)} />
                </div>
              </div>
              {resLangmuir.error ? (
                <div className="alert alert-danger">{resLangmuir.error}</div>
              ) : (
                <div className="result-card">
                  <div className="text-white-50 small fw-bold">Fracción de Recubrimiento (θ):</div>
                  <div className="result-card-value">{resLangmuir.theta}</div>
                  <div className="small text-info mt-1">Superficie ocupada: {resLangmuir.pct}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. BALANCE DE MATERIA Y ENERGÍA */}
        {isCategoryVisible('balances') && matchesSearch('Balance Global Materia Sin Reacción Estado Estacionario', 'balance global materia sin reaccion estado estacionario entradas salidas D B') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faScaleBalanced} />
                  1. Balance Global Sin Reacción
                </h4>
                <span className="subject-badge-tag badge-balances">Balances</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="\sum F_{\text{entradas}} = \sum F_{\text{salidas}}" block={true} />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Entrada F_in (kg/h):</label>
                  <input type="number" className="solver-input" value={balFin1} onChange={(e) => setBalFin1(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Fracción x_in:</label>
                  <input type="number" className="solver-input" value={balXin1} onChange={(e) => setBalXin1(e.target.value)} step="0.05" />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Fracción x_D:</label>
                  <input type="number" className="solver-input" value={balXout1} onChange={(e) => setBalXout1(e.target.value)} step="0.05" />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Fracción x_B:</label>
                  <input type="number" className="solver-input" value={balXout2} onChange={(e) => setBalXout2(e.target.value)} step="0.05" />
                </div>
              </div>
              {resBalanceGlobal.error ? (
                <div className="alert alert-danger">{resBalanceGlobal.error}</div>
              ) : (
                <div className="result-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-white-50 small fw-bold">Destilado (D):</div>
                      <div className="result-card-value text-info">{resBalanceGlobal.D} <span className="fs-6 text-white">kg/h</span></div>
                    </div>
                    <div className="text-end">
                      <div className="text-white-50 small fw-bold">Fondos (B):</div>
                      <div className="result-card-value text-warning">{resBalanceGlobal.B} <span className="fs-6 text-white">kg/h</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('balances') && matchesSearch('Recirculación Purga Flujos Balances', 'recirculacion purga flujos balances alimento purga ratio') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faScaleBalanced} />
                  2. Recirculación y Purga
                </h4>
                <span className="subject-badge-tag badge-balances">Balances</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="F_{\text{alimento}} = F_{\text{producto}} + F_{\text{purga}}, \quad R = (\text{Ratio}) \cdot P" block={true} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-4">
                  <label className="form-label small fw-bold">Alimento F (kmol/h):</label>
                  <input type="number" className="solver-input" value={recircFeed} onChange={(e) => setRecircFeed(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Razón R/P:</label>
                  <input type="number" className="solver-input" value={recircRatio} onChange={(e) => setRecircRatio(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Frac. Purga:</label>
                  <input type="number" className="solver-input" value={recircPurgeFrac} onChange={(e) => setRecircPurgeFrac(e.target.value)} step="0.05" />
                </div>
              </div>
              {resRecirculation.error ? (
                <div className="alert alert-danger">{resRecirculation.error}</div>
              ) : (
                <div className="result-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-white-50 small fw-bold">Flujo Purga (P):</div>
                      <div className="result-card-value">{resRecirculation.Purge} <span className="fs-6 text-white">kmol/h</span></div>
                    </div>
                    <div className="text-end">
                      <div className="text-white-50 small fw-bold">Flujo Recirculación (R):</div>
                      <div className="result-card-value text-warning">{resRecirculation.Recirc} <span className="fs-6 text-white">kmol/h</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('balances') && matchesSearch('Grado Avance Reacción Conversión Fraccional Estequiometría', 'grado avance reaccion conversion fraccional xi estequiometria X') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faScaleBalanced} />
                  3. Grado de Avance y Conversión
                </h4>
                <span className="subject-badge-tag badge-balances">Balances</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="\xi = \frac{n_i - n_{i0}}{\nu_i}, \quad X = \frac{n_{A0} - n_A}{n_{A0}}" block={true} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-4">
                  <label className="form-label small fw-bold">nA0 (mol):</label>
                  <input type="number" className="solver-input" value={rxnA0} onChange={(e) => setRxnA0(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Coef. νA:</label>
                  <input type="number" className="solver-input" value={rxnNuA} onChange={(e) => setRxnNuA(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Conversión X:</label>
                  <input type="number" className="solver-input" value={rxnConv} onChange={(e) => setRxnConv(e.target.value)} step="0.05" />
                </div>
              </div>
              {resReactionExtent.error ? (
                <div className="alert alert-danger">{resReactionExtent.error}</div>
              ) : (
                <div className="result-card">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-white-50 small fw-bold">Grado de Avance (ξ):</div>
                      <div className="result-card-value text-info">{resReactionExtent.xi} <span className="fs-6 text-white">mol</span></div>
                    </div>
                    <div className="text-end">
                      <div className="text-white-50 small fw-bold">Moles Finales nA:</div>
                      <div className="result-card-value">{resReactionExtent.nA} <span className="fs-6 text-white">mol</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('balances') && matchesSearch('Balance Energía Régimen Estacionario Entalpía Trabajo', 'balance energia regimen estacionario entalpia trabajo calor Q W h_in h_out') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faScaleBalanced} />
                  4. Balance de Energía Estacionario
                </h4>
                <span className="subject-badge-tag badge-balances">Balances</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="Q_{\text{neto}} - W_{\text{eje}} = \sum m_{\text{out}} h_{\text{out}} - \sum m_{\text{in}} h_{\text{in}}" block={true} />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">m_in (kg/s):</label>
                  <input type="number" className="solver-input" value={eBalMin} onChange={(e) => setEBalMin(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">h_in (kJ/kg):</label>
                  <input type="number" className="solver-input" value={eBalHin} onChange={(e) => setEBalHin(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">m_out (kg/s):</label>
                  <input type="number" className="solver-input" value={eBalMout} onChange={(e) => setEBalMout(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">h_out (kJ/kg):</label>
                  <input type="number" className="solver-input" value={eBalHout} onChange={(e) => setEBalHout(e.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Trabajo de Eje W_eje (kW):</label>
                  <input type="number" className="solver-input" value={eBalWork} onChange={(e) => setEBalWork(e.target.value)} />
                </div>
              </div>
              {resEnergyBalance.error ? (
                <div className="alert alert-danger">{resEnergyBalance.error}</div>
              ) : (
                <div className="result-card">
                  <div className="text-white-50 small fw-bold">Calor Requerido / Transferido (Q):</div>
                  <div className="result-card-value">{resEnergyBalance.Q} <span className="fs-5 text-white">kW</span></div>
                </div>
              )}
            </div>
          </div>
        )}

        {isCategoryVisible('balances') && matchesSearch('Entalpía Reacción Kirchhoff Temperatura Cp', 'entalpia reaccion kirchhoff temperatura Cp dHrxn') && (
          <div className="col-lg-6 col-12">
            <div className="chemtools-card h-100">
              <div className="chemtools-card-header">
                <h4 className="chemtools-card-title">
                  <FontAwesomeIcon icon={faScaleBalanced} />
                  5. Entalpía de Reacción (Kirchhoff)
                </h4>
                <span className="subject-badge-tag badge-balances">Balances</span>
              </div>
              <div className="math-formula-container">
                <KatexMath math="\Delta H_{\text{rxn}}(T) = \Delta H^\circ_{\text{rxn}}(298\text{K}) + \Delta C_p \Delta T" block={true} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-4">
                  <label className="form-label small fw-bold">ΔH° 298 (kJ/mol):</label>
                  <input type="number" className="solver-input" value={kirchH298} onChange={(e) => setKirchH298(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">ΔC_p (J/(mol·K)):</label>
                  <input type="number" className="solver-input" value={kirchDcp} onChange={(e) => setKirchDcp(e.target.value)} />
                </div>
                <div className="col-4">
                  <label className="form-label small fw-bold">Temp. T (°C):</label>
                  <input type="number" className="solver-input" value={kirchT} onChange={(e) => setKirchT(e.target.value)} />
                </div>
              </div>
              {resKirchhoff.error ? (
                <div className="alert alert-danger">{resKirchhoff.error}</div>
              ) : (
                <div className="result-card">
                  <div className="text-white-50 small fw-bold">Entalpía a T = {kirchT} °C:</div>
                  <div className="result-card-value">{resKirchhoff.dH_T} <span className="fs-5 text-white">kJ/mol</span></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. SOLVERS ESPECIALIZADOS */}
        {(isCategoryVisible('especializados') || matchesSearch('Colebrook White Fricción Tubería', 'colebrook friction factor darcy fanning reynolds rugosidad')) && (
          <div className={activeSubject === 'all' ? 'col-lg-6 col-12' : 'col-12'}>
            <ColebrookSolver />
          </div>
        )}

        {(isCategoryVisible('especializados') || matchesSearch('Antoine Presión Vapor Temperatura Sustancias', 'antoine vapor pressure presion vapor agua etanol benceno acetona')) && (
          <div className={activeSubject === 'all' ? 'col-lg-6 col-12' : 'col-12'}>
            <AntoineSolver />
          </div>
        )}

        {(isCategoryVisible('especializados') || matchesSearch('Van der Waals Gases Reales Ecuación Estado', 'van der waals vdw gases reales estado compresibilidad co2 nitrógeno metano')) && (
          <div className={activeSubject === 'all' ? 'col-lg-6 col-12' : 'col-12'}>
            <VanderWaalsSolver />
          </div>
        )}

        {(isCategoryVisible('especializados') || matchesSearch('Adimensionales Reynolds Prandtl Nusselt Transport', 'adimensionales reynolds prandtl nusselt dittus boelter conveccion')) && (
          <div className={activeSubject === 'all' ? 'col-lg-6 col-12' : 'col-12'}>
            <DimensionlessSolver />
          </div>
        )}
      </div>
    </div>
  );
}
