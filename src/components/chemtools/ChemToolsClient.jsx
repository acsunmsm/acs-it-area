'use client';

import React, { useState } from 'react';
import UnitConverter from './UnitConverter';
import ChemSolver from './ChemSolver';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRightArrowLeft,
  faCalculator,
  faFlask,
  faAtom,
  faGraduationCap,
  faVial
} from '@fortawesome/free-solid-svg-icons';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function ChemToolsClient({ lang }) {
  const currentLocale = useLocale() || lang || 'es';
  const [activeTab, setActiveTab] = useState('converter'); // 'converter' or 'solver'

  return (
    <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero Banner Header */}
      <section className="chemtools-hero">
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
            <Link
              href={`/${currentLocale}/resources`}
              className="btn btn-sm btn-outline-light d-inline-flex align-items-center gap-2"
              style={{ borderRadius: '6px', fontWeight: 500 }}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>{currentLocale === 'en' ? 'Back to Resources' : 'Volver a Recursos'}</span>
            </Link>

            <div className="d-inline-flex align-items-center gap-2 chemtools-badge">
              <FontAwesomeIcon icon={faAtom} className="spin-slow" />
              <span>ACS Student Chapter UNMSM</span>
            </div>
          </div>

          <div className="text-center">
            <h1 className="display-4 fw-bold mb-3 text-white">
              Chem<span style={{ color: '#ffd400' }}>Tools</span>
            </h1>

            <p className="lead mx-auto mb-4" style={{ maxWidth: '720px', color: '#e2e8f0', fontSize: '1.15rem' }}>
              Plataforma interactiva de herramientas computacionales para la <strong>Ingeniería Química</strong>. Conversor multimagnitud y resolución numérica instantánea de ecuaciones de transporte, termodinámica y gases reales.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Tabs Bar */}
      <div className="container">
        <div className="chemtools-nav-tabs">
          <button
            className={`chemtools-tab-btn ${activeTab === 'converter' ? 'active' : ''}`}
            onClick={() => setActiveTab('converter')}
          >
            <FontAwesomeIcon icon={faArrowRightArrowLeft} className="tab-icon" />
            <span>1. Conversor de Unidades</span>
          </button>

          <button
            className={`chemtools-tab-btn ${activeTab === 'solver' ? 'active' : ''}`}
            onClick={() => setActiveTab('solver')}
          >
            <FontAwesomeIcon icon={faCalculator} className="tab-icon" />
            <span>2. ChemSolver</span>
          </button>
        </div>

        {/* Tab Content Section */}
        <div className="pb-5">
          {activeTab === 'converter' ? (
            <UnitConverter />
          ) : (
            <ChemSolver />
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
