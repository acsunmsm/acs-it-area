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

export function getOfficerAreas2025(t) {
  const facultyAdvisor = t('roles.facultyAdvisor') || 'Advisor';
  const president2 = t('roles.president2') || 'Presidenta';
  const vicePresident = t('roles.vicePresident') || 'Vicepresidenta';
  const generalSecretary = t('roles.generalSecretary') || 'Secretaria General';
  const ceo = t('roles.ceo') || 'CEO';
  const treasurer = t('roles.treasurer2') || 'Tesorero';
  const internalLiaisonCoord = t('roles.internalLiaisonCoord') || 'Coord. de Vinculación Interna';
  const externalLiaisonCoord = t('roles.externalLiaisonCoord') || 'Coord. de Vinculación Externa';
  const marketingCoord = t('roles.marketingCoordinator') || 'Coord. de Marketing';
  const marketingSubCoord = t('roles.marketingSubCoordinator') || 'Subcoord. de Marketing';
  const eventsCoord = t('roles.eventsCoordinator') || 'Coordinador de Eventos';
  const eventsSubCoord = t('roles.eventsSubCoordinator') || 'Subcoord. de Eventos';
  const eventsSupport = t('roles.eventsSupport') || 'Miembro de apoyo de eventos';
  const hrCoordMale = t('roles.humanResourcesMale') || 'Coordinador de Talento Humano';
  const hrSubCoordFemale = t('roles.humanResourcesSubFemale') || 'Subcoordinadora de Talento Humano';
  const itCoord = t('roles.cio') || 'Coordinador de Tecnologías de la Información';
  const itSubCoord = t('roles.dcio') || 'Subcoordinador de Tecnologías de la Información';
  const k12CoordFemale = t('roles.k12CoordinatorFemale') || 'Coordinadora de K-12';

  return [
    {
      id: 'advisor',
      title: t('areas.advisor') || 'Asesor de Facultad',
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
      title: t('areas.presidency') || 'Presidencia y Vicepresidencia',
      type: 'board',
      columns: 2,
      members: [
        {
          role: president2,
          name: 'Frances Atena Malapi Segura',
          image: 'Atena_malapi.jpg',
        },
        {
          role: vicePresident,
          name: 'Valery Celit Figueroa Chachi',
        }
      ]
    },
    {
      id: 'executive',
      title: t('areas.executive') || 'Secretaría, Tesorería y CEO',
      type: 'board',
      columns: 3,
      members: [
        {
          role: generalSecretary,
          name: 'Geraldine Campos Arias',
          image: 'geraldine_campos.jpg',
        },
        {
          role: treasurer,
          name: 'Breiner Smith Fuentes Bulnes',
          image: 'breiner_fuentes.jpg',
        },
        {
          role: ceo,
          name: 'Jean Pierre Choquehuaman Manrique',
          image: 'Jean_choquehuaman.jpg',
        }
      ]
    },
    {
      id: 'liaison',
      title: t('areas.liaison') || 'Coordinación de Vinculación',
      type: 'coordination',
      columns: 2,
      members: [
        {
          role: internalLiaisonCoord,
          name: 'Javier Antony Sanchez Hilasaca',
          image: 'javier_sanchez.jpg',
        },
        {
          role: externalLiaisonCoord,
          name: 'Diana Rosa Soto Mezarino',
          image: 'Diana_soto.jpg',
        }
      ]
    },
    {
      id: 'marketing',
      title: t('areas.marketing') || 'Coordinación de Marketing',
      type: 'coordination',
      columns: 2,
      members: [
        {
          role: marketingCoord,
          name: 'Zulie Milene Yucra Luza',
          image: 'Zulie_yucra.jpg',
        },
        {
          role: marketingSubCoord,
          name: 'Dalma Cruzado Tintaya',
          image: 'Dalma_cruzado.jpg',
        }
      ]
    },
    {
      id: 'events',
      title: t('areas.events') || 'Coordinación de Eventos',
      type: 'coordination',
      columns: 3,
      members: [
        {
          role: eventsCoord,
          name: 'Jhefferson Andre Zagaceta Pinpincos',
          image: 'Jhefferson_zagaceta.jpg',
        },
        {
          role: eventsSubCoord,
          name: 'Victor Manuel Valqui Ramos',
          image: 'Victor_valqui.jpg',
        },
        {
          role: eventsSupport,
          name: 'Anghelo Fabrizio Morales Tapia',
          image: 'Anghelo_morales.jpg',
        }
      ]
    },
    {
      id: 'humanResources',
      title: t('areas.humanResources') || 'Coordinación de Talento Humano',
      type: 'coordination',
      columns: 2,
      members: [
        {
          role: hrCoordMale,
          name: 'Diego Ivan Suarez Rodriguez',
        },
        {
          role: hrSubCoordFemale,
          name: 'Yoselin Estefany Alvarez Cueva',
          image: 'yoselin_alvarez.jpg',
        }
      ]
    },
    {
      id: 'technology',
      title: t('areas.technology') || 'Coordinación de Tecnologías de la Información',
      type: 'coordination',
      columns: 2,
      members: [
        {
          role: itCoord,
          name: 'Jose Alessandro Quispe Cabello',
          image: '',
        },
        {
          role: itSubCoord,
          name: 'Eliseo Alejandro Huetagoyena Palomino',
        }
      ]
    },
    {
      id: 'k12',
      title: t('areas.k12') || 'Coordinación de Divulgación Científica K-12',
      type: 'coordination',
      columns: 1,
      members: [
        {
          role: k12CoordFemale,
          name: 'Katia Melissa Merino Huaman',
          image: 'Katia_merino.jpg',
        }
      ]
    }
  ];
}

