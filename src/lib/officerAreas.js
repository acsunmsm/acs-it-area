export function getOfficerAreas(t) {
  // Traducciones de roles de la junta directiva
  const facultyAdvisor = t('roles.facultyAdvisor');
  const president = t('roles.president');
  const president2 = t('roles.president2');
  const vicePresident = t('roles.vicePresident');
  const treasurer = t('roles.treasurer');
  const secretary = t('roles.secretary');
  const marketingCoordinator = t('roles.marketingCoordinator');
  const marketingSubCoordinator = t('roles.marketingSubCoordinator');
  const eventsCoordinator = t('roles.eventsCoordinator');
  const eventsSubCoordinator = t('roles.eventsSubCoordinator');
  const humanResources = t('roles.humanResources');
  const humanResourcesSubCoordinator = t('roles.humanResourcesSubCoordinator');
  const internalLiaison = t('roles.internalLiaison');
  const externalLiaison = t('roles.externalLiaison');
  const cio = t('roles.cio');
  const dcio = t('roles.dcio');
  const k12Coordinator = t('roles.k12Coordinator');
  const k12SubCoordinator = t('roles.k12SubCoordinator');

  return [
    {
      id: 'advisor',
      title: t('areas.advisor'),
      type: 'advisor',
      columns: 1,
      members: [
        {
          role: facultyAdvisor,
          name: 'PhD Jose Orlando Calvay Castillo',
          email: 'advisor@acs-unmsm.org',
          image: 'josecalvay.png',
          isAdvisor: true,
          affiliation: t('advisorAffiliation')
        }
      ]
    },
    {
      id: 'presidency',
      title: t('areas.presidency'),
      type: 'board',
      columns: 3,
      members: [
        {
          role: president,
          name: 'Breiner Smith Fuentes Bulnes',
          email: 'president@acs-unmsm.org',
          image: 'breiner_fuentes.jpg',
        },
        {
          role: president2,
          name: 'Geraldine Campos Arias',
          email: 'president@acs-unmsm.org',
          image: 'geraldine_campos.jpg',
        },
        {
          role: vicePresident,
          name: 'Rosario Cinthya Yaya Paitan',
          email: 'vicepresident@acs-unmsm.org',
          image: 'rosario_yaya.jpg',
        }
      ]
    },
    {
      id: 'executive',
      title: t('areas.executive'),
      type: 'board',
      columns: 2,
      members: [
        {
          role: secretary,
          name: 'Jean Franco Toledo Rodriguez',
          email: 'secretary@acs-unmsm.org',
          image: 'jean_toledo.jpg',
        },
        {
          role: treasurer,
          name: 'Yaquelin Cristina Juana Rivera Antonio',
          email: 'treasurer@acs-unmsm.org',
          image: 'yaquelin_rivera.jpeg',
        }
      ]
    },
    {
      id: 'marketing',
      title: t('areas.marketing'),
      type: 'coordination',
      columns: 2,
      members: [
        {
          role: marketingCoordinator,
          name: 'Angelica Esther Naucapoma Chillcce',
          email: 'chief.marketing@acs-unmsm.org',
          image: 'angelica_naucapoma.jpg',
        },
        {
          role: marketingSubCoordinator,
          name: 'Cielo Brighitt Rodriguez Montes',
          email: 'marketing@acs-unmsm.org',
          image: 'cielo_rodriguez.jpeg',
        }
      ]
    },
    {
      id: 'events',
      title: t('areas.events'),
      type: 'coordination',
      columns: 2,
      members: [
        {
          role: eventsCoordinator,
          name: 'Antonio Alburqueque Ampuero',
          email: 'chief.project.manager@acs-unmsm.org',
          image: 'antonio_alburqueque.jpg',
        },
        {
          role: eventsSubCoordinator,
          name: 'Andres Sebastián Bailon Vento',
          email: 'project.manager@acs-unmsm.org',
          image: 'andres_bailon.jpg',
        }
      ]
    },
    {
      id: 'humanResources',
      title: t('areas.humanResources'),
      type: 'coordination',
      columns: 2,
      members: [
        {
          role: humanResources,
          name: 'Yoselin Estefany Alvarez Cueva',
          email: 'chief.human.resources@acs-unmsm.org',
          image: 'yoselin_alvarez.jpg',
        },
        {
          role: humanResourcesSubCoordinator,
          name: 'Geancarlos Genaro Cora Díaz',
          email: 'human.resources@acs-unmsm.org',
          image: 'geancarlos_cora.jpg',
        }
      ]
    },
    {
      id: 'liaison',
      title: t('areas.liaison'),
      type: 'coordination',
      columns: 2,
      members: [
        {
          role: externalLiaison,
          name: 'Javier Antony Sanchez Hilasaca',
          email: 'external.liaison@acs-unmsm.org',
          image: 'javier_sanchez.jpg',
        },
        {
          role: internalLiaison,
          name: 'Kessia Brigitte Cordova Tantalean',
          email: 'internal.liaison@acs-unmsm.org',
          image: 'kesia_cordova.jpg',
        }
      ]
    },
    {
      id: 'technology',
      title: t('areas.technology'),
      type: 'coordination',
      columns: 2,
      members: [
        {
          role: cio,
          name: 'Gonzalo Manuel Aguilar Espinoza',
          email: 'cio@acs-unmsm.org',
          image: 'gonzalo.jpg',
        },
        {
          role: dcio,
          name: 'Paolo Jesus Pichilingue La Torre',
          email: 'dcio@acs-unmsm.org',
          image: 'paolo.jpeg',
        }
      ]
    },
    {
      id: 'k12',
      title: t('areas.k12'),
      type: 'coordination',
      columns: 2,
      members: [
        {
          role: k12Coordinator,
          name: 'Jeremy Antonio Silva More',
          email: 'k12@acs-unmsm.org',
          image: 'jeremy_silva.jpg',
        },
        {
          role: k12SubCoordinator,
          name: 'Ricardo Javier Gomez Sangay',
          email: 'subk12@acs-unmsm.org',
          image: 'ricardo.jpeg',
        }
      ]
    }
  ];
}
