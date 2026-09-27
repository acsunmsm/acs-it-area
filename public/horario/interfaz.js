/* ============ CONTROLADOR PRINCIPAL · ARMADOR DE HORARIOS INTELIGENTE (SUM / PDF) ============ */
pdfjsLib.GlobalWorkerOptions.workerSrc = window.RUTA_WORKER_PDFJS;

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

// Persistencia del horario activo seleccionado
const CLAVE_HORARIO_ACTIVO = "acs_horario_academico_activo";
const CLAVE_PLANES_RESPALDO = "acs_planes_respaldo_sum";

function cargarHorarioActivo() {
  try {
    const g = localStorage.getItem(CLAVE_HORARIO_ACTIVO);
    if (g) return JSON.parse(g);
  } catch (e) {
    console.warn("No se pudo cargar el horario activo:", e);
  }
  return null;
}

function guardarHorarioActivo(horarioData) {
  try {
    if (horarioData) {
      localStorage.setItem(CLAVE_HORARIO_ACTIVO, JSON.stringify(horarioData));
    } else {
      localStorage.removeItem(CLAVE_HORARIO_ACTIVO);
    }
  } catch (e) {
    console.error("Error al guardar horario activo:", e);
  }
}

function cargarPlanesRespaldo() {
  try {
    const g = localStorage.getItem(CLAVE_PLANES_RESPALDO);
    if (g) return JSON.parse(g);
  } catch (e) {
    console.warn("No se pudo cargar los planes de respaldo:", e);
  }
  return { A: null, B: null, C: null };
}

function guardarPlanesRespaldoEnStorage(planes) {
  try {
    localStorage.setItem(CLAVE_PLANES_RESPALDO, JSON.stringify(planes));
  } catch (e) {
    console.error("Error al guardar planes de respaldo:", e);
  }
}

// Objeto global de compatibilidad
window.gestorAgendaPersonal = {
  cargarHorarioAcademico: cargarHorarioActivo,
  guardarHorarioAcademico: guardarHorarioActivo
};

// Estado global del armador PDF
const AppState = {
  armador: {
    cursos: [],
    ciclo: null,
    sel: new Set(),
    dias: new Set(DIAS),
    excl: new Set(),
    docPrefs: new Map(),  // Map<docente, 'disponible'|'no_disponible'>
    seccionesFijadas: new Map(), // Map<codigoCurso, seccionStr>
    soluciones: [],
    colorMap: {},
    ultimoFiltro: null,
    planesRespaldo: cargarPlanesRespaldo()
  }
};

/* =========================================================
   INICIALIZACIÓN
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  inicializarArmadorPDF();

  // Botones globales de cabecera para imprimir
  $("#btnImprimirGlobal")?.addEventListener("click", () => {
    imprimirHorario();
  });
  $("#btnImprimirInline")?.addEventListener("click", () => {
    imprimirHorario();
  });
});

/* =========================================================
   MÓDULO: ARMADOR DE HORARIOS INTELIGENTE (SUM / PDF)
   ========================================================= */
function inicializarArmadorPDF() {
  const E = AppState.armador;

  // Drag & drop y selector de archivos
  const zona = $("#zona");
  const archivo = $("#archivo");

  if (zona && archivo) {
    zona.onclick = () => archivo.click();
    zona.ondragover = e => { e.preventDefault(); zona.classList.add("drag"); };
    zona.ondragleave = () => zona.classList.remove("drag");
    zona.ondrop = e => {
      e.preventDefault();
      zona.classList.remove("drag");
      if (e.dataTransfer.files[0]) procesarPDF(e.dataTransfer.files[0]);
    };
    archivo.onchange = e => {
      if (e.target.files[0]) procesarPDF(e.target.files[0]);
    };
  }

  // Buscador de cursos en Paso 2
  const inputBuscar = $("#buscarCurso");
  const btnLimpiar = $("#btnLimpiarBuscar");
  if (inputBuscar) {
    inputBuscar.addEventListener("input", filtrarCursosArmador);
    inputBuscar.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        inputBuscar.value = "";
        filtrarCursosArmador();
      }
    });
  }
  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", () => {
      if (inputBuscar) {
        inputBuscar.value = "";
        filtrarCursosArmador();
        inputBuscar.focus();
      }
    });
  }

  // Días iniciales
  const diasContenedor = $("#dias");
  if (diasContenedor) {
    diasContenedor.innerHTML = DIAS.slice(0, 6).map(d => `<span class="chip on" data-dia="${d}">${DIA_CORTO[d]}</span>`).join("");
    $$('#dias .chip').forEach(ch => ch.onclick = () => {
      ch.classList.toggle("on");
      ch.classList.contains("on") ? E.dias.add(ch.dataset.dia) : E.dias.delete(ch.dataset.dia);
    });
  }

  const PRESETS = {
    lj: ["LUNES", "MARTES", "MIERCOLES", "JUEVES"],
    ms: ["MIERCOLES", "JUEVES", "VIERNES", "SABADO"],
    lv: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"],
    todos: DIAS.slice(0, 6)
  };

  $$('[data-preset]').forEach(b => b.onclick = () => {
    const set = new Set(PRESETS[b.dataset.preset]);
    E.dias = new Set(set);
    $$('#dias .chip').forEach(ch => ch.classList.toggle("on", set.has(ch.dataset.dia)));
  });

  // Selectores de horas
  const hmin = $("#hmin");
  const hmax = $("#hmax");
  if (hmin && hmax) {
    for (let h = 6; h <= 23; h++) {
      hmin.insertAdjacentHTML("beforeend", `<option value="${h * 60}">${aHora(h * 60)}</option>`);
      hmax.insertAdjacentHTML("beforeend", `<option value="${h * 60}">${aHora(h * 60)}</option>`);
    }
    hmin.value = 7 * 60;
    hmax.value = 22 * 60;
  }

  const TURNOS = {
    mt: [7 * 60, 19 * 60],
    tn: [13 * 60, 22 * 60],
    x: [6 * 60, 23 * 60],
    m: [7 * 60, 14 * 60],
    t: [13 * 60, 19 * 60],
    n: [17 * 60, 23 * 60]
  };
  $$('[data-turno]').forEach(b => b.onclick = () => {
    const turno = TURNOS[b.dataset.turno];
    if (!turno) return;
    const [a, z] = turno;
    if (hmin) hmin.value = a;
    if (hmax) hmax.value = z;
    $$('[data-turno]').forEach(o => o.classList.remove("on"));
    b.classList.add("on");
  });

  // Botones de acción
  const btnArmar = $("#armar");
  if (btnArmar) btnArmar.onclick = armarHorarios;

  const btnImprimir = $("#imprimir");
  if (btnImprimir) btnImprimir.onclick = () => imprimirHorario();

  // Modal de cambio de sección desde bloque del calendario
  $("#btnCerrarModalSec")?.addEventListener("click", cerrarModalCambioSeccion);
  $("#btnCerrarModalSecFooter")?.addEventListener("click", cerrarModalCambioSeccion);
  $("#modalCambiarSeccion")?.addEventListener("click", (e) => {
    if (e.target.id === "modalCambiarSeccion") cerrarModalCambioSeccion();
  });

  // Modal de comparar planes y acciones de respaldo
  $("#btnCompararPlanes")?.addEventListener("click", abrirModalCompararPlanes);
  $("#btnCopiarTodosPlanes")?.addEventListener("click", function () { copiarTodosLosPlanes(this); });
  $("#btnCerrarModalComparar")?.addEventListener("click", cerrarModalCompararPlanes);
  $("#btnCerrarModalCompararFooter")?.addEventListener("click", cerrarModalCompararPlanes);
  $("#modalCompararPlanes")?.addEventListener("click", (e) => {
    if (e.target.id === "modalCompararPlanes") cerrarModalCompararPlanes();
  });

  // Renderizar planes si ya estaban guardados previamente
  renderizarPanelPlanesRespaldo();
}

async function procesarPDF(file) {
  const E = AppState.armador;
  const estado = $("#estado");
  if (estado) estado.innerHTML = `<div class="aviso i">Leyendo <b>${file.name}</b>…</div>`;

  try {
    const buf = await file.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: buf }).promise;
    const paginas = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const p = await doc.getPage(i);
      const vp = p.getViewport({ scale: 1 });
      const tc = await p.getTextContent();
      paginas.push(tc.items.map(it => ({ x: it.transform[4], y: vp.height - it.transform[5], str: it.str })));
    }
    E.cursos = parsearPaginas(paginas);
    if (!E.cursos.length) throw new Error("No se reconoció ninguna asignatura. ¿Es el reporte de programación del SUM?");
    const ciclos = [...new Set(E.cursos.map(c => c.ciclo))].sort((a, b) => a - b);
    if (estado) estado.innerHTML = `<div class="aviso i">Listo: <b>${E.cursos.length} secciones</b> en ${doc.numPages} páginas · ciclos encontrados: ${ciclos.join(", ")}</div>`;
    pintarCiclosArmador(ciclos);
    $("#paso2")?.classList.remove("hide");
    $("#paso3")?.classList.remove("hide");
  } catch (err) {
    if (estado) estado.innerHTML = `<div class="aviso e"><b>No se pudo leer el PDF.</b> ${err.message}</div>`;
  }
}

function pintarCiclosArmador(ciclos) {
  const E = AppState.armador;
  const ciclosCont = $("#ciclos");
  if (!ciclosCont) return;

  ciclosCont.innerHTML = ciclos.map(c => `<span class="chip" data-ciclo="${c}">Ciclo ${c}</span>`).join("") +
    `<span class="chip" data-ciclo="*">Todos los ciclos</span>`;
  $$("#ciclos .chip").forEach(ch => ch.onclick = () => {
    $$("#ciclos .chip").forEach(o => o.classList.remove("on"));
    ch.classList.add("on");
    E.ciclo = ch.dataset.ciclo;
    E.seccionesFijadas.clear();
    pintarCursosArmador();
  });
  const pref = ciclos.includes("4") ? "4" : ciclos[0];
  $(`#ciclos .chip[data-ciclo="${pref}"]`)?.click();
}

const delCicloArmador = () => AppState.armador.ciclo === "*" ? AppState.armador.cursos : AppState.armador.cursos.filter(c => c.ciclo === AppState.armador.ciclo);

