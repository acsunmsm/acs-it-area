import MaintenancePage from '@/src/components/MaintenancePage';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';

export default function NewsMaintenance() {
  return (
    <>
      <Navbar />
      <MaintenancePage 
        title="Sección de Noticias en Construcción" 
        description="Estamos preparando un espacio increíble donde publicaremos todas las novedades, boletines y logros del Capítulo Estudiantil ACS UNMSM. ¡Vuelve pronto para mantenerte informado!"
      />
      <Footer />
    </>
  );
}
