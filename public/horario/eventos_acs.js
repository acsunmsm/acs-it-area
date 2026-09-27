/* ============ EVENTOS ACS - CAPÍTULO ESTUDIANTIL ============ */
const CATEGORIAS_ACS = {
  visita: { nombre: "Visita Técnica", color: "#0284c7", bg: "#e0f2fe", icono: "🏭" },
  taller: { nombre: "Taller / Workshop", color: "#059669", bg: "#d1fae5", icono: "🧪" },
  ponencia: { nombre: "Ponencia / Webinar", color: "#7c3aed", bg: "#ede9fe", icono: "🎓" },
  convocatoria: { nombre: "Convocatoria / Asamblea", color: "#d97706", bg: "#fef3c7", icono: "📢" },
  feria: { nombre: "Feria / Divulgación", color: "#db2777", bg: "#fce7f3", icono: "🔬" }
};

// Catálogo base de actividades oficiales del Capítulo Estudiantil ACS
const EVENTOS_BASE_ACS = [
  {
    id: "acs-01",
    titulo: "Visita Técnica: Refinería La Pampilla (Repsol)",
    categoria: "visita",
    fecha: "2026-08-22",
    horaIni: "08:30",
    horaFin: "13:30",
    lugar: "Ventanilla, Callao (Bus desde la Facultad)",
    modalidad: "Presencial",
    cupos: 30,
    ponente: "Ing. Carlos Mendoza (Gerente de Procesos)",
    descripcion: "Recorrido técnico por las unidades de destilación atmosférica, craqueo catalítico y el laboratorio de control de calidad de combustibles e hidrocarburos.",
    requisitos: "EPP completo (casco, botas punta de acero, chaleco reflectante), carnet universitario vigente.",
    enlaceRegistro: "https://forms.gle/acs-visita-pampilla",
    estado: "Inscripciones abiertas"
  },
  {
    id: "acs-02",
    titulo: "Taller Práctico: ChemDraw Pro & Modelado Molecular 3D",
    categoria: "taller",
    fecha: "2026-08-25",
    horaIni: "15:00",
    horaFin: "18:00",
    lugar: "Laboratorio de Cómputo 3 / Virtual vía Zoom",
    modalidad: "Híbrido",
    cupos: 50,
    ponente: "Dra. Elena Vargas (Investigadora en Química Computacional)",
    descripcion: "Aprende a dibujar estructuras químicas complejas, mecanismos de reacción, cálculos estequiométricos y renderizado en 3D para publicaciones y reportes académicos.",
    requisitos: "Laptop con ChemDraw instalado (se compartirá guía de instalación con licencia estudiantil).",
    enlaceRegistro: "https://forms.gle/acs-taller-chemdraw",
    estado: "Inscripciones abiertas"
  },
  {
    id: "acs-03",
    titulo: "Conferencia: Química Verde y Procesos Sostenibles en la Industria",
    categoria: "ponencia",
    fecha: "2026-08-28",
    horaIni: "17:00",
    horaFin: "19:00",
    lugar: "Auditorio Principal de la Facultad de Química",
    modalidad: "Presencial",
    cupos: 120,
    ponente: "Dr. Roberto Silva (Consultor Internacional ACS)",
    descripcion: "Análisis de los 12 principios de la Química Verde aplicados a la síntesis orgánica, catálisis heterogénea y reducción de residuos peligrosos en procesos industriales.",
    requisitos: "Ingreso libre previa inscripción, certificación oficial ACS incluida.",
    enlaceRegistro: "https://forms.gle/acs-quimica-verde",
    estado: "Inscripciones abiertas"
  },
  {
    id: "acs-04",
    titulo: "Visita Técnica: Laboratorio Ambiental e Instrumental SGS Perú",
    categoria: "visita",
    fecha: "2026-09-04",
    horaIni: "09:00",
    horaFin: "12:30",
    lugar: "Sede Central SGS (Callao)",
    modalidad: "Presencial",
    cupos: 25,
    ponente: "Lic. Maritza Huamán (Supervisora de Espectrometría)",
    descripcion: "Demostración in situ de equipos de Espectrometría de Masas (ICP-MS), Cromatografía de Gases (GC-MS) y análisis fisicoquímico de suelos y efluentes mineros.",
    requisitos: "Haber cursado o estar cursando Análisis Instrumental o Química Analítica Cuantitativa.",
    enlaceRegistro: "https://forms.gle/acs-visita-sgs",
    estado: "Próximamente"
  },
  {
    id: "acs-05",
    titulo: "Workshop: Python Científico y Análisis de Datos para Químicos",
    categoria: "taller",
    fecha: "2026-09-09",
    horaIni: "16:00",
    horaFin: "19:00",
    lugar: "Modalidad Virtual (Teams)",
    modalidad: "Virtual",
    cupos: 80,
    ponente: "Mg. Daniel Ortega (Data Scientist & Químico)",
    descripcion: "Introducción al procesamiento de curvas de calibración, cinéticas químicas, ajuste no lineal con SciPy y visualización interactiva de datos de laboratorio con Matplotlib y Pandas.",
    requisitos: "Conocimientos básicos de computación. No se requiere experiencia previa en programación.",
    enlaceRegistro: "https://forms.gle/acs-python-quimica",
    estado: "Inscripciones abiertas"
  },
  {
    id: "acs-06",
    titulo: "Festival de la Química ACS: Experimentos y Divulgación Científica",
    categoria: "feria",
    fecha: "2026-09-12",
    horaIni: "10:00",
    horaFin: "16:00",
    lugar: "Explanada de la Facultad de Química",
    modalidad: "Presencial",
    cupos: 200,
    ponente: "Comité de Divulgación ACS Student Chapter",
    descripcion: "Feria interactiva abierta a escolares y universitarios con experimentos en vivo de luminiscencia, polímeros, reacciones oscilantes y stands de investigación de los semilleros.",
    requisitos: "Abierto a todo público y estudiantes de cualquier ciclo.",
    enlaceRegistro: "https://forms.gle/acs-festival-quimica",
    estado: "Confirmado"
  },
  {
    id: "acs-07",
    titulo: "Convocatoria Abierta: Nuevos Miembros ACS Student Chapter 2026",
    categoria: "convocatoria",
    fecha: "2026-09-18",
    horaIni: "18:00",
    horaFin: "20:00",
    lugar: "Aula Magna / Transmisión en Vivo",
    modalidad: "Híbrido",
    cupos: 150,
    ponente: "Junta Directiva ACS Student Chapter",
    descripcion: "Presentación de comités (Académico, Visitas Técnicas, Divulgación, Logística, Marketing) y proceso de postulación para ser miembro activo del capítulo estudiantil.",
    requisitos: "Ser estudiante regular de Química, Ingeniería Química o carreras afines.",
    enlaceRegistro: "https://forms.gle/acs-convocatoria-2026",
    estado: "Próximamente"
  },
  {
    id: "acs-08",
    titulo: "Seminario Internacional: Avances en Baterías de Litio e Hidrógeno Verde",
    categoria: "ponencia",
    fecha: "2026-09-24",
    horaIni: "17:30",
    horaFin: "19:30",
    lugar: "Virtual vía Zoom & Auditorio Virtual ACS",
    modalidad: "Virtual",
    cupos: 250,
    ponente: "Dr. Alejandro Gómez (MIT Postdoc / ACS Energy Letters)",
    descripcion: "Panorama actual de la transición energética, almacenamiento electroquímico, electrodos nanoestructurados y celdas de combustible a base de hidrógeno.",
    requisitos: "Registro gratuito para miembros y estudiantes universitarios.",
    enlaceRegistro: "https://forms.gle/acs-seminario-energia",
    estado: "Inscripciones abiertas"
  }
];