function normalizarTexto(txt) {
  return (txt || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function filtrarCursosArmador() {
  const input = $("#buscarCurso");
  const query = normalizarTexto(input?.value || "");
  const btnLimpiar = $("#btnLimpiarBuscar");
  const contador = $("#contadorBusqueda");
  const sinResultados = $("#sinResultadosCursos");

  if (btnLimpiar) {
    btnLimpiar.classList.toggle("hide", !query);
  }

  const items = $$("#cursos .item");
  let visibles = 0;

  items.forEach(item => {
    const texto = item.dataset.search || normalizarTexto(item.textContent || "");
    const coincide = !query || texto.includes(query);
    item.style.display = coincide ? "" : "none";
    if (coincide) visibles++;
  });

  if (contador) {
    if (query) {
      contador.textContent = `${visibles} de ${items.length} ${visibles === 1 ? 'asignatura' : 'asignaturas'}`;
    } else {
      contador.textContent = "";
    }
  }

  if (sinResultados) {
    if (items.length > 0 && visibles === 0 && query) {
      sinResultados.classList.remove("hide");
      const E = AppState.armador;
      const aviso = sinResultados.querySelector(".aviso-no-match");
      if (aviso) {
        const querySegura = (input?.value || "").replace(/[<>&"']/g, s => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[s]));
        if (E.ciclo !== "*") {
          aviso.innerHTML = `No se encontraron asignaturas para "<b>${querySegura}</b>" en el ciclo seleccionado. <a href="#" id="linkBuscarTodosCiclos" style="color:var(--color-primary);font-weight:600;text-decoration:underline;cursor:pointer">Buscar en todos los ciclos</a>`;
          $("#linkBuscarTodosCiclos")?.addEventListener("click", (e) => {
            e.preventDefault();
            $(`#ciclos .chip[data-ciclo="*"]`)?.click();
          });
        } else {
          aviso.innerHTML = `No se encontraron asignaturas que coincidan con "<b>${querySegura}</b>".`;
        }
      }
    } else {
      sinResultados.classList.add("hide");
    }
  }
}

function mostrarPopoverCurso(cod, e) {
  const popover = $("#popoverHorarioPreview");
  const contenido = $("#popoverContenido");
  if (!popover || !contenido) return;

  const lista = delCicloArmador();
  const secciones = lista.filter(c => c.codigo === cod);
  if (!secciones.length) return;

  const primer = secciones[0];
  const secFijada = AppState.armador.seccionesFijadas.get(cod) || "";

  const secCardsHtml = secciones.map(sec => {
    const esFijada = secFijada === sec.seccion;
    const doc = sec.docente && sec.docente !== "SIN DOCENTE ASIGNADO" && sec.docente !== "--"
      ? sec.docente
      : "Por asignar";

    const slotsHtml = (sec.horarios || []).map(h => {
      const diaTxt = (DIA_CORTO[h.dia] || "").toUpperCase();
      const aulaTxt = h.aula ? `<span class="aula">· ${h.aula}</span>` : "";
      return `<span class="popover-slot"><span class="dia">${diaTxt}</span> ${aHora(h.ini)} - ${aHora(h.fin)}${aulaTxt}</span>`;
    }).join("");

    return `
      <div class="popover-sec-card ${esFijada ? 'pinned' : ''}">
        <div class="popover-sec-row">
          <div class="popover-sec-label">
            <span class="popover-sec-badge ${esFijada ? 'pin' : ''}">Sec. ${sec.seccion}</span>
            ${esFijada ? '<span style="font-size:10px;font-weight:700;color:var(--color-primary)">[Fijada]</span>' : ''}
          </div>
          <span class="popover-sec-doc" title="${doc}">${doc}</span>
        </div>
        <div class="popover-slots">
          ${slotsHtml || '<span style="font-size:10.5px;color:var(--muted)">Sin horario programado</span>'}
        </div>
      </div>
    `;
  }).join("");

  contenido.innerHTML = `
    <div class="popover-head">
      <div class="popover-meta-top">
        <span class="popover-cod">${cod}</span>
        <div class="popover-chips">
          <span class="popover-chip">Ciclo ${primer.ciclo || '-'}</span>
          <span class="popover-chip">${primer.creditos} Créditos</span>
          <span class="popover-chip">${secciones.length} ${secciones.length === 1 ? 'Sección' : 'Secciones'}</span>
        </div>
      </div>
      <h4 class="popover-title">${primer.nombre}</h4>
    </div>
    <div class="popover-secciones-title">Horarios de Secciones:</div>
    <div class="popover-secciones">
      ${secCardsHtml}
    </div>
    <div class="popover-footer-hint">Vista previa rápida</div>
  `;

  popover.classList.remove("hide");
  moverPopover(e);
}

function moverPopover(e) {
  const popover = $("#popoverHorarioPreview");
  if (!popover || popover.classList.contains("hide")) return;

  const rect = popover.getBoundingClientRect();
  const offset = 16;
  let x = e.clientX + offset;
  let y = e.clientY + offset;

  if (x + rect.width > window.innerWidth - 12) {
    x = e.clientX - rect.width - 12;
  }
  if (y + rect.height > window.innerHeight - 12) {
    y = window.innerHeight - rect.height - 12;
  }
  if (x < 10) x = 10;
  if (y < 10) y = 10;

  popover.style.left = `${x}px`;
  popover.style.top = `${y}px`;
}

function ocultarPopover() {
  const popover = $("#popoverHorarioPreview");
  if (popover) {
    popover.classList.add("hide");
  }
}

function pintarCursosArmador() {
  const E = AppState.armador;
  const lista = delCicloArmador();
  const codigos = [...new Set(lista.map(c => c.codigo))];
  E.sel = new Set(codigos);

  // Limpiar secciones fijadas de cursos que ya no están
  for (const cod of [...E.seccionesFijadas.keys()]) {
    if (!codigos.includes(cod)) E.seccionesFijadas.delete(cod);
  }

  const cursosCont = $("#cursos");
  if (!cursosCont) return;

  cursosCont.innerHTML = codigos.map(cod => {
    const s = lista.filter(c => c.codigo === cod);
    const docsCurso = [...new Set(s.map(x => x.docente).filter(d => d && d !== "SIN DOCENTE ASIGNADO" && d !== "--"))];
    const subDoc = docsCurso.length ? ` · <span style="color:var(--muted)">Prof: ${docsCurso.join(", ")}</span>` : ` · <span style="color:#a0aec0">(Prof. por asignar)</span>`;
    const secFijada = E.seccionesFijadas.get(cod) || "";

    const opcionesSecc = s.length > 1 ? `
      <div style="margin-top:7px;display:flex;align-items:center;justify-content:flex-end;gap:6px;width:100%" onclick="event.stopPropagation()">
        <span style="font-size:11.5px;color:var(--muted);white-space:nowrap">Fijar:</span>
        <select class="sel-pin-seccion ${secFijada ? 'pinned' : ''}" data-cod="${cod}" title="Fijar sección específica para ${s[0].nombre}">
          <option value="">Cualquier sección</option>
          ${s.map(sec => {
            const docInfo = sec.docente && sec.docente !== 'SIN DOCENTE ASIGNADO' ? ' (' + sec.docente.split(',')[0] + ')' : '';
            return `<option value="${sec.seccion}" ${secFijada === sec.seccion ? 'selected' : ''}>Sec. ${sec.seccion}${docInfo}</option>`;
          }).join('')}
        </select>
      </div>` : '';

    const estiloFijado = secFijada ? 'border-color:var(--acc);background:#f8fcff;' : '';
    const textoBusqueda = normalizarTexto(`${cod} ${s[0].nombre} ${docsCurso.join(" ")}`);
    return `<div class="item" data-cod="${cod}" data-search="${textoBusqueda}" style="flex-direction:column;align-items:stretch;justify-content:space-between;${estiloFijado}">
      <label style="display:flex;gap:9px;align-items:flex-start;cursor:pointer">
        <input type="checkbox" checked data-cod="${cod}">
        <span>
          <span class="n">${cod} · ${s[0].nombre}</span><br>
          <span class="m">${s[0].creditos} créditos · ${s.length} ${s.length === 1 ? "sección" : "secciones"}${subDoc}</span>
        </span>
      </label>
      ${opcionesSecc}
    </div>`;
  }).join("");

  $$('#cursos input[type="checkbox"]').forEach(i => i.onchange = () => {
    i.checked ? E.sel.add(i.dataset.cod) : E.sel.delete(i.dataset.cod);
    resumenArmador();
    pintarDocentesArmador();
  });

  $$('#cursos .sel-pin-seccion').forEach(sel => sel.onchange = (e) => {
    e.stopPropagation();
    const cod = sel.dataset.cod;
    const val = sel.value;
    const itemCard = sel.closest('.item');
    if (val) {
      E.seccionesFijadas.set(cod, val);
      sel.classList.add('pinned');
      if (itemCard) {
        itemCard.style.borderColor = 'var(--acc)';
        itemCard.style.background = '#f8fcff';
      }
    } else {
      E.seccionesFijadas.delete(cod);
      sel.classList.remove('pinned');
      if (itemCard) {
        itemCard.style.borderColor = 'var(--line)';
        itemCard.style.background = '#fff';
      }
    }
  });

  $$('[data-cursos]').forEach(b => b.onclick = () => {
    const todo = b.dataset.cursos === "todos";
    const itemsVisibles = $$('#cursos .item').filter(item => item.style.display !== "none");
    const targets = itemsVisibles.length ? itemsVisibles : $$('#cursos .item');
    targets.forEach(item => {
      const i = item.querySelector('input[type="checkbox"]');
      if (i) {
        i.checked = todo;
        todo ? E.sel.add(i.dataset.cod) : E.sel.delete(i.dataset.cod);
      }
    });
    resumenArmador();
    pintarDocentesArmador();
  });

  // Previsualización rápida al pasar el cursor (Hover preview)
  $$('#cursos .item').forEach(item => {
    item.addEventListener('mouseenter', (e) => {
      mostrarPopoverCurso(item.dataset.cod, e);
    });
    item.addEventListener('mousemove', (e) => {
      moverPopover(e);
    });
    item.addEventListener('mouseleave', () => {
      ocultarPopover();
    });
  });

  resumenArmador();
  pintarDocentesArmador();
  filtrarCursosArmador();
}

const LIMITE_CREDITOS_MAX = 26;
const LIMITE_CREDITOS_MIN = 12;

function obtenerLimiteCreditosMax() {
  return LIMITE_CREDITOS_MAX;
}

function resumenArmador() {
  const E = AppState.armador;
  const lista = delCicloArmador().filter(c => E.sel.has(c.codigo));
  const codigos = [...new Set(lista.map(c => c.codigo))];
  const cred = codigos.reduce((t, cod) => t + (lista.find(c => c.codigo === cod)?.creditos || 0), 0);

  const resumen = $("#resumenCred");
  if (resumen) resumen.textContent = `${E.sel.size} asignaturas seleccionadas · ${cred} créditos`;

  // Actualizar monitor y barra de progreso de créditos
  actualizarMonitorCreditos(cred, codigos.length);
}

function actualizarMonitorCreditos(cred, numCursos) {
  const max = LIMITE_CREDITOS_MAX;
  const min = LIMITE_CREDITOS_MIN;
  const texto = $("#creditosTexto");
  const badge = $("#creditosBadgeEstado");
  const fill = $("#barraCredFill");
  const box = $("#panelCreditosBox");
  const alerta = $("#credAlertaBox");

  const pct = Math.min(100, Math.round((cred / max) * 100));

  if (texto) {
    texto.textContent = `${cred} / ${max} créditos`;
  }

  if (fill) {
    fill.style.width = `${pct}%`;
    fill.classList.remove("optimo", "excedido");
    if (cred > max) fill.classList.add("excedido");
    else if (cred >= min) fill.classList.add("optimo");
  }

  if (box) {
    box.classList.remove("optimo", "excedido");
    if (cred > max) box.classList.add("excedido");
    else if (cred >= min) box.classList.add("optimo");
  }

  if (badge) {
    badge.className = "badge-cred";
    if (cred === 0) {
      badge.textContent = "Sin cursos";
      badge.classList.add("normal");
    } else if (cred > max) {
      badge.textContent = `Excedido (+${cred - max})`;
      badge.classList.add("excedido");
    } else if (cred === max) {
      badge.textContent = "Tope alcanzado (26)";
      badge.classList.add("optimo");
    } else if (cred >= min) {
      badge.textContent = "Carga válida";
      badge.classList.add("optimo");
    } else {
      badge.textContent = `Bajo el mínimo (${cred} / ${min})`;
      badge.classList.add("normal");
    }
  }

  if (alerta) {
    if (cred > max) {
      alerta.className = "cred-alerta excedido";
      alerta.innerHTML = `Has seleccionado <b>${cred} créditos</b>, superando el tope reglamentario de <b>${max} créditos</b> por <b>${cred - max} crédito(s)</b>. El SUM de la UNMSM no permite exceder los ${max} créditos.`;
    } else if (cred > 0 && cred < min) {
      alerta.className = "cred-alerta advertencia";
      alerta.innerHTML = `Has seleccionado <b>${cred} créditos</b>. La matrícula regular en el SUM requiere un mínimo de <b>${min} créditos</b> (te faltan ${min - cred} crédito(s)).`;
    } else if (cred >= min && cred < max && (max - cred) <= 4) {
      alerta.className = "cred-alerta disponible";
      alerta.innerHTML = `Te quedan <b>${max - cred} crédito(s) disponibles</b> antes de alcanzar el tope reglamentario (${max} créditos).`;
    } else {
      alerta.className = "cred-alerta hide";
      alerta.innerHTML = "";
    }
  }
}

function pintarDocentesArmador() {
  const E = AppState.armador;
  const lista = delCicloArmador().filter(c => E.sel.has(c.codigo));
  const docs = [...new Set(lista.map(c => c.docente))].filter(d => d && d !== "SIN DOCENTE ASIGNADO" && d !== "--").sort();

  // Limpiar prefs de docentes que ya no están en la selección
  for (const key of [...E.docPrefs.keys()]) {
    if (!docs.includes(key)) E.docPrefs.delete(key);
  }

  const contenedor = $("#docentes-lista");
  if (!contenedor) return;

  if (docs.length === 0) {
    contenedor.innerHTML = '<span style="padding:4px 0;display:block;color:var(--muted);font-size:13.5px">No hay docentes asignados en este PDF para las asignaturas seleccionadas.</span>';
    return;
  }

  function estadoBadge(estado) {
    if (estado === 'disponible') return '<span style="background:#d1fae5;color:#065f46;padding:2px 10px;border-radius:20px;font-size:11.5px;font-weight:700;white-space:nowrap">Disponible</span>';
    if (estado === 'no_disponible') return '<span style="background:#fee2e2;color:#991b1b;padding:2px 10px;border-radius:20px;font-size:11.5px;font-weight:700;white-space:nowrap">No Disponible</span>';
    return '<span style="background:#f1f5f9;color:#64748b;padding:2px 10px;border-radius:20px;font-size:11.5px;font-weight:700;white-space:nowrap">— Sin preferencia</span>';
  }

  contenedor.innerHTML = docs.map(d => {
    const estado = E.docPrefs.get(d) || 'neutro';
    const safe = d.replace(/"/g, '&quot;');
    return `<div class="doc-pref-row" data-doc="${safe}" style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 10px;border-radius:8px;background:#f8fafc;border:1px solid var(--line);cursor:pointer;transition:background 0.15s" title="Haz clic para cambiar disponibilidad">
      <span style="font-size:13px;font-weight:500;color:var(--ink);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${d}</span>
      <span class="doc-pref-badge" style="flex-shrink:0">${estadoBadge(estado)}</span>
    </div>`;
  }).join("");

  contenedor.querySelectorAll(".doc-pref-row").forEach(row => {
    row.addEventListener("click", () => {
      const doc = row.dataset.doc;
      const actual = E.docPrefs.get(doc) || 'neutro';
      const siguiente = actual === 'neutro' ? 'disponible' : (actual === 'disponible' ? 'no_disponible' : 'neutro');
      if (siguiente === 'neutro') E.docPrefs.delete(doc);
      else E.docPrefs.set(doc, siguiente);

      // Actualizar visual sin redibujar todo
      const badge = row.querySelector('.doc-pref-badge');
      if (badge) badge.innerHTML = estadoBadge(siguiente);
      row.style.background = siguiente === 'disponible' ? '#f0fdf4' : (siguiente === 'no_disponible' ? '#fff5f5' : '#f8fafc');
      row.style.borderColor = siguiente === 'disponible' ? '#86efac' : (siguiente === 'no_disponible' ? '#fca5a5' : 'var(--line)');
    });

    // Aplicar estilo inicial
    const estado = E.docPrefs.get(row.dataset.doc) || 'neutro';
    row.style.background = estado === 'disponible' ? '#f0fdf4' : (estado === 'no_disponible' ? '#fff5f5' : '#f8fafc');
    row.style.borderColor = estado === 'disponible' ? '#86efac' : (estado === 'no_disponible' ? '#fca5a5' : 'var(--line)');
  });
}

const COLORES_HORARIO = [
  "#0054a6", // Azul ACS institucional
  "#412BFD", // Azul primario web
  "#059669", // Verde reactivo esmeralda
  "#7c3aed", // Púrpura químico
  "#d97706", // Ámbar dorado
  "#0891b2", // Azul cian profundo
  "#e11d48", // Rosa rubí
  "#2563eb", // Azul cobalto
  "#4f46e5", // Índigo brillante
  "#0d9488", // Teal científico
  "#b45309", // Bronce cálido
  "#9333ea"  // Violeta
];

function armarHorarios() {
  const E = AppState.armador;
  const lista = delCicloArmador().filter(c => E.sel.has(c.codigo));
  const out = $("#salida");
  if (!out) return;
  out.innerHTML = "";

  if (!lista.length) { out.innerHTML = '<div class="aviso w">Selecciona al menos una asignatura.</div>'; return; }
  if (!E.dias.size) { out.innerHTML = '<div class="aviso w">Selecciona al menos un día.</div>'; return; }

  const noDisponibles = new Set([...E.docPrefs.entries()].filter(([,v]) => v === 'no_disponible').map(([k]) => k));
  const disponibles   = new Set([...E.docPrefs.entries()].filter(([,v]) => v === 'disponible').map(([k]) => k));

  const f = { dias: new Set(E.dias), horaMin: +$("#hmin").value, horaMax: +$("#hmax").value, docentesExcluidos: new Set(), docPrefs: E.docPrefs };
  if (f.horaMin >= f.horaMax) { out.innerHTML = '<div class="aviso w">El rango de horas está invertido.</div>'; return; }

  const codigos = [...new Set(lista.map(c => c.codigo))];

  // Fase 1: armado respetando secciones fijadas y preferencias de docentes
  const fConPref = { ...f, docentesExcluidos: noDisponibles };
  const gruposConPref = codigos.map(cod => {
    const secFijada = E.seccionesFijadas.get(cod);
    if (secFijada) {
      const secObj = lista.find(c => c.codigo === cod && c.seccion === secFijada);
      if (secObj) {
        return {
          codigo: cod,
          nombre: secObj.nombre,
          secciones: [secObj]
        };
      }
    }
    return {
      codigo: cod,
      nombre: lista.find(c => c.codigo === cod).nombre,
      secciones: lista.filter(c => c.codigo === cod && seccionPasa(c, fConPref))
    };
  });

  // Fase 2: si algún curso queda sin secciones, incluir docentes no-disponibles como fallback
  const gruposFallback = codigos.map(cod => {
    const secFijada = E.seccionesFijadas.get(cod);
    if (secFijada) {
      const secObj = lista.find(c => c.codigo === cod && c.seccion === secFijada);
      if (secObj) {
        return {
          codigo: cod,
          nombre: secObj.nombre,
          secciones: [secObj]
        };
      }
    }
    return {
      codigo: cod,
      nombre: lista.find(c => c.codigo === cod).nombre,
      secciones: lista.filter(c => c.codigo === cod && seccionPasa(c, f))
    };
  });

  // Usar fallback sólo para los cursos que en fase 1 quedaron sin opciones
  const grupos = gruposConPref.map((g, idx) => g.secciones.length ? g : gruposFallback[idx]);
  const vacios = grupos.filter(g => !g.secciones.length);
  const activos = grupos.filter(g => g.secciones.length);

  if (!activos.length) {
    out.innerHTML = diagnosticoInteligente({ activos: [], vacios, f, lista, codigos });
    vincularEventosDiagnostico();
    out.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  let html = "";
  if (vacios.length) {
    html += `<div class="aviso w"><b>Aviso:</b> ${vacios.length} asignatura(s) no tienen secciones disponibles con los filtros actuales y quedaron excluidas temporalmente:<br>` +
      vacios.map(g => `· ${g.codigo} — ${g.nombre}`).join("<br>") + '</div>';
  }

  const huecoSel = +$("#hueco").value;
  let { soluciones, truncado } = generar(activos, { huecoMaxPermitido: huecoSel >= 999 ? Infinity : huecoSel * 60, limite: 500, docPrefs: f.docPrefs });

  if (!soluciones.length && huecoSel < 999) {
    const r2 = generar(activos, { limite: 500, docPrefs: f.docPrefs });
    if (r2.soluciones.length) {
      html += `<div class="aviso w">No hay ninguna combinación con huecos de máximo ${huecoSel} h. Te muestro las mejores sin ese límite.</div>`;
      soluciones = r2.soluciones; truncado = r2.truncado;
    }
  }
  if (!soluciones.length) {
    out.innerHTML = diagnosticoInteligente({ activos, vacios, f, lista, codigos });
    vincularEventosDiagnostico();
    out.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const color = {};
  codigos.forEach((c, i) => color[c] = COLORES_HORARIO[i % COLORES_HORARIO.length]);

  // Guardar en estado global para personalización inline posterior
  E.soluciones = soluciones;
  E.colorMap = color;
  E.ultimoFiltro = f;

  // Advertencia si alguna solución incluye docentes no-disponibles
  const infoPrefs = disponibles.size > 0 || noDisponibles.size > 0
    ? `<div class="aviso i noprint" style="margin-bottom:6px"><b>Plana Docente activa:</b> ${
        disponibles.size ? `<span style="color:#065f46">${disponibles.size} con alta prioridad</span>` : ''
      }${ disponibles.size && noDisponibles.size ? ' · ' : ''
      }${
        noDisponibles.size ? `<span style="color:#991b1b">${noDisponibles.size} con baja prioridad</span>` : ''
      }. Los horarios que incluyan docentes de baja prioridad se identifican claramente.</div>`
    : '';

  const fijadasCount = E.seccionesFijadas.size;
  const infoFijadas = fijadasCount > 0
    ? `<div class="aviso i noprint" style="margin-bottom:6px"><b>Secciones fijadas:</b> Se armaron las opciones priorizando tus ${fijadasCount} sección(es) fijada(s). En cada resultado puedes intercambiar cualquier sección en la tabla.</div>`
    : `<div class="aviso i noprint" style="margin-bottom:6px"><b>Personalización interactiva:</b> Puedes cambiar cualquier sección directamente en la columna <b>Sec. (Cambiar)</b> o haciendo clic en cualquier bloque del calendario visual.</div>`;

  const maxCredActual = obtenerLimiteCreditosMax();
  const credTotalSeleccionado = codigos.reduce((t, cod) => t + (lista.find(c => c.codigo === cod)?.creditos || 0), 0);
  const avisoExcesoCred = credTotalSeleccionado > maxCredActual
    ? `<div class="aviso w noprint" style="margin-bottom:6px"><b>Atención con tus créditos:</b> Has seleccionado <b>${credTotalSeleccionado} créditos</b>, superando el tope reglamentario de <b>${maxCredActual} créditos</b>. Se calcularon las combinaciones, pero verifica si necesitas ampliación de créditos.</div>`
    : '';
  const avisoMenorMinimo = (credTotalSeleccionado > 0 && credTotalSeleccionado < LIMITE_CREDITOS_MIN)
    ? `<div class="aviso w noprint" style="margin-bottom:6px"><b>Carga menor al mínimo:</b> Has seleccionado <b>${credTotalSeleccionado} créditos</b>. La matrícula regular en el SUM requiere al menos <b>${LIMITE_CREDITOS_MIN} créditos</b>.</div>`
    : '';

  html += infoPrefs;
  html += infoFijadas;
  html += avisoExcesoCred;
  html += avisoMenorMinimo;
  html += `<div class="aviso i noprint"><b>${soluciones.length}${truncado ? "+" : ""} horario(s) posible(s)</b> sin cruces. Ordenados por menos horas muertas. Se muestran los ${Math.min(soluciones.length, 20)} mejores.</div>`;

  soluciones.slice(0, 20).forEach((s, i) => {
    html += tarjetaResultadoArmador(s, i, color, f);
  });

  out.innerHTML = html;
  out.scrollIntoView({ behavior: "smooth", block: "start" });

  vincularEventosResultados();
  actualizarUIPlanesRespaldo();
}

function vincularEventosResultados() {
  const E = AppState.armador;
  const soluciones = E.soluciones;
  const color = E.colorMap;
  const f = E.ultimoFiltro;

  // Botones Guardar como Horario Activo
  $$(".btnActivarHorario").forEach(btn => {
    btn.onclick = () => {
      const idx = +btn.dataset.solIdx;
      const sol = soluciones[idx];
      if (!sol) return;
      window.gestorAgendaPersonal.guardarHorarioAcademico(sol);
      $$(".btnActivarHorario").forEach(b => {
        b.innerHTML = "Guardar como mi Horario Activo";
        b.classList.remove("guardado");
      });
      btn.innerHTML = "Horario Activo Guardado";
      btn.classList.add("guardado");
      alert(`¡Opción ${idx + 1}${sol.personalizado ? ' (Personalizada)' : ''} guardada exitosamente como tu Horario Activo en tu navegador!`);
    };
  });

  // Selectores de Swap de Sección
  $$(".sel-swap-seccion").forEach(sel => {
    sel.onchange = () => {
      const solIdx = +sel.dataset.solIdx;
      const cod = sel.dataset.cod;
      const nuevaSecVal = sel.value;
      const sol = soluciones[solIdx];
      if (!sol) return;

      const poolCursos = delCicloArmador();
      const todasDelCurso = poolCursos.filter(c => c.codigo === cod);
      const nuevaSecObj = todasDelCurso.find(c => c.seccion === nuevaSecVal);
      if (!nuevaSecObj) return;

      const otrasSecciones = sol.secciones.filter(c => c.codigo !== cod);
      const tieneCruce = chocaConLista(nuevaSecObj, otrasSecciones);

      if (tieneCruce) {
        const choqueCon = otrasSecciones.find(o => o.horarios.some(h1 => nuevaSecObj.horarios.some(h2 => chocan(h1, h2))));
        const descChoque = choqueCon ? `${choqueCon.codigo} · ${choqueCon.nombre} (Sec. ${choqueCon.seccion})` : "otra asignatura";
        alert(`No es posible cambiar a la Sección ${nuevaSecVal}:\nGenera cruce de horario con ${descChoque}.`);
        const secActual = sol.secciones.find(c => c.codigo === cod);
        if (secActual) sel.value = secActual.seccion;
        return;
      }

      // Reemplazar la sección
      const idxEnSol = sol.secciones.findIndex(c => c.codigo === cod);
      if (idxEnSol !== -1) {
        sol.secciones[idxEnSol] = nuevaSecObj;
      }

      // Recalcular métricas
      const m = metricas(sol.secciones);
      sol.porDia = m.porDia;
      sol.dias = m.dias;
      sol.huecoTotal = m.huecoTotal;
      sol.huecoMax = m.huecoMax;
      sol.minutosClase = m.minutosClase;

      const docPrefs = (f && f.docPrefs) || new Map();
      sol.noDispo = sol.secciones.filter(sec => docPrefs.get(sec.docente) === 'no_disponible').length;
      sol.conDispo = sol.secciones.filter(sec => docPrefs.get(sec.docente) === 'disponible').length;
      sol.personalizado = true;

      // Re-renderizar esta tarjeta específica
      const cardEl = $(`#res-tarjeta-${solIdx}`);
      if (cardEl) {
        const temp = document.createElement("div");
        temp.innerHTML = tarjetaResultadoArmador(sol, solIdx, color, f);
        const nuevaCard = temp.firstElementChild;
        nuevaCard.classList.add("card-updated");
        cardEl.replaceWith(nuevaCard);
        vincularEventosResultados();
      }

      sincronizarPlanesConSolucion(solIdx);
    };
  });

  // Clic en los bloques de cursos del calendario visual para abrir modal de cambio
  $$(".blq-interactivo").forEach(blq => {
    blq.onclick = (e) => {
      e.stopPropagation();
      const solIdx = +blq.dataset.solIdx;
      const cod = blq.dataset.cod;
      abrirModalCambioSeccion(solIdx, cod);
    };
  });

  // Botones de asignar Plan de Respaldo (A, B, C)
  $$(".btn-plan-tag").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const solIdx = +btn.dataset.solIdx;
      const plan = btn.dataset.plan;
      alternarPlanRespaldo(plan, solIdx);
    };
  });

  // Botones de Imprimir Tarjeta Individual
  $$(".btnImprimirTarjeta").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const solIdx = +btn.dataset.solIdx;
      imprimirHorario(solIdx);
    };
  });
}

function imprimirHorario(solIdx) {
  const E = AppState.armador;
  const soluciones = E.soluciones;
  if (!soluciones || soluciones.length === 0) {
    alert("Primero debes armar los horarios para poder imprimir.");
    return;
  }

  let idx = 0;
  if (solIdx !== undefined && solIdx !== null) {
    idx = +solIdx;
  } else {
    // Si se pulsa el botón global, verificar si hay un Plan A guardado, o usar la Opción 1
    const planes = E.planesRespaldo || {};
    if (planes.A && planes.A.solIdx !== undefined && $(`#res-tarjeta-${planes.A.solIdx}`)) {
      idx = planes.A.solIdx;
    } else {
      idx = 0;
    }
  }

  const tarjeta = $(`#res-tarjeta-${idx}`);
  if (!tarjeta) {
    window.print();
    return;
  }

  document.body.classList.add("modo-impresion-individual");
  $$(".res").forEach(r => r.classList.remove("imprimiendo-activa"));
  tarjeta.classList.add("imprimiendo-activa");

  const cleanup = () => {
    document.body.classList.remove("modo-impresion-individual");
    if (tarjeta) tarjeta.classList.remove("imprimiendo-activa");
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup, { once: true });
  setTimeout(cleanup, 2000);

  window.print();
}

function abrirModalCambioSeccion(solIdx, cod) {
  const E = AppState.armador;
  const sol = E.soluciones[solIdx];
  if (!sol) return;

  const modal = $("#modalCambiarSeccion");
  const titulo = $("#modalSecTitulo");
  const subtitulo = $("#modalSecSubtitulo");
  const cuerpo = $("#modalSecCuerpo");
  if (!modal || !cuerpo) return;

  const poolCursos = delCicloArmador();
  const todasDelCurso = poolCursos.filter(c => c.codigo === cod);
  const secActualObj = sol.secciones.find(c => c.codigo === cod);
  if (!secActualObj) return;

  if (titulo) titulo.textContent = `${cod} · ${secActualObj.nombre}`;
  if (subtitulo) subtitulo.textContent = `Opción ${solIdx + 1} · Haz clic en una sección para cambiarla de inmediato`;

  if (todasDelCurso.length <= 1) {
    cuerpo.innerHTML = `
      <div style="padding:20px;background:#f8fafc;border:1px solid var(--line);border-radius:10px;text-align:center">
        <p style="margin:0 0 6px 0;font-size:14px;font-weight:700;color:var(--ink)">Asignatura con sección única</p>
        <p style="margin:0;font-size:13px;color:var(--muted)">Esta asignatura solo cuenta con la <b>Sec. ${secActualObj.seccion}</b> en el reporte del SUM. No existen secciones alternativas para cambiar.</p>
      </div>`;
    modal.classList.remove("hide");
    return;
  }

  const otrasSecciones = sol.secciones.filter(c => c.codigo !== cod);
  const docPrefs = (E.ultimoFiltro && E.ultimoFiltro.docPrefs) || new Map();

  let html = `<div style="display:flex;flex-direction:column;gap:10px">`;

  // Sección en uso actualmente
  html += `
    <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:10px;padding:12px 14px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <span style="font-weight:800;font-size:14px;color:#065f46">✓ Sección ${secActualObj.seccion} (Sección Actual)</span>
        <span style="background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700">En uso en este horario</span>
      </div>
      <div style="font-size:12.5px;color:#1e293b;line-height:1.5">
        <b>Docente:</b> ${secActualObj.docente}<br>
        <b>Horario:</b> ${secActualObj.horarios.map(h => DIA_CORTO[h.dia] + " " + aHora(h.ini) + "–" + aHora(h.fin) + (h.aula && h.aula !== "--" ? " (" + h.aula + ")" : "")).join(" · ")}
      </div>
    </div>`;

  // Otras secciones del curso
  todasDelCurso.filter(c => c.seccion !== secActualObj.seccion).forEach(cand => {
    const cruza = chocaConLista(cand, otrasSecciones);
    const prefDoc = docPrefs.get(cand.docente);
    const badgeDoc = prefDoc === 'disponible'
      ? `<span style="background:#d1fae5;color:#065f46;padding:1px 6px;border-radius:8px;font-size:11px;font-weight:700">Alta prioridad</span>`
      : (prefDoc === 'no_disponible'
        ? `<span style="background:#fee2e2;color:#991b1b;padding:1px 6px;border-radius:8px;font-size:11px;font-weight:700">Baja prioridad</span>`
        : '');

    if (!cruza) {
      html += `
        <div style="background:#fff;border:1.5px solid var(--line);border-radius:10px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px;transition:border 0.2s">
          <div style="font-size:12.5px;color:#1e293b;line-height:1.5;flex:1">
            <div style="font-weight:700;font-size:13.5px;color:var(--ink);margin-bottom:3px;display:flex;align-items:center;gap:6px">
              Sec. ${cand.seccion} ${badgeDoc}
            </div>
            <b>Docente:</b> ${cand.docente}<br>
            <b>Horario:</b> ${cand.horarios.map(h => DIA_CORTO[h.dia] + " " + aHora(h.ini) + "–" + aHora(h.fin) + (h.aula && h.aula !== "--" ? " (" + h.aula + ")" : "")).join(" · ")}
          </div>
          <button class="btn sm btnModalAplicarSwap" data-sec="${cand.seccion}">
            Cambiar a esta
          </button>
        </div>`;
    } else {
      const choqueCon = otrasSecciones.find(o => o.horarios.some(h1 => cand.horarios.some(h2 => chocan(h1, h2))));
      const descChoque = choqueCon ? `${choqueCon.codigo} · ${choqueCon.nombre} (Sec. ${choqueCon.seccion})` : "otra materia";

      html += `
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:12px 14px;opacity:0.88">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <span style="font-weight:700;font-size:13.5px;color:#991b1b">Sec. ${cand.seccion} (No disponible)</span>
            <span style="font-size:11px;color:#991b1b;font-weight:600;background:#fee2e2;padding:2px 7px;border-radius:6px">Cruce</span>
          </div>
          <div style="font-size:12px;color:#7f1d1d;line-height:1.4">
            <b>Cruce detectado con:</b> ${descChoque}<br>
            <b>Docente:</b> ${cand.docente}<br>
            <b>Horario:</b> ${cand.horarios.map(h => DIA_CORTO[h.dia] + " " + aHora(h.ini) + "–" + aHora(h.fin)).join(" · ")}
          </div>
        </div>`;
    }
  });

  html += `</div>`;
  cuerpo.innerHTML = html;

  cuerpo.querySelectorAll(".btnModalAplicarSwap").forEach(btn => {
    btn.onclick = () => {
      const targetSec = btn.dataset.sec;
      const targetSecObj = todasDelCurso.find(c => c.seccion === targetSec);
      if (!targetSecObj) return;

      const idxEnSol = sol.secciones.findIndex(c => c.codigo === cod);
      if (idxEnSol !== -1) {
        sol.secciones[idxEnSol] = targetSecObj;
      }

      // Recalcular métricas
      const m = metricas(sol.secciones);
      sol.porDia = m.porDia;
      sol.dias = m.dias;
      sol.huecoTotal = m.huecoTotal;
      sol.huecoMax = m.huecoMax;
      sol.minutosClase = m.minutosClase;
      sol.noDispo = sol.secciones.filter(sec => docPrefs.get(sec.docente) === 'no_disponible').length;
      sol.conDispo = sol.secciones.filter(sec => docPrefs.get(sec.docente) === 'disponible').length;
      sol.personalizado = true;

      // Re-renderizar tarjeta
      const cardEl = $(`#res-tarjeta-${solIdx}`);
      if (cardEl) {
        const temp = document.createElement("div");
        temp.innerHTML = tarjetaResultadoArmador(sol, solIdx, E.colorMap, E.ultimoFiltro);
        const nuevaCard = temp.firstElementChild;
        nuevaCard.classList.add("card-updated");
        cardEl.replaceWith(nuevaCard);
        vincularEventosResultados();
      }

      sincronizarPlanesConSolucion(solIdx);
      cerrarModalCambioSeccion();
    };
  });

  modal.classList.remove("hide");
}

function cerrarModalCambioSeccion() {
  const modal = $("#modalCambiarSeccion");
  if (modal) modal.classList.add("hide");
}

/* =========================================================
   MÓDULO: PLANES DE RESPALDO (PLAN A, PLAN B, PLAN C)
   ========================================================= */

function alternarPlanRespaldo(letra, solIdx) {
  const E = AppState.armador;
  const sol = E.soluciones[solIdx];
  if (!sol) return;

  const actual = E.planesRespaldo[letra];
  if (actual && actual.solIdx === solIdx) {
    E.planesRespaldo[letra] = null;
  } else {
    const cred = sol.secciones.reduce((t, x) => t + x.creditos, 0);
    const diasUso = DIAS.filter(d => sol.porDia[d]);
    E.planesRespaldo[letra] = {
      letra,
      solIdx,
      numOpcion: solIdx + 1,
      creditos: cred,
      dias: sol.dias,
      diasNombres: diasUso.map(d => DIA_CORTO[d]),
      minutosClase: sol.minutosClase,
      huecoTotal: sol.huecoTotal,
      personalizado: !!sol.personalizado,
      secciones: sol.secciones.map(sec => ({
        codigo: sec.codigo,
        nombre: sec.nombre,
        seccion: sec.seccion,
        docente: sec.docente,
        creditos: sec.creditos,
        horarios: sec.horarios.map(h => ({
          dia: h.dia,
          ini: h.ini,
          fin: h.fin,
          aula: h.aula || ""
        }))
      })),
      fecha: Date.now()
    };
  }

  guardarPlanesRespaldoEnStorage(E.planesRespaldo);
  actualizarUIPlanesRespaldo();
}

function sincronizarPlanesConSolucion(solIdx) {
  const E = AppState.armador;
  const sol = E.soluciones[solIdx];
  if (!sol) return;

  let huboCambio = false;
  ['A', 'B', 'C'].forEach(letra => {
    if (E.planesRespaldo[letra] && E.planesRespaldo[letra].solIdx === solIdx) {
      const cred = sol.secciones.reduce((t, x) => t + x.creditos, 0);
      const diasUso = DIAS.filter(d => sol.porDia[d]);
      E.planesRespaldo[letra].creditos = cred;
      E.planesRespaldo[letra].dias = sol.dias;
      E.planesRespaldo[letra].diasNombres = diasUso.map(d => DIA_CORTO[d]);
      E.planesRespaldo[letra].minutosClase = sol.minutosClase;
      E.planesRespaldo[letra].huecoTotal = sol.huecoTotal;
      E.planesRespaldo[letra].personalizado = true;
      E.planesRespaldo[letra].secciones = sol.secciones.map(sec => ({
        codigo: sec.codigo,
        nombre: sec.nombre,
        seccion: sec.seccion,
        docente: sec.docente,
        creditos: sec.creditos,
        horarios: sec.horarios.map(h => ({
          dia: h.dia,
          ini: h.ini,
          fin: h.fin,
          aula: h.aula || ""
        }))
      }));
      huboCambio = true;
    }
  });

  if (huboCambio) {
    guardarPlanesRespaldoEnStorage(E.planesRespaldo);
    renderizarPanelPlanesRespaldo();
  }
}

function actualizarUIPlanesRespaldo() {
  const E = AppState.armador;
  const planes = E.planesRespaldo;

  $$(".res").forEach(card => {
    const idx = +card.dataset.idx;
    const esPlanA = planes.A && planes.A.solIdx === idx;
    const esPlanB = planes.B && planes.B.solIdx === idx;
    const esPlanC = planes.C && planes.C.solIdx === idx;

    const btnA = card.querySelector('.btn-plan-tag[data-plan="A"]');
    const btnB = card.querySelector('.btn-plan-tag[data-plan="B"]');
    const btnC = card.querySelector('.btn-plan-tag[data-plan="C"]');
    if (btnA) btnA.classList.toggle("active", !!esPlanA);
    if (btnB) btnB.classList.toggle("active", !!esPlanB);
    if (btnC) btnC.classList.toggle("active", !!esPlanC);

    const slotBadge = card.querySelector(`.slot-badge-plan-${idx}`);
    if (slotBadge) {
      let badgesHtml = '';
      if (esPlanA) badgesHtml += `<span class="badge badge-plan badge-plan-a">PLAN A</span> `;
      if (esPlanB) badgesHtml += `<span class="badge badge-plan badge-plan-b">PLAN B</span> `;
      if (esPlanC) badgesHtml += `<span class="badge badge-plan badge-plan-c">PLAN C</span> `;
      slotBadge.innerHTML = badgesHtml;
    }
  });

  renderizarPanelPlanesRespaldo();
}

function renderizarPanelPlanesRespaldo() {
  const E = AppState.armador;
  const panel = $("#panelPlanesRespaldo");
  const grid = $("#planesGrid");
  const btnComparar = $("#btnCompararPlanes");
  const btnCopiarTodos = $("#btnCopiarTodosPlanes");
  if (!panel || !grid) return;

  const planes = E.planesRespaldo || { A: null, B: null, C: null };
  const guardadosCount = ['A', 'B', 'C'].filter(k => planes[k] !== null).length;

  if (guardadosCount === 0 && (!E.soluciones || E.soluciones.length === 0)) {
    panel.classList.add("hide");
    return;
  }

  panel.classList.remove("hide");

  if (btnComparar) {
    btnComparar.style.display = guardadosCount >= 2 ? "inline-flex" : "none";
  }
  if (btnCopiarTodos) {
    btnCopiarTodos.style.display = guardadosCount >= 1 ? "inline-flex" : "none";
  }

  const slots = [
    { letra: 'A', tag: 'Plan A', classTag: 'tag-a', classPlan: 'plan-a' },
    { letra: 'B', tag: 'Plan B', classTag: 'tag-b', classPlan: 'plan-b' },
    { letra: 'C', tag: 'Plan C', classTag: 'tag-c', classPlan: 'plan-c' }
  ];

  grid.innerHTML = slots.map(s => {
    const p = planes[s.letra];
    if (!p) {
      return `
        <div class="plan-slot plan-slot-empty">
          <div class="plan-slot-tag ${s.classTag}">${s.tag}</div>
          <span style="font-size:12px;color:var(--muted);font-weight:600;margin-bottom:4px">Sin asignar</span>
          <p class="plan-slot-hint">Elige un horario en los resultados y pulsa "+ ${s.letra}" para guardarlo aquí.</p>
        </div>`;
    }

    const pills = p.secciones.map(sec => `<span class="sec-pill" title="${sec.nombre} (${sec.docente})"><b>${sec.codigo}</b>: Sec. ${sec.seccion}</span>`).join('');
    return `
      <div class="plan-slot plan-slot-filled ${s.classPlan}">
        <div>
          <div class="plan-slot-header">
            <span class="plan-slot-tag ${s.classTag}">${s.tag}</span>
            <span class="plan-slot-ref">Opción ${p.numOpcion}</span>
            <button class="btn-quitar-plan" data-quitar-plan="${s.letra}" title="Quitar este plan">✕</button>
          </div>
          <div class="plan-slot-metrics">
            <b>${p.creditos} créd.</b> · ${p.dias} días · ${p.huecoTotal ? hh(p.huecoTotal) + ' muertas' : 'sin horas muertas'}
          </div>
          <div class="plan-slot-secciones">
            ${pills}
          </div>
        </div>
        <div class="plan-slot-actions">
          <button class="btn-slot-action btnVerPlan" data-ver-plan="${s.letra}">Ver en lista</button>
          <button class="btn-slot-action btnCopiarPlan" data-copiar-plan="${s.letra}">Copiar SUM</button>
        </div>
      </div>`;
  }).join('');

  // Eventos de botones dentro del panel
  grid.querySelectorAll("[data-quitar-plan]").forEach(btn => {
    btn.onclick = () => {
      const letra = btn.dataset.quitarPlan;
      E.planesRespaldo[letra] = null;
      guardarPlanesRespaldoEnStorage(E.planesRespaldo);
      actualizarUIPlanesRespaldo();
    };
  });

  grid.querySelectorAll("[data-ver-plan]").forEach(btn => {
    btn.onclick = () => {
      const letra = btn.dataset.verPlan;
      const p = E.planesRespaldo[letra];
      if (!p) return;
      const tarjeta = $(`#res-tarjeta-${p.solIdx}`);
      if (tarjeta) {
        tarjeta.scrollIntoView({ behavior: "smooth", block: "center" });
        tarjeta.classList.remove("card-flash-highlight");
        void tarjeta.offsetWidth; // trigger reflow
        tarjeta.classList.add("card-flash-highlight");
      } else {
        alert(`Este plan corresponde a la Opción ${p.numOpcion}, la cual fue armada con filtros previos.`);
      }
    };
  });

  grid.querySelectorAll("[data-copiar-plan]").forEach(btn => {
    btn.onclick = () => {
      const letra = btn.dataset.copiarPlan;
      copiarPlanAlPortapapeles(letra, btn);
    };
  });
}

function generarTextoPlan(planObj) {
  if (!planObj) return '';
  const lineas = [
    `${planObj.letra === 'A' ? 'PLAN A' : (planObj.letra === 'B' ? 'PLAN B' : 'PLAN C')} — MATRÍCULA SUM UNMSM`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
  ];
  planObj.secciones.forEach(sec => {
    const doc = sec.docente && sec.docente !== 'SIN DOCENTE ASIGNADO' ? ` · Prof: ${sec.docente}` : '';
    const horariosTxt = sec.horarios.map(h => `${DIA_CORTO[h.dia]} ${aHora(h.ini)}-${aHora(h.fin)}${h.aula && h.aula !== '--' ? ' [' + h.aula + ']' : ''}`).join(', ');
    lineas.push(`• [${sec.codigo}] ${sec.nombre}`);
    lineas.push(`  ↳ Sec. ${sec.seccion}${doc}`);
    lineas.push(`  ↳ Horario: ${horariosTxt}`);
  });
  lineas.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lineas.push(`Total: ${planObj.creditos} créditos · ${planObj.dias} días de clase · ${planObj.huecoTotal ? hh(planObj.huecoTotal) + ' muertas' : 'sin horas muertas'}`);
  return lineas.join('\n');
}

async function copiarPlanAlPortapapeles(letra, boton) {
  const p = AppState.armador.planesRespaldo[letra];
  if (!p) return;
  const texto = generarTextoPlan(p);
  try {
    await navigator.clipboard.writeText(texto);
    if (boton) {
      const orig = boton.innerHTML;
      boton.innerHTML = "✅ ¡Copiado!";
      setTimeout(() => { boton.innerHTML = orig; }, 2000);
    }
  } catch (err) {
    alert("Error al copiar: " + err.message);
  }
}

async function copiarTodosLosPlanes(boton) {
  const planes = AppState.armador.planesRespaldo;
  const textos = ['A', 'B', 'C'].filter(k => planes[k] !== null).map(k => generarTextoPlan(planes[k]));
  if (!textos.length) return;
  const textoCompleto = textos.join('\n\n\n');
  try {
    await navigator.clipboard.writeText(textoCompleto);
    if (boton) {
      const orig = boton.innerHTML;
      boton.innerHTML = "✅ ¡Copiado!";
      setTimeout(() => { boton.innerHTML = orig; }, 2000);
    }
  } catch (err) {
    alert("Error al copiar: " + err.message);
  }
}

function abrirModalCompararPlanes() {
  const planes = AppState.armador.planesRespaldo;
  const activos = ['A', 'B', 'C'].filter(k => planes[k] !== null);
  if (activos.length < 2) {
    alert("Guarda al menos 2 planes (por ejemplo, Plan A y Plan B) para poder compararlos.");
    return;
  }

  const modal = $("#modalCompararPlanes");
  const cuerpo = $("#modalCompararCuerpo");
  if (!modal || !cuerpo) return;

  const mapaCursos = new Map();
  activos.forEach(letra => {
    planes[letra].secciones.forEach(sec => {
      if (!mapaCursos.has(sec.codigo)) {
        mapaCursos.set(sec.codigo, { nombre: sec.nombre, creditos: sec.creditos });
      }
    });
  });

  const codigos = [...mapaCursos.keys()].sort();

  let html = `<div style="overflow-x:auto"><table class="tabla-comparacion">`;
  html += `<thead><tr><th style="min-width:180px">Asignatura</th>`;
  activos.forEach(letra => {
    const p = planes[letra];
    const tag = letra === 'A' ? 'Plan A' : (letra === 'B' ? 'Plan B' : 'Plan C');
    const colClass = `col-plan-${letra.toLowerCase()}`;
    html += `<th class="${colClass}" style="min-width:210px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:6px">
        <span>${tag}</span>
        <button class="btn sm outline btnCopiarPlanModal" data-plan="${letra}" style="font-size:11px;padding:2px 8px">Copiar</button>
      </div>
      <div style="font-size:11px;font-weight:400;color:var(--muted);margin-top:2px">Opción ${p.numOpcion} · ${p.creditos} cred · ${p.dias} días</div>
    </th>`;
  });
  html += `</tr></thead><tbody>`;

  codigos.forEach(cod => {
    const infoCurso = mapaCursos.get(cod);
    html += `<tr><td><b>${cod}</b><br><span style="font-size:11.5px;color:var(--ink-soft)">${infoCurso.nombre}</span><br><span style="font-size:11px;color:var(--muted)">${infoCurso.creditos} créd.</span></td>`;

    const secRef = planes.A ? planes.A.secciones.find(s => s.codigo === cod) : null;

    activos.forEach(letra => {
      const p = planes[letra];
      const sec = p.secciones.find(s => s.codigo === cod);
      const colClass = `col-plan-${letra.toLowerCase()}`;

      if (!sec) {
        html += `<td class="${colClass}"><span style="color:var(--muted);font-style:italic">No incluida</span></td>`;
        return;
      }

      const esDiferenteDeA = letra !== 'A' && secRef && sec.seccion !== secRef.seccion;
      const tagDiff = esDiferenteDeA ? `<span style="background:#fef3c7;color:#92400e;font-size:10px;font-weight:700;padding:1px 5px;border-radius:4px;margin-left:4px">Sec. alterna</span>` : '';
      const doc = sec.docente && sec.docente !== 'SIN DOCENTE ASIGNADO' ? sec.docente : '<span style="color:var(--muted)">Sin docente</span>';
      const hor = sec.horarios.map(h => `${DIA_CORTO[h.dia]} ${aHora(h.ini)}-${aHora(h.fin)}`).join('<br>');

      html += `<td class="${colClass}">
        <div style="display:flex;align-items:center;gap:4px">
          <b style="color:var(--color-primary)">Sec. ${sec.seccion}</b>
          ${tagDiff}
        </div>
        <div style="font-size:11.5px;color:var(--ink);margin:3px 0 2px 0">Docente: ${doc}</div>
        <div style="font-size:11px;color:var(--muted);line-height:1.3">Horario: ${hor}</div>
      </td>`;
    });
    html += `</tr>`;
  });

  html += `<tr style="background:#f8fafc;font-weight:700"><td>Resumen de Carga</td>`;
  activos.forEach(letra => {
    const p = planes[letra];
    const colClass = `col-plan-${letra.toLowerCase()}`;
    html += `<td class="${colClass}" style="font-size:12px">
      ${p.creditos} créditos<br>
      ${p.dias} días de clase<br>
      ${p.huecoTotal ? hh(p.huecoTotal) + ' muertas' : 'Sin horas muertas'}
    </td>`;
  });
  html += `</tr>`;

  html += `</tbody></table></div>`;
  cuerpo.innerHTML = html;

  cuerpo.querySelectorAll(".btnCopiarPlanModal").forEach(btn => {
    btn.onclick = () => {
      const letra = btn.dataset.plan;
      copiarPlanAlPortapapeles(letra, btn);
    };
  });

  modal.classList.remove("hide");
}

function cerrarModalCompararPlanes() {
  const modal = $("#modalCompararPlanes");
  if (modal) modal.classList.add("hide");
}

function tarjetaResultadoArmador(s, i, color, f) {
  const cred = s.secciones.reduce((t, x) => t + x.creditos, 0);
  const diasUso = DIAS.filter(d => s.porDia[d]);
  const docPrefs = (f && f.docPrefs) || new Map();

  const noDispo = s.noDispo || 0;
  const conDispo = s.conDispo || 0;

  const badgePrefs = noDispo > 0
    ? `<span class="badge" style="background:#fee2e2;color:#991b1b;border:1px solid #fca5a5">${noDispo} doc. baja prioridad</span>`
    : (conDispo > 0 ? `<span class="badge" style="background:#d1fae5;color:#065f46;border:1px solid #86efac">Prioridad alta</span>` : '');

  const badgePersonalizado = s.personalizado
    ? `<span class="badge" style="background:#e0e7ff;color:#3730a3;border:1px solid #c7d2fe">Personalizado</span>`
    : '';

  const planes = (AppState.armador && AppState.armador.planesRespaldo) || {};
  let badgePlan = '';
  const esPlanA = planes.A && planes.A.solIdx === i;
  const esPlanB = planes.B && planes.B.solIdx === i;
  const esPlanC = planes.C && planes.C.solIdx === i;
  if (esPlanA) badgePlan += `<span class="badge badge-plan badge-plan-a">PLAN A</span>`;
  if (esPlanB) badgePlan += `<span class="badge badge-plan badge-plan-b">PLAN B</span>`;
  if (esPlanC) badgePlan += `<span class="badge badge-plan badge-plan-c">PLAN C</span>`;

  const maxCredReg = obtenerLimiteCreditosMax();
  const badgeCredHtml = cred > maxCredReg
    ? `<span class="badge" style="background:#fee2e2;color:#991b1b;border:1px solid #fca5a5" title="Supera el tope de ${maxCredReg} créditos">${cred} créditos (Excedido)</span>`
    : `<span class="badge g">${cred} créditos</span>`;

  return `
    <div class="res" id="res-tarjeta-${i}" data-idx="${i}">
      <div class="print-only print-header-institucional">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #0284c7;padding-bottom:6px;margin-bottom:12px;">
          <div>
            <div style="font-size:13.5px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px">Universidad Nacional Mayor de San Marcos</div>
            <div style="font-size:11.5px;color:#475569">Facultad de Química e Ingeniería Química · Armador de Horarios</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:13px;font-weight:700;color:#0284c7">Horario Académico — Opción ${i + 1}</div>
            <div style="font-size:11px;color:#64748b">${cred} créditos · ${s.dias} día(s) de clase · ${hh(s.minutosClase)}</div>
          </div>
        </div>
      </div>
      <header>
        <h3>Opción ${i + 1}</h3>
        ${badgeCredHtml}
        <span class="badge">${s.dias} día(s): ${diasUso.map(d => DIA_CORTO[d]).join(", ")}</span>
        <span class="badge">${hh(s.minutosClase)} de clase</span>
        <span class="badge ${s.huecoTotal === 0 ? "g" : ""}">${s.huecoTotal ? hh(s.huecoTotal) + " muertas" : "sin horas muertas"}</span>
        ${badgePrefs}
        ${badgePersonalizado}
        <span class="slot-badge-plan-${i}">${badgePlan}</span>
        <div class="acciones-tarjeta noprint">
          <div class="planes-selector">
            <span class="label-plan">Plan:</span>
            <button class="btn-plan-tag btn-plan-a ${esPlanA ? 'active' : ''}" data-sol-idx="${i}" data-plan="A" title="${esPlanA ? 'Quitar de Plan A' : 'Guardar como Plan A'}">Plan A</button>
            <button class="btn-plan-tag btn-plan-b ${esPlanB ? 'active' : ''}" data-sol-idx="${i}" data-plan="B" title="${esPlanB ? 'Quitar de Plan B' : 'Guardar como Plan B'}">Plan B</button>
            <button class="btn-plan-tag btn-plan-c ${esPlanC ? 'active' : ''}" data-sol-idx="${i}" data-plan="C" title="${esPlanC ? 'Quitar de Plan C' : 'Guardar como Plan C'}">Plan C</button>
          </div>
          <button class="btn gold sm btnActivarHorario noprint" data-sol-idx="${i}">
            Activar
          </button>
          <button class="btn sec sm btnImprimirTarjeta noprint" data-sol-idx="${i}" title="Imprimir solo este horario">
            Imprimir
          </button>
        </div>
      </header>
      <div class="cuerpo">
        <div class="calwrap">${calendarioResultadoArmador(s, color, i)}</div>
        <div class="res-tabla-wrap noprint">${tablaResultadoArmador(s, color, f, i)}</div>
      </div>
    </div>
  `;
}

function calendarioResultadoArmador(s, color, solIdx) {
  const diasUso = DIAS.filter(d => s.porDia[d]);
  let min = 1e9, max = 0;
  diasUso.forEach(d => s.porDia[d].forEach(b => { min = Math.min(min, b.ini); max = Math.max(max, b.fin); }));
  min = Math.floor(min / 60) * 60; max = Math.ceil(max / 60) * 60;
  const filas = (max - min) / 30, alto = 20;

  let h = `<div class="cal"><div class="calgrid" style="grid-template-columns:42px repeat(${diasUso.length},1fr);grid-template-rows:24px repeat(${filas},${alto}px)">`;
  h += '<div class="hd"></div>' + diasUso.map(d => `<div class="hd">${DIA_CORTO[d]}</div>`).join("");
  for (let r = 0; r < filas; r++) {
    const m = min + r * 30;
    h += `<div class="hr">${m % 60 === 0 ? aHora(m) : ""}</div>`;
    for (let c = 0; c < diasUso.length; c++) h += '<div class="cel"></div>';
  }
  h += '</div>';

  diasUso.forEach((d, ci) => s.porDia[d].forEach(b => {
    const top = 24 + ((b.ini - min) / 30) * alto;
    const alt = ((b.fin - b.ini) / 30) * alto - 2;
    const left = `calc(42px + ${ci} * ((100% - 42px)/${diasUso.length}))`;
    const w = `calc((100% - 42px)/${diasUso.length})`;
    const solAttr = solIdx !== undefined ? `data-sol-idx="${solIdx}"` : '';
    h += `<div class="blq blq-interactivo" ${solAttr} data-cod="${b.ref.codigo}" data-sec="${b.ref.seccion}" title="Haz clic para cambiar sección de ${b.ref.nombre} (Sec. ${b.ref.seccion})" style="top:${top}px;height:${alt}px;left:${left};width:${w};background:${color[b.ref.codigo]}">` +
      `<b>${b.ref.nombre} (${b.ref.seccion})</b>${aHora(b.ini)}–${aHora(b.fin)}</div>`;
  }));
  return h + '</div>';
}

function tablaResultadoArmador(s, color, f, solIdx) {
  const ord = s.secciones.slice().sort((a, b) => a.codigo.localeCompare(b.codigo));
  const docPrefs = (f && f.docPrefs) || new Map();
  const poolCursos = delCicloArmador();

  return `<table><thead><tr><th>Asignatura</th><th style="min-width:140px">Sec. (Cambiar)</th><th>Docente</th><th>Horario</th><th>Vac.</th></tr></thead><tbody>` +
    ord.map(x => {
      const pref = docPrefs.get(x.docente);
      const docBadge = pref === 'disponible'
        ? ` <span style="background:#d1fae5;color:#065f46;padding:1px 6px;border-radius:10px;font-size:10.5px;font-weight:700;white-space:nowrap">Prioridad</span>`
        : (pref === 'no_disponible'
          ? ` <span style="background:#fee2e2;color:#991b1b;padding:1px 6px;border-radius:10px;font-size:10.5px;font-weight:700;white-space:nowrap">Baja prioridad</span>`
          : '');

      const todasDelCurso = poolCursos.filter(c => c.codigo === x.codigo);
      let secHTML = `<b>${x.seccion}</b>`;

      if (todasDelCurso.length > 1 && solIdx !== undefined) {
        const otrasSecciones = s.secciones.filter(c => c.codigo !== x.codigo);
        const dispoOpciones = [];
        const cruceOpciones = [];

        todasDelCurso.forEach(cand => {
          const esActual = cand.seccion === x.seccion;
          const cruza = !esActual && chocaConLista(cand, otrasSecciones);
          const profCorto = cand.docente && cand.docente !== 'SIN DOCENTE ASIGNADO' ? ' · ' + cand.docente.split(',')[0] : '';
          const diasTxt = ' (' + cand.horarios.map(h => DIA_CORTO[h.dia].slice(0, 3) + ' ' + aHora(h.ini) + '-' + aHora(h.fin)).join(', ') + ')';
          const prefDoc = docPrefs.get(cand.docente);
          const starDoc = prefDoc === 'disponible' ? ' [Prioritaria]' : (prefDoc === 'no_disponible' ? ' [Baja prioridad]' : '');

          if (esActual) {
            dispoOpciones.unshift(`<option value="${cand.seccion}" selected style="font-weight:700;color:#0284c7">Sec. ${cand.seccion} (Actual)${profCorto}</option>`);
          } else if (cruza) {
            cruceOpciones.push(`<option value="${cand.seccion}" disabled style="color:#94a3b8;background:#f8fafc">Sec. ${cand.seccion} [Cruce con otra clase]${diasTxt}</option>`);
          } else {
            dispoOpciones.push(`<option value="${cand.seccion}" style="color:#0f172a">Cambiar a Sec. ${cand.seccion}${starDoc}${profCorto}${diasTxt}</option>`);
          }
        });

        secHTML = `<select class="sel-swap-seccion noprint" data-sol-idx="${solIdx}" data-cod="${x.codigo}" title="Cambiar sección de ${x.nombre}">
          <optgroup label="Secciones disponibles (sin cruces)">
            ${dispoOpciones.join('')}
          </optgroup>
          ${cruceOpciones.length ? `
          <optgroup label="No disponibles (generan cruce)">
            ${cruceOpciones.join('')}
          </optgroup>` : ''}
        </select><span class="print-only">Sec. ${x.seccion}</span>`;
      }

      return `<tr>
        <td><span class="pt" style="background:${color[x.codigo]}"></span><b>${x.codigo}</b><br><span class="m" style="color:var(--muted);font-size:12px">${x.nombre}</span></td>
        <td>${secHTML}</td>
        <td style="font-size:12.5px">${x.docente}${docBadge}</td>
        <td style="font-size:12.5px">${x.horarios.map(h => DIA_CORTO[h.dia] + " " + aHora(h.ini) + "–" + aHora(h.fin)).join("<br>")}</td>
        <td style="font-size:12.5px;white-space:nowrap">${x.tope && x.matriculados ? (x.tope - x.matriculados) : "—"}</td>
      </tr>`;
    }).join("") +
    '</tbody></table>';
}

function diagnosticoInteligente({ activos = [], vacios = [], f, lista = [], codigos = [] }) {
  const E = AppState.armador;
  let html = `<div class="card-diagnostico">`;

  // Encabezado
  html += `
    <div class="diagnostico-header">
      <div class="diagnostico-header-icon" style="font-weight:700;color:#991b1b;font-size:18px">!</div>
      <div>
        <h3 style="margin:0;font-size:16px;font-weight:700;color:#991b1b">Diagnóstico: No existe ninguna combinación sin cruces</h3>
        <p style="margin:2px 0 0;font-size:12.5px;color:#7f1d1d">Analizamos tus ${codigos.length} asignaturas seleccionadas y las restricciones actuales para encontrar el motivo exacto.</p>
      </div>
    </div>
    <div class="diagnostico-cuerpo">`;

  // 1. Asignaturas eliminadas completamente por filtros
  if (vacios.length > 0) {
    html += `
      <div class="diagnostico-bloque" style="border-left:4px solid #ef4444">
        <div class="diagnostico-bloque-titulo" style="color:#b91c1c">
          ${vacios.length} Asignatura(s) descartada(s) por los filtros actuales
        </div>
        <p style="font-size:12.5px;color:var(--muted);margin:0 0 10px">Ninguna de sus secciones cumplió los días permitidos o rango de horas:</p>`;

    vacios.forEach(g => {
      const todasSecs = lista.filter(c => c.codigo === g.codigo);
      const secFijada = E.seccionesFijadas.get(g.codigo);

      const motivos = [];
      if (secFijada) {
        motivos.push(`Tenías fijada la <b>Sec. ${secFijada}</b> pero no cumple tus filtros de día u hora`);
      }

      const diasFuera = new Set();
      let muyTemprano = false;
      let muyTarde = false;

      todasSecs.forEach(sec => {
        sec.horarios.forEach(h => {
          if (!f.dias.has(h.dia)) diasFuera.add(DIA_CORTO[h.dia] || h.dia);
          if (h.ini < f.horaMin) muyTemprano = true;
          if (h.fin > f.horaMax) muyTarde = true;
        });
      });

      if (diasFuera.size > 0) {
        motivos.push(`Requiere clases en días no permitidos: <b>${[...diasFuera].join(", ")}</b>`);
      }
      if (muyTemprano) {
        motivos.push(`Inicia antes de las <b>${aHora(f.horaMin)}</b>`);
      }
      if (muyTarde) {
        motivos.push(`Termina después de las <b>${aHora(f.horaMax)}</b>`);
      }

      html += `
        <div style="background:#ffffff;border:1px solid var(--line);border-radius:8px;padding:9px 12px;margin-bottom:6px">
          <div style="font-weight:700;font-size:13px;color:var(--ink)">${g.codigo} · ${g.nombre} (${todasSecs.length} sección/es registradas en SUM)</div>
          <div style="font-size:12px;color:#b91c1c;margin-top:3px">${motivos.join(' · ')}</div>
        </div>`;
    });

    html += `</div>`;
  }

  // 2. Cruces inevitables entre pares de asignaturas activas
  const culpablesPares = [];
  const conteoCulpables = {};
  codigos.forEach(c => conteoCulpables[c] = 0);

  for (let a = 0; a < activos.length; a++) {
    for (let b = a + 1; b < activos.length; b++) {
      let compatible = false;
      const choquesParesDetalle = [];

      for (const s1 of activos[a].secciones) {
        for (const s2 of activos[b].secciones) {
          const choca = s1.horarios.some(h1 => s2.horarios.some(h2 => chocan(h1, h2)));
          if (!choca) {
            compatible = true;
            break;
          } else {
            const hChoque1 = s1.horarios.find(h1 => s2.horarios.some(h2 => chocan(h1, h2)));
            const hChoque2 = s2.horarios.find(h2 => chocan(hChoque1, h2));
            if (hChoque1 && hChoque2) {
              choquesParesDetalle.push({
                sec1: s1.seccion,
                sec2: s2.seccion,
                dia: DIA_CORTO[hChoque1.dia] || hChoque1.dia,
                ini: Math.max(hChoque1.ini, hChoque2.ini),
                fin: Math.min(hChoque1.fin, hChoque2.fin)
              });
            }
          }
        }
        if (compatible) break;
      }

      if (!compatible) {
        culpablesPares.push({
          cursoA: activos[a],
          cursoB: activos[b],
          detalles: choquesParesDetalle.slice(0, 3)
        });
        conteoCulpables[activos[a].codigo] = (conteoCulpables[activos[a].codigo] || 0) + 1;
        conteoCulpables[activos[b].codigo] = (conteoCulpables[activos[b].codigo] || 0) + 1;
      }
    }
  }

  if (culpablesPares.length > 0) {
    html += `
      <div class="diagnostico-bloque" style="border-left:4px solid #ea580c">
        <div class="diagnostico-bloque-titulo" style="color:#c2410c">
          Cruces inevitables detectados (${culpablesPares.length} conflicto(s))
        </div>
        <p style="font-size:12.5px;color:var(--muted);margin:0 0 10px">
          Todas las secciones disponibles de las siguientes materias se sobreponen entre sí:
        </p>`;

    culpablesPares.forEach(({ cursoA, cursoB, detalles }) => {
      const detalleTexto = detalles.map(d =>
        `Sec. ${d.sec1} con Sec. ${d.sec2} chocan el <b>${d.dia} ${aHora(d.ini)}–${aHora(d.fin)}</b>`
      ).join(' · ');

      html += `
        <div class="cruce-card">
          <div style="font-weight:700;color:#9a3412">
            <b>${cursoA.codigo}</b> (${cursoA.nombre}) ⟷ <b>${cursoB.codigo}</b> (${cursoB.nombre})
          </div>
          <div style="font-size:12px;color:#7c2d12;margin-top:3px">${detalleTexto}</div>
        </div>`;
    });

    html += `</div>`;
  } else if (activos.length >= 3) {
    html += `
      <div class="diagnostico-bloque" style="border-left:4px solid #d97706">
        <div class="diagnostico-bloque-titulo" style="color:#b45309">
          Choque compuesto en cadena (3 o más asignaturas)
        </div>
        <p style="font-size:12.5px;color:var(--ink-soft);margin:0">
          Ningún par choca por sí solo de forma absoluta, pero al combinar 3 o más asignaturas juntas, las opciones de secciones compatibles se agotan y generan cruce.
        </p>
      </div>`;
  }

  // 3. Sugerencias Inteligentes con 1 Clic (Quick Fixes)
  const sugerencias = [];

  // Sugerencia A: Días no habilitados (ej. Sábado)
  const diasNoPermitidos = DIAS.slice(0, 6).filter(d => !f.dias.has(d));
  diasNoPermitidos.forEach(dia => {
    const secsEnDia = lista.filter(c => c.horarios.some(h => h.dia === dia));
    if (secsEnDia.length > 0) {
      sugerencias.push({
        titulo: `Habilitar el día <b>${DIA_CORTO[dia]}</b>`,
        descripcion: `Existen ${secsEnDia.length} sección(es) que tienen clases el ${DIA_CORTO[dia]} y que actualmente están bloqueadas.`,
        botonHtml: `<button class="btn-fix-filtro" data-action="habilitar-dia" data-dia="${dia}">Habilitar ${DIA_CORTO[dia]} y Reintentar</button>`
      });
    }
  });

  // Sugerencia B: Ampliar rango de horas
  if (f.horaMin > 7 * 60) {
    sugerencias.push({
      titulo: `Comenzar clases más temprano (desde las <b>07:00</b>)`,
      descripcion: `Tu hora mínima actual es ${aHora(f.horaMin)}. Ampliar a las 07:00 rescataría secciones matutinas.`,
      botonHtml: `<button class="btn-fix-filtro" data-action="ampliar-hora" data-hmin="${7 * 60}" data-hmax="${f.horaMax}">Iniciar desde 07:00</button>`
    });
  }
  if (f.horaMax < 22 * 60) {
    sugerencias.push({
      titulo: `Terminar clases más tarde (hasta las <b>22:00</b>)`,
      descripcion: `Tu hora máxima actual es ${aHora(f.horaMax)}. Ampliar hasta las 22:00 permite incluir turnos noche sin cruces.`,
      botonHtml: `<button class="btn-fix-filtro" data-action="ampliar-hora" data-hmin="${f.horaMin}" data-hmax="${22 * 60}">Ampliar hasta 22:00</button>`
    });
  }

  // Sugerencia C: Desfijar secciones si alguna está fijada
  if (E.seccionesFijadas.size > 0) {
    E.seccionesFijadas.forEach((sec, cod) => {
      const nomCurso = lista.find(c => c.codigo === cod)?.nombre || cod;
      sugerencias.push({
        titulo: `Desfijar sección fija de <b>${cod}</b> (actualmente fijado en Sec. ${sec})`,
        descripcion: `Permitirá al motor evaluar todas las demás secciones disponibles de ${nomCurso} para encontrar una compatible.`,
        botonHtml: `<button class="btn-fix-filtro" data-action="desfijar-seccion" data-cod="${cod}">Desfijar ${cod} y Reintentar</button>`
      });
    });
  }

  // Sugerencia D: Desmarcar el curso más conflictivo
  const sortedCulpables = Object.entries(conteoCulpables).filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]);
  if (sortedCulpables.length > 0) {
    const peorCod = sortedCulpables[0][0];
    const peorNom = lista.find(c => c.codigo === peorCod)?.nombre || peorCod;
    sugerencias.push({
      titulo: `Desmarcar la asignatura más conflictiva: <b>${peorCod} · ${peorNom}</b>`,
      descripcion: `Esta asignatura participa en ${sortedCulpables[0][1]} cruce(s) directo(s) con tus otras materias.`,
      botonHtml: `<button class="btn-fix-filtro" data-action="desmarcar-curso" data-cod="${peorCod}">Desmarcar ${peorCod} y Reintentar</button>`
    });
  }

  if (sugerencias.length > 0) {
    html += `
      <div class="diagnostico-bloque" style="border-left:4px solid var(--color-primary)">
        <div class="diagnostico-bloque-titulo" style="color:var(--color-primary-dark)">
          Soluciones rápidas recomendadas (Aplica con 1 clic)
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">`;

    sugerencias.forEach(sug => {
      html += `
        <div class="sugerencia-item">
          <div>
            <div style="font-weight:700;color:var(--ink)">${sug.titulo}</div>
            <div style="font-size:12px;color:var(--muted);margin-top:2px">${sug.descripcion}</div>
          </div>
          <div>${sug.botonHtml}</div>
        </div>`;
    });

    html += `</div></div>`;
  }

  // 4. Búsqueda automática de alternativa con N - 1 asignaturas
  if (activos.length >= 3) {
    let mejorOpcionN1 = null;

    // Probar excluir cada curso en orden de conflictividad
    const cursosAProbar = [...activos].sort((a, b) => (conteoCulpables[b.codigo] || 0) - (conteoCulpables[a.codigo] || 0));

    for (const cursoAExcluir of cursosAProbar) {
      const subset = activos.filter(x => x.codigo !== cursoAExcluir.codigo);
      const resN1 = generar(subset, { limite: 20, docPrefs: f.docPrefs });
      if (resN1.soluciones.length > 0) {
        mejorOpcionN1 = {
          cursoExcluido: cursoAExcluir,
          soluciones: resN1.soluciones,
          activosCount: subset.length
        };
        break;
      }
    }

    if (mejorOpcionN1) {
      html += `
        <div class="card-alternativa-n1">
          <div>
            <div style="display:flex;align-items:center;gap:6px">
              <h4 style="margin:0;font-size:14.5px;font-weight:700;color:#065f46">
                ¡Horario disponible con ${mejorOpcionN1.activosCount} de tus ${activos.length} asignaturas!
              </h4>
            </div>
            <p style="margin:4px 0 0;font-size:12.5px;color:#047857">
              Omitiendo temporalmente <b>${mejorOpcionN1.cursoExcluido.codigo} · ${mejorOpcionN1.cursoExcluido.nombre}</b>, pudimos armar <b>${mejorOpcionN1.soluciones.length} combinación(es) válidas</b>.
            </p>
          </div>
          <button class="btn-adoptar-n1" id="btnAdoptarAlternativaN1" data-cod="${mejorOpcionN1.cursoExcluido.codigo}">
            Ver opciones (${mejorOpcionN1.activosCount} cursos)
          </button>
        </div>`;
    }
  }

  // 5. Tabla resumen de secciones sobrevivientes
  if (activos.length > 0) {
    html += `
      <div style="margin-top:4px">
        <details>
          <summary style="font-size:12.5px;font-weight:600;color:var(--muted);cursor:pointer;padding:4px 0">
            Ver tabla técnica de secciones que sobrevivieron a los filtros (${activos.length} asignaturas)
          </summary>
          <div style="margin-top:10px;overflow-x:auto">
            <table><thead><tr><th>Asignatura</th><th>Opciones</th><th>Horarios sobrevivientes</th></tr></thead><tbody>` +
            activos.map(g => `<tr><td><b>${g.codigo}</b><br><span style="color:var(--muted);font-size:12px">${g.nombre}</span></td>` +
              `<td>${g.secciones.length}</td><td style="font-size:12px">` +
              g.secciones.map(s => `<b>Sec. ${s.seccion}:</b> ` + s.horarios.map(x => DIA_CORTO[x.dia] + " " + aHora(x.ini) + "–" + aHora(x.fin)).join(", ")).join("<br>") +
              '</td></tr>').join("") +
            `</tbody></table>
          </div>
        </details>
      </div>`;
  }

  html += `</div></div>`;
  return html;
}

