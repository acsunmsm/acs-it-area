'use client';

import Navbar from '@/src/components/Navbar';

export default function HorarioPage() {
  return (
    <>
      <Navbar />
      <main
        style={{
          width: '100%',
          height: 'calc(100vh - 76px)',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f8fafc'
        }}
      >
        <iframe
          src="/horario/index.html"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
          }}
          title="Generador de Horario ACS UNMSM"
        />
      </main>
    </>
  );
}
