/* ============ AGENDA & FECHAS PERSONALES ============ */
const CATEGORIAS_PERSONALES = {
  examen: { nombre: "Examen / Práctica", color: "#ef4444", bg: "#fee2e2", icono: "📝" },
  informe: { nombre: "Informe de Laboratorio", color: "#f59e0b", bg: "#fef3c7", icono: "🧪" },
  tarea: { nombre: "Proyecto / Trabajo Grupal", color: "#3b82f6", bg: "#dbeafe", icono: "💻" },
  reunion: { nombre: "Reunión / Asesoría", color: "#8b5cf6", bg: "#ede9fe", icono: "👥" },
  personal: { nombre: "Compromiso Personal", color: "#10b981", bg: "#d1fae5", icono: "⭐" }
};

const EJEMPLOS_INICIALES_PERSONALES = [
  {
    id: "per-01",
    titulo: "Examen Parcial - Fisicoquímica II",
    categoria: "examen",
    fecha: "2026-08-26",
    horaIni: "10:00",
    horaFin: "12:00",
    lugar: "Pabellón B - Aula 204",
    prioridad: "alta",
    descripcion: "Temas: Termodinámica estadística, potenciales químicos y equilibrio de fases.",
    completado: false
  },
  {
    id: "per-02",
    titulo: "Entrega de Informe: Síntesis de Acetato de Etilo",
    categoria: "informe",
    fecha: "2026-08-31",
    horaIni: "23:59",
    horaFin: "23:59",
    lugar: "Aula Virtual (Classroom / Moodle)",
    prioridad: "media",
    descripcion: "Incluir espectros IR y cálculo de rendimiento experimental vs teórico.",
    completado: false
  },
  {
    id: "per-03",
    titulo: "Reunión de Grupo: Proyecto Química Ambiental",
    categoria: "reunion",
    fecha: "2026-09-02",
    horaIni: "18:30",
    horaFin: "20:00",
    lugar: "Biblioteca Central / Google Meet",
    prioridad: "media",
    descripcion: "Revisión de la metodología para el tratamiento de aguas ácidas de mina.",
    completado: false
  }
];

class GestorAgendaPersonal {
  constructor() {
    this.claveAlmacenamiento = "acs_agenda_estudiante_personal";
    this.claveHorarioActivo = "acs_horario_academico_activo";
    this.items = this.cargarItems();
    this.horarioAcademico = this.cargarHorarioAcademico();
  }

  cargarItems() {
    try {
      const guardados = localStorage.getItem(this.claveAlmacenamiento);
      if (guardados) {
        return JSON.parse(guardados);
      }
    } catch (e) {
      console.warn("Error al cargar agenda personal de localStorage:", e);
    }
    return [...EJEMPLOS_INICIALES_PERSONALES];
  }

  guardarItems() {
    try {
      localStorage.setItem(this.claveAlmacenamiento, JSON.stringify(this.items));
    } catch (e) {
      console.error("Error al guardar agenda personal:", e);
    }
  }

  cargarHorarioAcademico() {
    try {
      const g = localStorage.getItem(this.claveHorarioActivo);
      if (g) return JSON.parse(g);
    } catch (e) {
      console.warn("No se pudo cargar el horario académico activo:", e);
    }
    return null;
  }

  guardarHorarioAcademico(horarioData) {
    this.horarioAcademico = horarioData;
    try {
      if (horarioData) {
        localStorage.setItem(this.claveHorarioActivo, JSON.stringify(horarioData));
      } else {
        localStorage.removeItem(this.claveHorarioActivo);
      }
    } catch (e) {
      console.error("Error al guardar horario académico:", e);
    }
  }

  obtenerTodos() {
    return [...this.items].sort((a, b) => (a.fecha + a.horaIni).localeCompare(b.fecha + b.horaIni));
  }

  obtenerPorId(id) {
    return this.items.find(it => it.id === id);
  }

  obtenerPorMes(anio, mes) {
    const mesStr = String(mes).padStart(2, "0");
    const prefijo = `${anio}-${mesStr}`;
    return this.obtenerTodos().filter(it => it.fecha.startsWith(prefijo));
  }

  obtenerPorDia(fechaStr) {
    return this.obtenerTodos().filter(it => it.fecha === fechaStr);
  }

