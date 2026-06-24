'use client'; // Indica que este componente se renderiza en el cliente (no en el servidor)

// Importamos hooks y funciones necesarias
import { use, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';

export default function HeroCarousel() {
  // Hook de traducción: permite usar textos desde los archivos de idioma
  const t = useTranslations('heroCarousel');
  useEffect(() => {
    // Verifica que el código corre en el navegador y que Bootstrap está cargado
    if (typeof window !== 'undefined' && window.bootstrap) {
      const el = document.getElementById('heroCarousel'); // Busca el elemento del carrusel
      if (el) {
        // Inicializa el carrusel de Bootstrap con configuración personalizada
        new window.bootstrap.Carousel(el, {
          interval: 5000, // 5s entre slides
          ride: 'carousel', // Hace que empiece automáticamente
          pause: false, // No se detiene al pasar el mouse
          wrap: true // Permite que vuelva al primer slide al llegar al último
        });
      }
    }
  }, []); // [] asegura que se ejecute solo una vez al montar el componente

  return (
    <section className="container" style={{ margin: 0, padding: 0, minWidth: '100%', marginTop: 0 }}>
      <div id="heroCarousel" className="carousel slide carousel-fade" data-bs-ride="carousel">
        <div className="carousel-inner">

          <div className="carousel-item">
            <img src="/assets/img/000643421W.jpg" className="d-block w-100 fade-img" alt="Slide 1" />
            <div className="carousel-caption d-flex flex-column justify-content-center align-items-center h-100">
              <h1 className="text-white text-center">{t('slide1')}</h1>
            </div>
          </div>

          <div className="carousel-item">
            <img
              src="https://images.pexels.com/photos/1366942/pexels-photo-1366942.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              className="d-block w-100 fade-img"
              alt="Slide 2"
            />
            <div className="carousel-caption d-flex flex-column justify-content-center align-items-center h-100">
              <h1 className="text-white text-center">{t('slide2')}</h1>
            </div>
          </div>

          <div className="carousel-item active">
            <img
              src="https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              className="d-block w-100 fade-img"
              alt="Slide 3"
            />
            <div className="carousel-caption d-flex flex-column justify-content-center align-items-center h-100">
              <h1 className="text-white text-center">{t('slide3')}</h1>
            </div>
          </div>

          <div className="carousel-item">
            <img
              src="https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              className="d-block w-100 fade-img"
              alt="Slide 4"
            />
            <div className="carousel-caption d-flex flex-column justify-content-center align-items-center h-100">
              <h1 className="text-white text-center">{t('slide4')}</h1>
            </div>
          </div>

        </div>

        <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Anterior</span>
        </button>

        <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Siguiente</span>
        </button>
      </div>

    <style jsx>{`
        .carousel-fade .carousel-item {
          transition: opacity 1s ease-in-out;
        }

        .fade-img {
          transition: transform 1.2s ease-in-out;
        }

        .carousel-item.active .fade-img {
          transform: scale(1.03);
        }

        .carousel-caption {
          backgroundColor: rgba(0, 0, 0, 0.4);
          padding: 1rem 2rem;
          borderRadius: 0.5rem;
          backdropFilter: blur(2px);
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          position: absolute;
          zIndex: 2;
          text-shadow: 2px 2px 8px rgba(0,0,0,0.8);
          font-size: 2rem;
        }

        .carousel-overlay {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent 70%);
          z-index: 1;
        }
          .carousel-item img {
          width: 100%;
          height: 90vh;         /* limita la altura al alto de la ventana */
          object-fit: cover;     /* asegura que la imagen se recorte sin deformarse */
        }

      `}</style>

    </section>
  );
}
