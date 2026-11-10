'use client';

import { removePublicationCover } from '@/src/lib/updatePublication';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import styles from './news.module.css';
import { useTranslations, useLocale } from 'next-intl';
import useAuth from '@/src/hooks/useAuth';
import { supabase } from '@/src/lib/supabaseClient';
import NewsModal from '@/src/components/NewsModal';
import NoticiaForm from '@/src/components/NoticiaForm';

const DEFAULT_LOCAL_ARTICLES = [];

export default function NewsPage() {
  const t = useTranslations('news');
  const locale = useLocale();

  const { session } = useAuth();
  const isAuthenticated = !!session;

  const [articles, setArticles] = useState(DEFAULT_LOCAL_ARTICLES);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loadingArticles, setLoadingArticles] = useState(true);

  const categories = ['todos', 'logro', 'convocatoria', 'comunidad'];

  // Carga de noticias desde Supabase con fallback automático y seguro
  const fetchArticles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('noticias')
        .select('id,titulo,categoria,extracto,fecha,imagen_url')
        .order('fecha', { ascending: false });

      if (error) {
        console.warn('Supabase noticias no disponible o error al consultar:', error.message);
        setArticles([]);
      } else {
        const formatted = (data || []).map((item) => {
          let dateEs = item.fecha || '';
          let dateEn = item.fecha || '';
          if (item.fecha) {
            try {
              const parsedDate = new Date(`${item.fecha}T12:00:00`);
              dateEs = parsedDate.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });
              dateEn = parsedDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              });
            } catch (err) {
              console.warn('Error formateando fecha:', err);
            }
          }

          return {
            id: item.id,
            category: item.categoria || 'logro',
            image: item.imagen_url || '/assets/img/Fondo3.jpeg',
            date: {
              es: dateEs,
              en: dateEn,
            },
            title: {
              es: item.titulo,
              en: item.titulo,
            },
            excerpt: {
              es: item.extracto,
              en: item.extracto,
            },
            rawArticle: item,
          };
        });
        setArticles(formatted);
      }
    } catch (err) {
      console.warn('Excepción al consultar noticias:', err);
      setArticles([]);
    } finally {
      setLoadingArticles(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- State updates follow the Supabase response.
    fetchArticles();
  }, [fetchArticles]);

  // Filtrado de noticias según categoría y búsqueda
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
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
  }, [articles, selectedCategory, searchTerm, locale]);

  const handleCreateClick = () => {
    setSelectedArticle(null);
    setShowModal(true);
  };

  const handleEditClick = async (e, article) => {
    e.stopPropagation();
    const { data, error } = await supabase.from('noticias').select('*').eq('id', article.id).single();
    if (error) {
      alert(error.message);
      return;
    }
    setSelectedArticle(data);
    setShowModal(true);
  };

  const handleDeleteClick = async (e, article) => {
    e.stopPropagation();
    if (window.confirm(t('deleteConfirm') || '¿Estás seguro de eliminar esta noticia?')) {
      try {
        if (article.id) {
          const { data, error } = await supabase.from('noticias').delete()
            .eq('id', article.id).select('imagen_url').single();
          if (error) throw error;
          await removePublicationCover(data.imagen_url);
        }

        alert(t('deleteSuccess') || 'Noticia eliminada exitosamente.');
        setLoadingArticles(true);
        fetchArticles();
      } catch (err) {
        console.error('Error al eliminar noticia:', err);
        alert(err.message || 'Error al eliminar la noticia.');
      }
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <header className={styles.banner}>
          <div className={styles.masthead}>
            <h1>{t('title')}</h1>
            <p>{t('intro')}</p>
          </div>
        </header>

        <div className={styles.body}>
          <div className={styles.toolbar}>
            <div className={styles.filters} role="group" aria-label={t('filterLabel')}>
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'todos' ? t('allCategories') : t(`categorias.${cat}`)}
                </button>
              ))}
            </div>

            <form role="search" className={styles.search} onSubmit={e => e.preventDefault()}>
              <label className={styles.field}>
                <i className="fas fa-search" aria-hidden="true" />
                <input
                  type="search"
                  aria-label={t('searchPlaceholder')}
                  placeholder={t('searchHint')}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </label>
              <button type="submit" className={styles.outline}>{t('searchButton')}</button>
            </form>
          </div>

          {isAuthenticated && (
            <div className={styles.admin}>
              <button type="button" className={styles.outline} onClick={handleCreateClick}>
                {t('createButton')}
              </button>
            </div>
          )}

          <section aria-label={t('title')} aria-busy={loadingArticles} className={styles.feed}>
            {loadingArticles && <p className={styles.status} role="status">{t('loading')}</p>}
            {filteredArticles.map((article, index) => (
              <article key={article.id} className={styles.story}>
                <Link href={`/${locale}/news/${article.id}`} className={styles.storyLink}>
                  <div className={styles.picture}>
                    <img src={article.image} alt="" loading={index === 0 ? 'eager' : 'lazy'} />
                  </div>
                  <div className={styles.summary}>
                    <div className={styles.metadata}>
                      <span>{t(`categorias.${article.category}`)}</span>
                      {article.rawArticle.fecha && (
                        <time dateTime={article.rawArticle.fecha}>{article.date[locale] || article.date.es}</time>
                      )}
                    </div>
                    <h2>{article.title[locale] || article.title.es}</h2>
                    <p>{article.excerpt[locale] || article.excerpt.es}</p>
                    <span className={styles.read}>{t('leerMas')} <span aria-hidden="true">→</span></span>
                  </div>
                </Link>
                {isAuthenticated && (
                  <div className={styles.admin}>
                    <button className={styles.outline} onClick={e => handleEditClick(e, article)}>{t('editButton')}</button>
                    <button className={styles.outline} onClick={e => handleDeleteClick(e, article)}>{t('deleteButton')}</button>
                  </div>
                )}
              </article>
            ))}
            {!loadingArticles && filteredArticles.length === 0 && (
              <div className={styles.empty}>
                <h2>{t('noNewsTitle')}</h2>
                <p>{t('noNewsText')}</p>
                <button className={styles.outline} onClick={() => { setSearchTerm(''); setSelectedCategory('todos'); }}>
                  {t('clearFilters')}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />

      {/* Modal para Crear / Editar Noticia */}
      {showModal && (
        <NewsModal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedArticle(null);
          }}
          title={selectedArticle ? 'Editar Noticia' : 'Publicar Nueva Noticia'}
        >
          <NoticiaForm
            key={selectedArticle?.id || 'new'}
            article={selectedArticle}
            onSave={() => {
              setLoadingArticles(true);
              fetchArticles();
              setShowModal(false);
              setSelectedArticle(null);
            }}
            onCancel={() => {
              setShowModal(false);
              setSelectedArticle(null);
            }}
          />
        </NewsModal>
      )}
    </>
  );
}