class GestorEventosACS {
  constructor() {
    this.claveAlmacenamiento = "acs_eventos_oficiales_custom";
    this.eventos = this.cargarEventos();
  }

  cargarEventos() {
    try {
      const guardados = localStorage.getItem(this.claveAlmacenamiento);
      if (guardados) {
        const parseados = JSON.parse(guardados);
        if (Array.isArray(parseados) && parseados.length > 0) {
          return parseados;
        }
      }
    } catch (e) {
      console.warn("No se pudieron cargar eventos personalizados de ACS, usando base.", e);
    }
    return [...EVENTOS_BASE_ACS];
  }

  guardarEventos() {
    try {
      localStorage.setItem(this.claveAlmacenamiento, JSON.stringify(this.eventos));
    } catch (e) {
      console.error("Error al guardar eventos ACS en localStorage:", e);
    }
  }

  obtenerTodos() {
    return [...this.eventos].sort((a, b) => (a.fecha + a.horaIni).localeCompare(b.fecha + b.horaIni));
  }

  obtenerPorId(id) {
    return this.eventos.find(e => e.id === id);
  }

  obtenerPorMes(anio, mes) {
    // mes: 1-12
    const mesStr = String(mes).padStart(2, "0");
    const prefijo = `${anio}-${mesStr}`;
    return this.obtenerTodos().filter(e => e.fecha.startsWith(prefijo));
  }

  obtenerPorDia(fechaStr) {
    // fechaStr: YYYY-MM-DD
    return this.obtenerTodos().filter(e => e.fecha === fechaStr);
  }

  filtrar({ categoria = "todas", busqueda = "", soloProximos = false } = {}) {
    const hoyStr = new Date().toISOString().slice(0, 10);
    return this.obtenerTodos().filter(ev => {
      if (categoria !== "todas" && ev.categoria !== categoria) return false;
      if (soloProximos && ev.fecha < hoyStr) return false;
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const texto = `${ev.titulo} ${ev.descripcion} ${ev.ponente} ${ev.lugar} ${ev.requisitos}`.toLowerCase();
        if (!texto.includes(q)) return false;
      }
      return true;
    });
  }

  agregarEvento(evento) {
    const nuevo = {
      id: "acs-cust-" + Date.now(),
      titulo: evento.titulo || "Sin título",
      categoria: evento.categoria || "taller",
      fecha: evento.fecha,
      horaIni: evento.horaIni || "08:00",
      horaFin: evento.horaFin || "10:00",
      lugar: evento.lugar || "Facultad de Química",
      modalidad: evento.modalidad || "Presencial",
      cupos: parseInt(evento.cupos) || 50,
      ponente: evento.ponente || "Por asignar",
      descripcion: evento.descripcion || "",
      requisitos: evento.requisitos || "",
      enlaceRegistro: evento.enlaceRegistro || "#",
      estado: evento.estado || "Inscripciones abiertas"
    };
    this.eventos.push(nuevo);
    this.guardarEventos();
    return nuevo;
  }

  restaurarPredeterminados() {
    this.eventos = [...EVENTOS_BASE_ACS];
    this.guardarEventos();
    return this.eventos;
  }

  exportarJSON() {
    return JSON.stringify(this.eventos, null, 2);
  }

  importarJSON(jsonStr) {
    try {
      const datos = JSON.parse(jsonStr);
      if (Array.isArray(datos)) {
        this.eventos = datos;
        this.guardarEventos();
        return true;
      }
    } catch (e) {
      console.error("JSON inválido para eventos ACS:", e);
    }
    return false;
  }
}

window.gestorEventosACS = new GestorEventosACS();
