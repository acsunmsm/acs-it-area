import CapaAcido from './CapaAcido';


export default function BotonAcido({
  children,
  color = 'amarillo',      // 'amarillo' | 'azul' | (o el del tema)
  tamano = 'normal',       // 'normal' | 'pequeno'
  as: Etiqueta = 'button',
  className = '',
  ...resto
}) {
  const esPequeno = tamano === 'pequeno';

  const clases = [
    'btn-acido',
    `btn-acido--${color}`,
    esPequeno ? 'btn-acido--pequeno' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Etiqueta className={clases} {...resto}>
      <CapaAcido corta={esPequeno} />
      <span className="btn-acido__texto">{children}</span>
    </Etiqueta>
  );
}


