'use client';

import { useState, useMemo } from 'react';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import Reveal, { RevealWords } from '@/src/components/Reveal';
import { useTranslations, useLocale } from 'next-intl';

const NEWS_ARTICLES = [
  {
    id: 'prueba-1',
    category: 'logro',
    image: '/assets/img/Fondo3.jpeg',
    date: {
      es: '2 de Setiembre de 2026',
      en: 'September 2, 2026'
    },
    title: {
      es: 'Noticia de prueba noticia de prueba',
      en: 'Noticia de prueba noticia de prueba'
    },
    excerpt: {
      es: 'Noticia de prueba noticia de prueba Noticia de prueba noticia de prueba',
      en: 'Noticia de prueba noticia de prueba Noticia de prueba noticia de prueba'
    }
  }
];

export default function NewsPage() {
  const t = useTranslations('news');
  const locale = useLocale();

  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['todos', 'logro', 'convocatoria', 'comunidad'];

  // Filtrado de noticias según categoría y búsqueda
  const filteredArticles = useMemo(() => {
    return NEWS_ARTICLES.filter((article) => {
      const matchCategory =
        selectedCategory === 'todos' || article.category === selectedCategory;

      const titleText = (article.title[locale] || article.title.es || '').toLowerCase();
      const excerptText = (article.excerpt[locale] || article.excerpt.es || '').toLowerCase();
      const searchNormalized = searchTerm.toLowerCase().trim();

      const matchSearch =
        !searchNormalized ||
        titleText.includes(searchNormalized) ||
        excerptText.includes(searchNormalized);

      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchTerm, locale]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="news-page-container">
      <Navbar />

      {/* Hero Institucional con Marca de Agua y Gradiente */}
      <section
        className="hero-section text-white d-flex align-items-center news-hero-section"
        style={{
          minHeight: '36vh',
          marginTop: '-76px',
          paddingTop: '146px',
          paddingBottom: '60px',
          background: 'linear-gradient(135deg, #3624D1 0%, #1E127E 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow cian de la marca */}
        <div
          style={{
            position: 'absolute',
            top: '-25%',
            right: '-5%',
            width: '520px',
            height: '520px',
            background: 'radial-gradient(circle, rgba(111,237,238,0.18) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        ></div>

        {/* Glow amarillo/oro secundario */}
        <div
          style={{
            position: 'absolute',
            bottom: '-35%',
            left: '-10%',
            width: '420px',
            height: '420px',
            background: 'radial-gradient(circle, rgba(255,212,0,0.08) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        ></div>

        {/* Marcas de agua institucionales: Periódico y Matraz */}
        <i
          className="fa fa-newspaper-o news-hero-watermark"
          style={{
            position: 'absolute',
            right: '8%',
            top: '58%',
            transform: 'translateY(-50%) rotate(-10deg)',
            fontSize: '240px',
            color: 'rgba(255, 255, 255, 0.08)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        ></i>
        <div className="container position-relative z-1 text-md-start text-center">
          <div className="mb-2">
            <span
              style={{
                display: 'inline-block',
                width: '60px',
                height: '5px',
                backgroundColor: '#6FEDEE',
                borderRadius: '3px',
                marginBottom: '1rem',
              }}
            ></span>
          </div>
          <RevealWords
            as="h1"
            text={t('title')}
            className="fw-bold mb-3 news-hero-title"
            style={{ color: '#ffffff', letterSpacing: '-1px' }}
          />
          <p
            style={{
              color: 'rgba(226, 223, 223, 0.9)',
              fontSize: '1.15rem',
              maxWidth: '650px',
              margin: '0 auto 0 0',
              lineHeight: 1.6,
            }}
            className="mx-auto mx-md-0"
          >
            {t('intro')}
          </p>
        </div>
      </section>

      {/* Barra de Búsqueda Flotante */}
      <div className="news-search-container">
        <form onSubmit={handleSearchSubmit} className="news-search-form">
          <i className="fas fa-search news-search-icon"></i>
          <input
            type="text"
            className="news-search-input"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="news-search-clear-btn"
              title="Borrar búsqueda"
            >
              <i className="fas fa-times-circle"></i>
            </button>
          )}
          <button type="submit" className="news-search-btn">
            {t('searchButton')}
          </button>
        </form>
      </div>

      <main className="container" style={{ flexGrow: 1 }}>
        {/* Pills de Filtrado por Categoría */}
        <div className="news-category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`news-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
            >
              {cat === 'todos' ? (
                <>
                  <i className="fas fa-th-large"></i> {t('allCategories')}
                </>
              ) : (
                <>
                  <i
                    className={`fas ${cat === 'logro'
                      ? 'fa-trophy'
                      : cat === 'convocatoria'
                        ? 'fa-bullhorn'
                        : 'fa-users'
                      }`}
                  ></i>
                  {t(`categorias.${cat}`)}
                </>
              )}
            </button>
          ))}
        </div>

        {/* Feed de Noticias Horizontal (Estilo Portal UNMSM) */}
        {filteredArticles.length > 0 && (
          <div className="news-feed-list">
            {filteredArticles.map((article, index) => {
              const title = article.title[locale] || article.title.es;
              const excerpt = article.excerpt[locale] || article.excerpt.es;
              const date = article.date[locale] || article.date.es;

              return (
                <Reveal key={article.id} delay={index % 3}>
                  <article className="news-row-card">
                    <div className="news-row-image-box">
                      <img src={article.image} alt={title} className="news-row-image" />
                    </div>
                    <div className="news-row-content">
                      <div>
                        <div className="news-row-header">
                          <span className={`news-row-badge news-row-badge-${article.category}`}>
                            {t(`categorias.${article.category}`)}
                          </span>
                          <span className="news-row-date">{date}</span>
                        </div>
                        <h2 className="news-row-title">{title}</h2>
                        <p className="news-row-excerpt">{excerpt}</p>
                      </div>
                      <div className="news-row-footer">
                        <span className="news-row-vermas">
                          {t('leerMas')} <i className="fas fa-chevron-right ms-1"></i>
                        </span>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}

        {/* Estado Vacío si no hay resultados */}
        {filteredArticles.length === 0 && (
          <div className="news-empty-container">
            <i className="fas fa-newspaper news-empty-icon"></i>
            <h3 className="fw-bold mb-2 text-dark">{t('noNewsTitle')}</h3>
            <p className="text-muted mb-4">{t('noNewsText')}</p>
            <button
              onClick={() => {
                setSelectedCategory('todos');
                setSearchTerm('');
              }}
              className="news-search-btn mx-auto"
            >
              <i className="fas fa-undo me-2"></i> {t('clearFilters')}
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
