// pages/about.js
import Head from 'next/head';
import Navbar from '../../../src/components/Navbar';
import Footer from '../../../src/components/Footer';

export default function About() {
  return (
    <>
      <Head>
        <title>About Us</title>
        <link rel="icon" href="/assets/img/icon.png" />
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.12.1/css/all.css"
          crossOrigin="anonymous"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
      </Head>

      <Navbar />

      <section className="hero-section bg-light py-5" style={{ backgroundColor: '#0054a6' }}>
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-md-6 text-white">
              <h1 style={{ color: '#ffd400' }}>¿Quiénes somos?</h1>
              <p>
                Somos el Chapter Estudiantil de la American Chemical Society de la Universidad
                Nacional Mayor de San Marcos, dedicado a fomentar el interés por la química y la
                ciencia en la comunidad estudiantil.
              </p>
              <div>
                <h5 style={{ color: '#ffd400' }}>Misión</h5>
                <p>
                  Despertar el interés por la ciencia en los jóvenes, promoviendo la participación
                  en actividades científicas y académicas que enriquezcan su formación.
                </p>
              </div>
              <div>
                <h5 style={{ color: '#ffd400' }}>Visión</h5>
                <p>
                  Convertirnos en el principal referente estudiantil de divulgación científica y
                  desarrollo profesional en el ámbito de la química en el Perú.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: '#ffffff', height: '50px' }}></section>

      <Footer />
    </>
  );
}
