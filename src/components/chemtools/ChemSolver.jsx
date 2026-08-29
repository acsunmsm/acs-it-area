'use client';

import React, { useState } from 'react';
import ColebrookSolver from './solvers/ColebrookSolver';
import AntoineSolver from './solvers/AntoineSolver';
import VanderWaalsSolver from './solvers/VanderWaalsSolver';
import DimensionlessSolver from './solvers/DimensionlessSolver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator, faFilter, faLayerGroup } from '@fortawesome/free-solid-svg-icons';

export default function ChemSolver() {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div className="animate-fade-in">
      {/* Solvers Filter Toolbar */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
        <div className="d-flex align-items-center gap-2">
          <FontAwesomeIcon icon={faFilter} className="text-primary" />
          <span className="fw-bold text-dark small">Filtrar Calculadoras:</span>
        </div>

        <div className="btn-group flex-wrap">
          <button
            className={`btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveFilter('all')}
          >
            Todas (4)
          </button>
          <button
            className={`btn btn-sm ${activeFilter === 'colebrook' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveFilter('colebrook')}
          >
            Colebrook-White
          </button>
          <button
            className={`btn btn-sm ${activeFilter === 'antoine' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveFilter('antoine')}
          >
            Antoine
          </button>
          <button
            className={`btn btn-sm ${activeFilter === 'vanderwaals' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveFilter('vanderwaals')}
          >
            Van der Waals
          </button>
          <button
            className={`btn btn-sm ${activeFilter === 'dimensionless' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveFilter('dimensionless')}
          >
            Adimensionales
          </button>
        </div>
      </div>

      {/* Grid of Solvers */}
      <div className="row g-4">
        {(activeFilter === 'all' || activeFilter === 'colebrook') && (
          <div className={activeFilter === 'all' ? 'col-lg-6 col-12' : 'col-12'}>
            <ColebrookSolver />
          </div>
        )}

        {(activeFilter === 'all' || activeFilter === 'antoine') && (
          <div className={activeFilter === 'all' ? 'col-lg-6 col-12' : 'col-12'}>
            <AntoineSolver />
          </div>
        )}

        {(activeFilter === 'all' || activeFilter === 'vanderwaals') && (
          <div className={activeFilter === 'all' ? 'col-lg-6 col-12' : 'col-12'}>
            <VanderWaalsSolver />
          </div>
        )}

        {(activeFilter === 'all' || activeFilter === 'dimensionless') && (
          <div className={activeFilter === 'all' ? 'col-lg-6 col-12' : 'col-12'}>
            <DimensionlessSolver />
          </div>
        )}
      </div>
    </div>
  );
}