  agregar(item) {
    const nuevo = {
      id: "per-" + Date.now(),
      titulo: item.titulo.trim() || "Sin título",
      categoria: item.categoria || "examen",
      fecha: item.fecha, // YYYY-MM-DD
      horaIni: item.horaIni || "08:00",
      horaFin: item.horaFin || item.horaIni || "09:00",
      lugar: item.lugar ? item.lugar.trim() : "",
      prioridad: item.prioridad || "media",
      descripcion: item.descripcion ? item.descripcion.trim() : "",
      completado: false
    };
    this.items.push(nuevo);
    this.guardarItems();
    return nuevo;
  }

  actualizar(id, cambios) {
    const idx = this.items.findIndex(it => it.id === id);
    if (idx !== -1) {
      this.items[idx] = { ...this.items[idx], ...cambios };
      this.guardarItems();
      return this.items[idx];
    }
    return null;
  }

  eliminar(id) {
    this.items = this.items.filter(it => it.id !== id);
    this.guardarItems();
  }

  alternarCompletado(id) {
    const it = this.obtenerPorId(id);
    if (it) {
      it.completado = !it.completado;
      this.guardarItems();
      return it.completado;
    }
    return false;
  }

  limpiarTodos() {
    this.items = [];
    this.guardarItems();
  }
}

window.gestorAgendaPersonal = new GestorAgendaPersonal();

/* ============ EXPORTADOR A iCALENDAR (.ICS) ============ */
const ExportadorICS = {
  formatearFechaHoraICS(fechaStr, horaStr) {
    // fechaStr: YYYY-MM-DD, horaStr: HH:MM
    const [y, m, d] = fechaStr.split("-");
    const [hh, mm] = (horaStr || "00:00").split(":");
    return `${y}${m.padStart(2, "0")}${d.padStart(2, "0")}T${hh.padStart(2, "0")}${mm.padStart(2, "0")}00`;
  },

  escaparICS(txt) {
    if (!txt) return "";
    return String(txt)
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  },

  generarICS({ tituloCalendario = "Calendario ACS & Estudiante", eventos = [] }) {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
    let ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ACS Student Chapter//Portal y Calendario Integral//ES",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:${this.escaparICS(tituloCalendario)}`,
      "X-WR-TIMEZONE:America/Lima"
    ];

    for (const ev of eventos) {
      const dtStart = this.formatearFechaHoraICS(ev.fecha, ev.horaIni);
      const dtEnd = this.formatearFechaHoraICS(ev.fecha, ev.horaFin || ev.horaIni);
      ics.push(
        "BEGIN:VEVENT",
        `UID:${ev.id || "ev-" + Math.random().toString(36).substr(2, 9)}@acs-portal`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${this.escaparICS(ev.titulo)}`,
        `DESCRIPTION:${this.escaparICS((ev.descripcion || "") + (ev.ponente ? "\\nPonente: " + ev.ponente : "") + (ev.enlaceRegistro ? "\\nRegistro: " + ev.enlaceRegistro : ""))}`,
        `LOCATION:${this.escaparICS(ev.lugar || "")}`,
        `CATEGORIES:${this.escaparICS(ev.categoria || "ACADEMICO")}`,
        "STATUS:CONFIRMED",
        "END:VEVENT"
      );
    }

    ics.push("END:VCALENDAR");
    return ics.join("\r\n");
  },

  descargarArchivo(nombreArchivo, contenido, tipo = "text/calendar;charset=utf-8") {
    const blob = new Blob([contenido], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  },

  exportarAgendaCompleta(eventosACS, eventosPersonales) {
    const todos = [
      ...eventosACS.map(e => ({ ...e, titulo: `[ACS] ${e.titulo}` })),
      ...eventosPersonales.map(p => ({ ...p, titulo: `[Personal] ${p.titulo}` }))
    ];
    const icsContent = this.generarICS({
      tituloCalendario: "ACS Student Chapter - Agenda y Calendario",
      eventos: todos
    });
    this.descargarArchivo("calendario_acs_estudiante.ics", icsContent);
  },

  exportarEventoIndividual(ev, esACS = true) {
    const prefijo = esACS ? "[ACS] " : "[Personal] ";
    const icsContent = this.generarICS({
      tituloCalendario: ev.titulo,
      eventos: [{ ...ev, titulo: prefijo + ev.titulo }]
    });
    const slug = ev.titulo.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 30);
    this.descargarArchivo(`evento_${slug}.ics`, icsContent);
  }
};

window.ExportadorICS = ExportadorICS;
