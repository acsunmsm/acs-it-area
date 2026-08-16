import MaintenancePage from '@/src/components/MaintenancePage';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';

export default function ResourcesMaintenance() {
  return (
    <>
      <Navbar />
      <MaintenancePage 
        title="Repositorio de Recursos Próximamente" 
        description="Estamos construyendo nuestra biblioteca virtual. Pronto encontrarás aquí guías, artículos, plantillas y herramientas esenciales para potenciar tu desarrollo profesional y académico en el campo de la química."
      />
      <Footer />
    </>
  );
}
