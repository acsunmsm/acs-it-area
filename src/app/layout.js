// app/layout.js
import '@/src/assets/styles/globals.css'; // Importa tus estilos globales
import 'bootstrap/dist/css/bootstrap.min.css'; // Solo los estilos de Bootstrap desde NPM
import '@fortawesome/fontawesome-svg-core/styles.css'; // Necesario para FontAwesome
import { config } from '@fortawesome/fontawesome-svg-core';
import { Inter } from 'next/font/google';


config.autoAddCss = false; // Evita doble carga de FontAwesome
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ACS UNMSM',
  description: 'Capítulo estudiantil de la American Chemical Society en la UNMSM',
};


export default function RootLayout({ children }) {
    return(
    <html>
      <head>
        {/* Nada de Bootstrap vía CDN aquí */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link rel="icon" href="assets/img/icon.png" />
      </head>
      <body className={inter.className}>
          {children}
      </body>
    </html>
  );
}
