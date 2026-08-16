'use client';

export default function HeroCarousel() {
  const handleScroll = (e) => {
    e.preventDefault();
    const section = document.querySelector('.hero-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-container">
      {/* Lado Izquierdo (3 figuras) */}
      <img src="/assets/img/000643421W.jpg" alt="Students" className="floating-element shape-left-1" />
      <img src="/assets/img/Fondo2.jpeg" alt="Campus" className="floating-element shape-left-2" />
      <div className="floating-element shape-left-3-color"></div>

      {/* Lado Derecho (3 figuras) */}
      <div className="floating-element shape-right-1-color"></div>
      <img src="/assets/img/about.jpg" alt="UNMSM" className="floating-element shape-right-2" />
      <img src="https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=500" alt="Industry" className="floating-element shape-right-3" />

      {/* Contenido Central */}
      <div className="content-wrapper">
        <h1 className="title">
          Química que transforma <span className="highlight">el Perú</span>
        </h1>
        <p className="subtitle">
          Somos el capítulo estudiantil de la American Chemical Society en la Universidad Nacional Mayor de San Marcos, Decana de América. Divulgamos, investigamos y formamos comunidad.
        </p>
        <button onClick={handleScroll} className="cta-button">
          Conócenos
        </button>
      </div>

      <style jsx>{`
        .hero-container {
          position: relative;
          width: 100%;
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: #412BFD;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect x='20' y='20' width='60' height='60' rx='10' transform='rotate(45 50 50)' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='2'/%3E%3C/svg%3E");
          background-size: 100px 100px;
          color: white;
          padding: 4rem 1rem;
        }
        
        .content-wrapper {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 800px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
        
        .title {
          font-size: 4rem;
          font-weight: 700;
          line-height: 1.2;
          margin: 0;
          color: #ffffff;
          text-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        
        .highlight {
          color: #6FEDEE;
        }

        .subtitle {
          font-size: 1.25rem;
          font-weight: 300;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
          max-width: 700px;
          margin: 0 auto;
        }
        
        .cta-button {
          background-color: #6FEDEE;
          color: #0b0736;
          font-weight: 600;
          font-size: 1.1rem;
          padding: 0.8rem 2.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(92, 229, 172, 0.4);
        }
        
        .cta-button:hover {
          background-color: #4cd49b;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(92, 229, 172, 0.6);
        }
        
        .floating-element {
          position: absolute;
          z-index: 5;
          transition: transform 0.5s ease;
        }
        
        .shape-left-1 {
          top: 15%;
          left: 5%;
          width: 180px;
          height: 180px;
          border-radius: 30px;
          object-fit: cover;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          animation: float 6s ease-in-out infinite;
        }
        
        .shape-left-2 {
          top: 45%;
          left: 12%;
          transform: translateY(-50%);
          width: 140px;
          height: 140px;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          animation: float 8s ease-in-out infinite reverse;
        }
        
        .shape-left-3-color {
          bottom: 15%;
          left: 8%;
          width: 120px;
          height: 120px;
          background-color: #6FEDEE;
          border-radius: 20px;
          transform: rotate(45deg);
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          animation: floatDiamond 7s ease-in-out infinite;
        }
        
        .shape-right-1-color {
          top: 15%;
          right: 10%;
          width: 100px;
          height: 100px;
          background-color: #FFD400;
          border-radius: 50%;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          animation: float 5s ease-in-out infinite;
        }
        
        .shape-right-2 {
          top: 35.5%;
          right: 5%;
          width: 200px;
          height: 200px;
          border-radius: 30px;
          object-fit: cover;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          animation: float 7s ease-in-out infinite reverse;
        }
        
        .shape-right-3 {
          bottom: 12%;
          right: 15%;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        
        @keyframes floatDiamond {
          0% { transform: translateY(0px) rotate(45deg); }
          50% { transform: translateY(-15px) rotate(48deg); }
          100% { transform: translateY(0px) rotate(45deg); }
        }
        
        @media (max-width: 1200px) {
          .floating-element {
            transform: scale(0.8) !important;
          }
        }
        
        @media (max-width: 992px) {
          .title { font-size: 2.8rem; }
          .shape-left-2, .shape-right-1-color, .shape-left-3-color, .shape-right-3 { display: none; }
          .shape-left-1 { top: 5%; left: 5%; opacity: 0.4; z-index: 1; }
          .shape-right-2 { bottom: 5%; top: auto; right: 5%; opacity: 0.4; z-index: 1; }
        }
        
        @media (max-width: 576px) {
          .title { font-size: 2.2rem; }
          .subtitle { font-size: 1rem; }
          .floating-element { display: none; }
        }
      `}</style>
    </section>
  );
}