export function getOfficerAreasFounders(t) {
  const facultyAdvisor = t('roles.facultyAdvisor') || 'Asesor de Facultad';
  const president = t('roles.president') || 'Presidente';
  const vicePresident = t('roles.vicePresident') || 'Vicepresidenta';
  const secretary = t('roles.secretary2') || 'Secretaria';
  const internalLiaisonCoord = t('roles.internalLiaisonCoord') || 'Coord. Vinculación Interna';
  const externalLiaisonCoord = t('roles.externalLiaisonCoord') || 'Coord. Vinculación Externa';
  const marketingCoordinator = t('roles.marketingCoordinator') || 'Coord. de Marketing';
  const marketingSubCoordinator = t('roles.marketingSubCoordinator') || 'Subcoord. de Marketing';
  const eventsCoordinator = t('roles.eventsCoordinator') || 'Coord. de Eventos';
  const humanResources = t('roles.humanResources') || 'Coord. de Talento Humano';
  const founderRole = t('roles.founder') || 'Miembro Fundador';

  return [
    {
      id: 'advisor',
      title: t('areas.advisor') || 'Asesor de Facultad',
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
      title: t('areas.presidency') || 'Presidencia y Vicepresidencia',
      type: 'board',
      columns: 2,
      members: [
        {
          role: president,
          name: 'Israel Emanuel Gonzales Cruz',
          image: 'Israel_gonzales.jpg',
          isFounder: true,
        },
        {
          role: vicePresident,
          name: 'Frances Atena Malapi Segura',
          image: 'Atena_malapi.jpg',
          isFounder: true,
        }
      ]
    },
    {
      id: 'executive',
      title: 'Secretaría',
      type: 'board',
      columns: 1,
      members: [
        {
          role: secretary,
          name: 'Geraldine Campos Arias',
          image: 'geraldine_campos.jpg',
          isFounder: true,
        }
      ]
    },
    {
      id: 'liaison',
      title: t('areas.liaison') || 'Coordinación de Vinculación',
      type: 'coordination',
      columns: 2,
      members: [
        {
          role: internalLiaisonCoord,
          name: 'Javier Antony Sanchez Hilasaca',
          image: 'javier_sanchez.jpg',
          isFounder: true,
        },
        {
          role: externalLiaisonCoord,
          name: 'Diana Rosa Soto Mezarino',
          image: 'Diana_soto.jpg',
          isFounder: true,
        }
      ]
    },
    {
      id: 'marketing',
      title: t('areas.marketing') || 'Coordinación de Marketing',
      type: 'coordination',
      columns: 2,
      members: [
        {
          role: marketingCoordinator,
          name: 'Zulie Milene',
          image: 'Zulie_yucra.jpg',
          isFounder: true,
        },
        {
          role: marketingSubCoordinator,
          name: 'Dalma Cruzado Tintaya',
          image: 'Dalma_cruzado.jpg',
          isFounder: true,
        }
      ]
    },
    {
      id: 'events',
      title: t('areas.events') || 'Coordinación de Eventos',
      type: 'coordination',
      columns: 1,
      members: [
        {
          role: eventsCoordinator,
          name: 'Jhefferson Andre Zagaceta Pinpincos',
          image: 'Jhefferson_zagaceta.jpg',
          isFounder: true,
        }
      ]
    },
    {
      id: 'humanResources',
      title: t('areas.humanResources') || 'Coordinación de Talento Humano',
      type: 'coordination',
      columns: 1,
      members: [
        {
          role: humanResources,
          name: 'Amira Briseida Jacinto Mauricio',
          image: 'Briseida_mauricio.jpg',
          isFounder: true,
        }
      ]
    },
    {
      id: 'founders',
      title: t('periods.foundersArea') || 'Miembros Fundadores',
      type: 'founders',
      columns: 2,
      members: [
        {
          role: founderRole,
          name: 'Anghelo Fabrizio Morales Tapia',
          image: 'Anghelo_morales.jpg',
          isFounder: true,
        },
        {
          role: founderRole,
          name: 'Daniel Anthony Molina Camones',
          isFounder: true,
        }
      ]
    }
  ];
}

export function getOfficerPeriods(t) {
  return [
    {
      year: '2026',
      label: t('periods.period2026') || 'Gestión 2026',
      badge: t('periods.period2026Badge') || 'Actual',
      isCurrent: true,
      areas: getOfficerAreas(t),
    },
    {
      year: '2025',
      label: t('periods.period2025') || 'Gestión 2025',
      areas: getOfficerAreas2025(t),
    },
    {
      year: 'fundadores',
      label: t('periods.foundersHeaderTitle') || 'Fundadores',
      isFounder: true,
      areas: getOfficerAreasFounders(t),
    }
  ];
}
