// app/layout.js
import '@/src/assets/styles/globals.css'; // Importa tus estilos globales
import 'bootstrap/dist/css/bootstrap.min.css'; // Solo los estilos de Bootstrap desde NPM
import '@fortawesome/fontawesome-svg-core/styles.css'; // Necesario para FontAwesome
/*
  La identidad química se importa LA ÚLTIMA, a propósito.

  En CSS, cuando dos reglas tienen la misma "fuerza" (especificidad),
  gana la que se cargó más tarde. Yendo al final, los estilos químicos
  pueden corregir lo que hereden de globals.css o de Bootstrap sin
  recurrir a !important — que es el equivalente a dar un portazo:
  funciona, pero después nadie puede sobrescribirlo.

  Para desactivar toda la identidad química, comenta esta única línea.
*/
import '@/src/assets/styles/quimica.css';
/*
  Y los temas por sección al final del todo: son los que ajustan el
  color de los componentes compartidos según la sección donde estén
  (Eventos = reacción, Recursos = biblioteca...). Por eso tienen que
  poder sobrescribir a quimica.css.
*/
import '@/src/assets/styles/temas.css';
/* Los bloques del menú: cada uno con el efecto de su sección. */
import '@/src/assets/styles/menu.css';
/* La portada, con el lenguaje visual del ACS de los 150 años. */
import { config } from '@fortawesome/fontawesome-svg-core';
import { Inter } from 'next/font/google';


config.autoAddCss = false; // Evita doble carga de FontAwesome
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ACS UNMSM',
  description: 'Capítulo estudiantil de la American Chemical Society en la UNMSM',
};


export default function RootLayout({ children }) {
  return (
    /*
      suppressHydrationWarning en <html> y <body>: qué es y por qué está aquí.

      "Hidratación" es el momento en que React coge el HTML que llegó del
      servidor y le engancha encima la parte interactiva. Para hacerlo,
      compara lo que hay en pantalla con lo que él esperaba. Si no coinciden,
      avisa con un error.

      El problema: hay extensiones del navegador que meten atributos suyos en
      el <body> ANTES de que React llegue a mirarlo (por ejemplo bis_register
      y __processed_<uuid>__). El servidor nunca envió esos atributos, así que
      React ve una diferencia y lanza un error de hidratación. No es un fallo
      nuestro y no rompe nada: sólo aparece en `next dev`, y en producción no
      se ve. Pero ensucia la consola y hace perder tiempo buscando un fallo
      que no existe.

      suppressHydrationWarning le dice a React: "en ESTA etiqueta concreta, no
      me avises de diferencias". Es la solución que recomienda la propia
      documentación de Next.js para este caso.

      ⚠️ Importante: sólo afecta a los atributos y al texto de la etiqueta
      donde se pone, NO a lo que hay dentro. O sea que si algún día tenemos un
      error de hidratación de verdad en un componente, seguirá saliendo. No
      estamos tapando fallos propios, sólo el ruido de las extensiones.
    */
    <html suppressHydrationWarning>
      <head>
        {/* Nada de Bootstrap vía CDN aquí */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link rel="icon" href="assets/img/icon3.png" />
        {/*
          Marca el <html> con la clase "js-reveal" ANTES de que el navegador
          pinte la página. Sin esto el contenido aparecería un instante y
          luego se escondería para animarse: un parpadeo feo.

          Nota sobre dangerouslySetInnerHTML: aquí es seguro. El texto es
          una constante escrita por nosotros, no viene de la base de datos
          ni de ningún usuario. El caso peligroso es el de las descripciones
          de eventos (ver NOTAS.md §3.2), que sí es contenido externo.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('js-reveal')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {/*
            FILTRO "GOO" — el que hace que el botón parezca derretirse.

            Un filtro SVG hay que declararlo una sola vez en el documento;
            después cualquier CSS lo usa con filter: url('#acido-goo').
            Por eso vive aquí, en el layout raíz: se declara una vez y
            sirve para todas las páginas.

            Qué hace, paso a paso:
              1. feGaussianBlur  → desenfoca las formas.
              2. feColorMatrix   → coge el canal de transparencia (alfa)
                 y le sube el contraste a lo bestia (ese 19 y ese -9).
                 El desenfoque suave se convierte de golpe en un borde
                 nítido otra vez... pero las formas que estaban cerca ya
                 se habían mezclado, así que salen FUNDIDAS en una sola,
                 con la unión curva y viscosa del líquido de verdad.
              3. feBlend         → devuelve encima el dibujo original
                 para que el interior quede bien sólido.

            El SVG mide 0x0 y está fuera de pantalla: no se ve ni ocupa
            sitio. aria-hidden para que los lectores de pantalla lo
            ignoren, porque no comunica nada.
          */}
        <svg
          aria-hidden="true"
          focusable="false"
          style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
        >
          <defs>
            <filter id="acido-goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="desenfoque" />
              <feColorMatrix
                in="desenfoque"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                result="goo"
              />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>

        {children}
      </body>
    </html>
  );
}