function vincularEventosDiagnostico() {
  $$(".btn-fix-filtro").forEach(btn => {
    btn.onclick = () => {
      const action = btn.dataset.action;
      const E = AppState.armador;

      if (action === "habilitar-dia") {
        const dia = btn.dataset.dia;
        E.dias.add(dia);
        const chip = $(`#dias .chip[data-dia="${dia}"]`);
        if (chip) chip.classList.add("on");
        armarHorarios();
      } else if (action === "ampliar-hora") {
        const hminVal = +btn.dataset.hmin;
        const hmaxVal = +btn.dataset.hmax;
        const hmin = $("#hmin");
        const hmax = $("#hmax");
        if (hmin) hmin.value = hminVal;
        if (hmax) hmax.value = hmaxVal;
        armarHorarios();
      } else if (action === "desfijar-seccion") {
        const cod = btn.dataset.cod;
        E.seccionesFijadas.delete(cod);
        const selPin = $(`#cursos .sel-pin-seccion[data-cod="${cod}"]`);
        if (selPin) {
          selPin.value = "";
          selPin.classList.remove("pinned");
        }
        pintarCursosArmador();
        armarHorarios();
      } else if (action === "desmarcar-curso") {
        const cod = btn.dataset.cod;
        E.sel.delete(cod);
        const chk = $(`#cursos input[data-cod="${cod}"]`);
        if (chk) chk.checked = false;
        resumenArmador();
        pintarDocentesArmador();
        armarHorarios();
      }
    };
  });

  const btnAdoptarN1 = $("#btnAdoptarAlternativaN1");
  if (btnAdoptarN1) {
    btnAdoptarN1.onclick = () => {
      const codExcluir = btnAdoptarN1.dataset.cod;
      const E = AppState.armador;
      E.sel.delete(codExcluir);
      const chk = $(`#cursos input[data-cod="${codExcluir}"]`);
      if (chk) chk.checked = false;
      resumenArmador();
      pintarDocentesArmador();
      armarHorarios();
    };
  }
}

function diagnostico(grupos) {
  return diagnosticoInteligente({ activos: grupos, vacios: [], f: AppState.armador.ultimoFiltro || {}, lista: [], codigos: grupos.map(g => g.codigo) });
}

// Exportar funciones a window para uso en eventos interactivos
window.abrirModalCambioSeccion = abrirModalCambioSeccion;
window.cerrarModalCambioSeccion = cerrarModalCambioSeccion;
