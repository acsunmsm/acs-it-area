'use client';

import Image from 'next/image';
import { useState } from 'react';

// Standard clean SVG vectors (no weird icons)
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

// Unified Officer Card - used for Advisor and all directiva members
function OfficerCard({ member, isSpacious = false, isPresidency = false, i18n = {} }) {
  const [copied, setCopied] = useState(false);
  const imagePath = `/assets/img/${member.image}`;

  const handleCopy = (e) => {
    e.preventDefault();
    if (member.email && navigator.clipboard) {
      navigator.clipboard.writeText(member.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <article
      className={`officer-grid-card ${isSpacious ? 'officer-card-spacious' : ''} ${isPresidency ? 'officer-card-presidency' : ''
        }`}
    >
      <div className="officer-card-main">
        <div
          className={`officer-grid-photo-wrap ${isSpacious ? 'photo-spacious' : ''} ${isPresidency ? 'photo-presidency' : ''
            }`}
        >
          <Image
            src={imagePath}
            alt={`Foto de ${member.name}`}
            width={isSpacious ? 108 : 98}
            height={isSpacious ? 108 : 98}
            loading="lazy"
            className="officer-grid-photo"
          />
        </div>

        <div className="officer-grid-info">
          <span className="officer-grid-role">{member.role}</span>
          <h3
            className={`officer-grid-name ${isSpacious ? 'name-spacious' : ''} ${isPresidency ? 'name-presidency' : ''
              }`}
          >
            {member.name}
          </h3>

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
        </div>
      </div>
    </article>
  );
}

export default function OfficersList({ areas = [], officers = [], title, i18n = {} }) {
  const [activeTab, setActiveTab] = useState('all');

  // Fallback: If only officers array is provided, adapt it to areas
  let effectiveAreas = areas;
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
          id: 'marketing',
          title: i18n?.areas?.marketing || 'Coordinación de Marketing',
          type: 'coordination',
          columns: 2,
          members: normalized.slice(6, 8),
        },
        {
          id: 'events',
          title: i18n?.areas?.events || 'Coordinación de Eventos y Proyectos',
          type: 'coordination',
          columns: 2,
          members: normalized.slice(8, 10),
        },
        {
          id: 'humanResources',
          title: i18n?.areas?.humanResources || 'Coordinación de Talento Humano',
          type: 'coordination',
          columns: 2,
          members: normalized.slice(10, 12),
        },
        {
          id: 'liaison',
          title: i18n?.areas?.liaison || 'Coordinación de Vinculación',
          type: 'coordination',
          columns: 2,
          members: normalized.slice(12, 14),
        },
        {
          id: 'technology',
          title: i18n?.areas?.technology || 'Coordinación de Tecnologías de la Información',
          type: 'coordination',
          columns: 2,
          members: normalized.slice(14, 16),
        },
        {
          id: 'k12',
          title: i18n?.areas?.k12 || 'Coordinación de Divulgación Científica K-12',
          type: 'coordination',
          columns: 2,
          members: normalized.slice(16, 18),
        },
      ];
    }
  }

  // Filter areas based on active tab
  const filteredAreas = effectiveAreas.filter((area) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'advisor') return area.id === 'advisor';
    if (activeTab === 'presidency') return area.id === 'presidency';
    if (activeTab === 'executive') return area.id === 'executive';
    if (activeTab === 'coordinations') return area.type === 'coordination';
    return true;
  });

  const tabs = [
    { key: 'all', label: i18n?.filters?.all || 'Todos' },
    { key: 'advisor', label: i18n?.filters?.advisor || i18n?.areas?.advisor || 'Asesoría' },
    { key: 'presidency', label: i18n?.filters?.presidency || 'Presidencia' },
    { key: 'executive', label: i18n?.filters?.executive || 'Secretaría y Tesorería' },
    { key: 'coordinations', label: i18n?.filters?.coordinations || 'Coordinaciones' },
  ];

  return (
    <section className="officers-section-wrap" aria-label={title || 'Directiva'}>
      {/* Quick Navigation Tabs */}
      <nav className="officers-navigation-bar" aria-label="Navegación por áreas directivas">
        <div className="officers-filter-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`officer-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Render Each Area Section */}
      <div className="officers-areas-list">
        {filteredAreas.map((area) => {
          const isAdvisorArea = area.type === 'advisor' || area.id === 'advisor';
          const isPresidencyArea = area.id === 'presidency';
          const isTwoColumns = area.columns === 2;
          const isThreeColumns = area.columns === 3;

          return (
            <section key={area.id} className="officer-area-block" id={`area-${area.id}`}>
              {/* Area Header */}
              <header className="officer-area-header">
                <div className="officer-area-title-group">
                  <span className="officer-area-indicator" aria-hidden="true"></span>
                  <h2 className="officer-area-title">{area.title}</h2>
                </div>
              </header>

              {/* Members Content */}
              {isAdvisorArea ? (
                <div className="officer-advisor-single-wrapper">
                  <OfficerCard
                    member={area.members[0]}
                    isSpacious={true}
                    i18n={i18n}
                  />
                </div>
              ) : isPresidencyArea ? (
                <div className="officer-presidency-wrapper">
                  {/* Presidentes arriba (2 columnas con fichas amplias) */}
                  <div className="officers-grid officers-grid-2col officer-presidents-grid">
                    {area.members.slice(0, 2).map((member, mIdx) => (
                      <OfficerCard
                        key={mIdx}
                        member={member}
                        isSpacious={true}
                        i18n={i18n}
                      />
                    ))}
                  </div>

                  {/* Vicepresidencia abajo (centrada y con el mismo tamaño y estilo idéntico al Asesor) */}
                  {area.members.length > 2 && (
                    <div className="officer-advisor-single-wrapper officer-vice-wrapper">
                      <OfficerCard
                        member={area.members[2]}
                        isSpacious={true}
                        i18n={i18n}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={`officers-grid ${isTwoColumns ? 'officers-grid-2col' : isThreeColumns ? 'officers-grid-3col' : ''
                    }`}
                >
                  {area.members.map((member, mIdx) => (
                    <OfficerCard
                      key={mIdx}
                      member={member}
                      isSpacious={isTwoColumns}
                      isPresidency={isThreeColumns}
                      i18n={i18n}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}