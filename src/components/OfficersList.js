'use client';

import Image from 'next/image';
import { useState } from 'react';

// Standard clean SVG vectors
function MailIcon({ className = '', size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function CopyIcon({ className = '', size = 13 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon({ className = '', size = 13 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

// Avatar con fallback a iniciales si la foto no existe o falla al cargar
function OfficerAvatar({ member }) {
  const [imgError, setImgError] = useState(false);

  const getInitials = (fullName = '') => {
    return fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');
  };

  if (member.image && !imgError) {
    return (
      <Image
        src={`/assets/img/${member.image}`}
        alt={member.name}
        width={144}
        height={172}
        loading="lazy"
        className="officer-portrait"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="officer-portrait officer-avatar-fallback" aria-hidden="true">
      <span className="officer-avatar-initials">{getInitials(member.name)}</span>
    </div>
  );
}

// Unified Officer Card
function OfficerCard({ member, i18n = {} }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    if (member.email && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(member.email);
      } catch {
        setCopied(false);
        return;
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <article className="officer-profile">
      <OfficerAvatar member={member} />
      <div className="officer-details">
        <div className="officer-meta-row">
          {member.role && (
            <span className="officer-role">{member.role}</span>
          )}
        </div>
        <h3>{member.name}</h3>

        {member.email && (
          <div className="officer-email-row">
            <a
              href={`mailto:${member.email}`}
              className="officer-grid-email"
              title={`Enviar correo a ${member.email}`}
            >
              <MailIcon size={14} className="officer-mail-icon" />
              <span className="officer-email-text">{member.email}</span>
            </a>

            <button
              type="button"
              onClick={handleCopy}
              className={`officer-copy-btn ${copied ? 'copied' : ''}`}
              title={copied ? (i18n.copied || '¡Copiado!') : (i18n.copyEmail || 'Copiar correo')}
              aria-label={copied ? (i18n.copied || '¡Copiado!') : (i18n.copyEmail || 'Copiar correo')}
            >
              {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default function OfficersList({
  periods = [],
  areas = [],
  officers = [],
  title,
  i18n = {},
}) {
  const [activePeriodYear, setActivePeriodYear] = useState('2026');
  const [activeTab, setActiveTab] = useState('all');

  // Si se reciben periodos, seleccionar el activo
  const hasPeriods = periods && periods.length > 0;
  const activePeriod = hasPeriods
    ? periods.find((p) => p.year === activePeriodYear) || periods[0]
    : null;

  // Determinar áreas activas (por periodo o fallback a áreas directas)
  let effectiveAreas = activePeriod ? activePeriod.areas : areas;

  // Fallback para array plano de oficiales si no hay áreas estructuradas
  if (!effectiveAreas || effectiveAreas.length === 0) {
    if (officers && officers.length > 0) {
      const normalized = officers.map((item, idx) => {
        if (Array.isArray(item)) {
          const [role, name, email, image] = item;
          return { role, name, email, image, idx };
        }
        return { ...item, idx };
      });

      effectiveAreas = [
        {
          id: 'advisor',
          title: i18n?.areas?.advisor || 'Asesor de Facultad',
          type: 'advisor',
          columns: 1,
          members: [normalized[0]],
        },
        {
          id: 'presidency',
          title: i18n?.areas?.presidency || 'Presidencia y Vicepresidencia',
          type: 'board',
          columns: 3,
          members: normalized.slice(1, 4),
        },
        {
          id: 'executive',
          title: i18n?.areas?.executive || 'Secretaría y Tesorería',
          type: 'board',
          columns: 2,
          members: normalized.slice(4, 6),
        },
        {
          id: 'coordinations',
          title: i18n?.areas?.coordinations || 'Coordinaciones',
          type: 'coordination',
          columns: 2,
          members: normalized.slice(6),
        },
      ];
    }
  }

  // Generar pestañas de filtro dinámicamente según las áreas disponibles en la gestión
  const areaTabs = [
    { key: 'all', label: i18n?.filters?.all || 'Todos' },
    ...(effectiveAreas.some((a) => a.id === 'advisor')
      ? [{ key: 'advisor', label: i18n?.filters?.advisor || i18n?.areas?.advisor || 'Asesoría' }]
      : []),
    ...(effectiveAreas.some((a) => a.id === 'presidency')
      ? [{ key: 'presidency', label: i18n?.filters?.presidency || 'Presidencia' }]
      : []),
    ...(effectiveAreas.some((a) => a.id === 'executive')
      ? [
        {
          key: 'executive',
          label:
            activePeriod?.isFounder
              ? i18n?.areas?.secretary || 'Secretaría'
              : i18n?.filters?.executive || 'Secretaría y Tesorería',
        },
      ]
      : []),
    ...(effectiveAreas.some((a) => a.type === 'coordination')
      ? [{ key: 'coordinations', label: i18n?.filters?.coordinations || 'Coordinaciones' }]
      : []),
    ...(effectiveAreas.some((a) => a.type === 'founders' || a.id === 'founders')
      ? [{ key: 'founders', label: i18n?.periods?.foundersArea || 'Fundadores' }]
      : []),
  ];

  // Filtrar áreas según la pestaña seleccionada
  const filteredAreas = (effectiveAreas || []).filter((area) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'advisor') return area.id === 'advisor';
    if (activeTab === 'presidency') return area.id === 'presidency';
    if (activeTab === 'executive') return area.id === 'executive';
    if (activeTab === 'coordinations') return area.type === 'coordination';
    if (activeTab === 'founders') return area.type === 'founders' || area.id === 'founders';
    return true;
  });

  return (
    <section className="officers-section-wrap" aria-label={title || 'Directiva'}>
      {/* ─── Cronología / Selector de Periodos de Gestión ─── */}
      {hasPeriods && (
        <div className="officers-timeline-bar" role="region" aria-label={i18n.periods?.heading || 'Gestiones'}>
          <div className="officers-timeline-badge-label">
            <span>{i18n.periods?.heading || 'Gestiones'}</span>
          </div>

          <div className="officers-timeline-selector" role="tablist">
            {periods.map((period) => {
              const isSelected = activePeriodYear === period.year;
              return (
                <button
                  key={period.year}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`officer-period-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setActivePeriodYear(period.year);
                    setActiveTab('all');
                  }}
                >
                  <span className="officer-period-year">{period.label || period.year}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Pestañas de filtrado por área ─── */}
      <nav className="officers-navigation-bar" aria-label="Navegación por áreas directivas">
        <div className="officers-filter-tabs">
          {areaTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`officer-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              aria-pressed={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ─── Listado de Áreas y Oficiales ─── */}
      <div className="officers-areas-list">
        {filteredAreas.map((area) => (
          <section key={area.id} className="officer-area" id={`area-${area.id}`}>
            <h2>{area.title}</h2>
            <div className="officer-roster">
              {area.members.map((member) => (
                <OfficerCard key={member.name} member={member} i18n={i18n} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
