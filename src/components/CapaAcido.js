
const GOTAS = [
  { left: '18%', tipo: 'cuelgue', tam: 15, retardo: '0ms' },
  { left: '34%', tipo: 'cae', tam: 11, retardo: '520ms' },
  { left: '50%', tipo: 'cuelgue', tam: 18, retardo: '900ms' },
  { left: '68%', tipo: 'cae', tam: 13, retardo: '260ms' },
  { left: '83%', tipo: 'cuelgue', tam: 12, retardo: '1400ms' },
];

export default function CapaAcido({
  // 'corta' reduce el tamaño de las gotas y acorta su caída. Se usa
  // donde hay poco sitio por debajo: botones de tarjeta y menú.
  corta = false,
  className = '',
}) {
  const escala = corta ? 0.66 : 1;

  return (
    <span
      className={`capa-acido ${corta ? 'capa-acido--corta' : ''} ${className}`.trim()}
      aria-hidden="true"
    >
      {GOTAS.map((g, i) => {
        const tam = Math.round(g.tam * escala);
        return (
          <span
            key={i}
            className={`gota gota-${g.tipo}`}
            style={{
              left: g.left,
              width: `${tam}px`,
              height: `${tam}px`,
              animationDelay: g.retardo,
            }}
          />
        );
      })}
    </span>
  );
}

