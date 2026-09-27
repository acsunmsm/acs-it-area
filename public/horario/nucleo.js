/* ============ NÚCLEO: parser + motor de combinaciones ============ */
const DIAS = ["LUNES","MARTES","MIERCOLES","JUEVES","VIERNES","SABADO","DOMINGO"];
const DIA_CORTO = {LUNES:"Lunes",MARTES:"Martes",MIERCOLES:"Miércoles",JUEVES:"Jueves",VIERNES:"Viernes",SABADO:"Sábado",DOMINGO:"Domingo"};

const BASURA = ["Página","Documento Verificable","Escanee","REPORTE DE","Código de Matrícula",
  "Nombres y Apellidos","Facultad :","Escuela :","Especialidad :","Plan :",
  "Periodo Académico","Fecha Impresión"];

const LIMITES_DEFECTO = {
  nombre: 170,
  cred: 200,
  sec: 225,
  doc: 375,
  tope: 405,
  matri: 435,
  aula: 460,
  dia: 515
};

function columna(x, limites = LIMITES_DEFECTO){
  if(x < limites.nombre) return "nombre";
  if(x < limites.cred)   return "cred";
  if(x < limites.sec)    return "sec";
  if(x < limites.doc)    return "doc";
  if(x < limites.tope)   return "tope";
  if(x < limites.matri)  return "matri";
  if(x < limites.aula)   return "aula";
  if(x < limites.dia)    return "dia";
  return "hora";
}

const aMin  = h => {const[a,b]=h.split(":").map(Number); return a*60+b;};
const aHora = m => String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");
const hh    = m => (m%60===0) ? (m/60)+" h" : (Math.floor(m/60)+" h "+(m%60)+" min");

/**
 * Limpia y estandariza el nombre del docente extrayendo código si existe
 * y descartando valores vacíos o no asignados.
 */
function extraerDocente(txt){
  if(!txt) return "SIN DOCENTE ASIGNADO";
  let d = txt.replace(/\s+/g, " ").trim();
  if(!d || d === "--" || d === "-" || /^sin docente/i.test(d) || /^por asignar/i.test(d) || /^docente/i.test(d)){
    return "SIN DOCENTE ASIGNADO";
  }
  // Formato con guión: "0A6214 - NOMBRE" o "123456 - NOMBRE"
  const conGuion = d.match(/^[A-Z0-9]{3,10}\s*-\s*(.+)$/i);
  if(conGuion) return conGuion[1].replace(/\s+,/g, ",").replace(/,\s*/g, ", ").trim();

  // Formato con código alfanumérico inicial que contiene números: "0A6214 NOMBRE" o "123456 NOMBRE"
  const conCodigo = d.match(/^(?=[A-Z0-9]*\d)[A-Z0-9]{3,10}\s+(.+)$/i);
  if(conCodigo) return conCodigo[1].replace(/\s+,/g, ",").replace(/,\s*/g, ", ").trim();

  d = d.replace(/\s+,/g, ",").replace(/,\s*/g, ", ").trim();
  if(/^[\d\s\-_.,]+$/.test(d)) return "SIN DOCENTE ASIGNADO";
  return d || "SIN DOCENTE ASIGNADO";
}

function parsearPaginas(paginas){
  const cursos = [];
  let cicloActual = null;
  const ROMANOS = { I:"1", II:"2", III:"3", IV:"4", V:"5", VI:"6", VII:"7", VIII:"8", IX:"9", X:"10", XI:"11", XII:"12" };

  for(const items of paginas){
    // 1. Agrupar fragmentos en líneas por su coordenada Y
    const lineas = new Map();
    for(const it of items){
      const txt = (it.str || "").trim();
      if(!txt) continue;
      const y = Math.round(it.y * 10) / 10;
      if(!lineas.has(y)) lineas.set(y, []);
      lineas.get(y).push({ x: it.x, txt });
    }

    let L = [];
    for(const [y, arr] of lineas){
      arr.sort((a, b) => a.x - b.x);
      const texto = arr.map(w => w.txt).join(" ");
      if(BASURA.some(b => texto.includes(b))) continue;
      if(/^Asignatura\s+(?:Créd|Cred)/i.test(texto)) continue;
      L.push({ y, arr, texto });
    }
    L.sort((a, b) => a.y - b.y);

    // 2. Marcadores de ciclo (se arrastran de página en página)
    const marcas = [];
    L = L.filter(l => {
      const m = l.texto.match(/^(?:CICLO|SEMESTRE)\s*:?\s*([0-9]+|[IVXLCDM]+)$/i);
      if(m){
        let val = m[1].toUpperCase();
        if(ROMANOS[val]) val = ROMANOS[val];
        else val = String(parseInt(val, 10));
        marcas.push({ y: l.y, ciclo: val });
        return false;
      }
      return true;
    });

    // 3. Anclas: cada fila lógica tiene un valor numérico de créditos
    const anclas = [];
    for(const l of L){
      if(l.arr.some(w => columna(w.x) === "cred" && /^\d+(\.\d+)?$/.test(w.txt))){
        anclas.push(l.y);
      }
    }
    if(!anclas.length) continue;

    // 4. La fila ocupa del punto medio con el ancla anterior al punto medio con la siguiente
    for(let i = 0; i < anclas.length; i++){
      const ay = anclas[i];
      const lo = i === 0 ? -1e9 : (anclas[i - 1] + ay) / 2;
      const hi = i === anclas.length - 1 ? 1e9 : (ay + anclas[i + 1]) / 2;
      const celdas = {};

      for(const l of L){
        if(!(l.y > lo && l.y < hi)) continue;
        const porCol = {};
        for(const w of l.arr){
          const c = columna(w.x);
          (porCol[c] = porCol[c] || []).push(w.txt);
        }
        for(const c in porCol){
          (celdas[c] = celdas[c] || []).push({ y: l.y, t: porCol[c].join(" ") });
        }
      }

      for(const m of marcas) if(m.y < ay) cicloActual = m.ciclo;

      const unir = c => (celdas[c] || []).map(o => o.t).join(" ").replace(/\s+/g, " ").trim();
      const nombreCompleto = unir("nombre");
      let docRaw = unir("doc");
      let sec = (celdas.sec || [])[0]?.t || "?";
      let tope = (celdas.tope || [])[0]?.t || "";
      const cred = (celdas.cred || [])[0]?.t || "0";
      const matri = (celdas.matri || [])[0]?.t || "";

      // Auto-recuperación si el docente comenzó ligeramente antes (en la columna sec)
      if(!docRaw && sec && sec.length > 3){
        const matchSec = sec.match(/^(\S+)\s+(.+)$/);
        if(matchSec){
          sec = matchSec[1];
          docRaw = matchSec[2];
        }
      }

      // Auto-recuperación si el docente se extendió a la columna tope
      if(tope && /[A-Za-z]/.test(tope)){
        const matchTope = tope.match(/^(.+?)\s+(\d+)$/);
        if(matchTope){
          docRaw = (docRaw ? docRaw + " " : "") + matchTope[1];
          tope = matchTope[2];
        }
      }

      // Emparejamiento con tolerancia vertical para evitar desfases de decimales
      const horasList = celdas.hora || [];
      const aulasList = celdas.aula || [];
      const horarios = [];

      for(const diaObj of (celdas.dia || []).sort((a, b) => a.y - b.y)){
        const d = diaObj.t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
        if(!DIAS.includes(d)) continue;

        let mejorHora = null, distHoraMin = Infinity;
        for(const hObj of horasList){
          const dist = Math.abs(hObj.y - diaObj.y);
          if(dist < 6 && dist < distHoraMin){
            const mh = hObj.t.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
            if(mh){
              distHoraMin = dist;
              mejorHora = mh;
            }
          }
        }
        if(!mejorHora) continue;

        let aulaTxt = "--", distAulaMin = Infinity;
        for(const aObj of aulasList){
          const dist = Math.abs(aObj.y - diaObj.y);
          if(dist < 6 && dist < distAulaMin){
            distAulaMin = dist;
            aulaTxt = aObj.t.trim() || "--";
          }
        }

        horarios.push({
          dia: d,
          ini: aMin(mejorHora[1]),
          fin: aMin(mejorHora[2]),
          aula: aulaTxt
        });
      }

      const mn = nombreCompleto.match(/^([A-Za-z0-9\-_]{2,12})\s*-\s*(.+)$/);
      const docenteFinal = extraerDocente(docRaw);

      if(!mn || !horarios.length) continue;
      cursos.push({
        ciclo: cicloActual,
        codigo: mn[1],
        nombre: mn[2].trim(),
        creditos: parseFloat(cred),
        seccion: sec,
        docente: docenteFinal,
        tope,
        matriculados: matri,
        horarios
      });
    }
  }
  return cursos;
}

function seccionPasa(sec,f){
  if(f.docentesExcluidos.has(sec.docente)) return false;
  for(const h of sec.horarios){
    if(!f.dias.has(h.dia)) return false;
    if(h.ini<f.horaMin || h.fin>f.horaMax) return false;
  }
  return true;
}

const chocan=(a,b)=>a.dia===b.dia && a.ini<b.fin && b.ini<a.fin;

function chocaConLista(sec,elegidas){
  for(const e of elegidas) for(const h1 of e.horarios) for(const h2 of sec.horarios) if(chocan(h1,h2)) return true;
  return false;
}

function metricas(combo){
  const porDia={};
  for(const s of combo) for(const h of s.horarios) (porDia[h.dia]=porDia[h.dia]||[]).push({...h,ref:s});
  let huecoTotal=0,huecoMax=0,minutosClase=0;
  for(const d in porDia){
    const bl=porDia[d].slice().sort((a,b)=>a.ini-b.ini);
    for(const b of bl) minutosClase+=b.fin-b.ini;
    let fin=bl[0].fin;
    for(let i=1;i<bl.length;i++){
      const g=bl[i].ini-fin;
      if(g>0){huecoTotal+=g; huecoMax=Math.max(huecoMax,g);}
      fin=Math.max(fin,bl[i].fin);
    }
  }
  return {dias:Object.keys(porDia).length,huecoTotal,huecoMax,minutosClase,porDia};
}

function generar(gruposCandidatos,opciones={}){
  const limite=opciones.limite||500;
  const huecoMaxPermitido=opciones.huecoMaxPermitido ?? Infinity;
  const docPrefs=opciones.docPrefs || new Map();
  const grupos=gruposCandidatos.slice().sort((a,b)=>a.secciones.length-b.secciones.length);
  const soluciones=[]; let cortado=false;
  (function bt(i,elegidas){
    if(cortado) return;
    if(i===grupos.length){
      const m=metricas(elegidas);
      if(m.huecoMax<=huecoMaxPermitido){
        // Contar cuántos docentes no-disponibles / disponibles hay en la solución
        const noDispo = elegidas.filter(s => docPrefs.get(s.docente) === 'no_disponible').length;
        const conDispo = elegidas.filter(s => docPrefs.get(s.docente) === 'disponible').length;
        soluciones.push({secciones:elegidas.slice(),...m,noDispo,conDispo});
        if(soluciones.length>=limite) cortado=true;
      }
      return;
    }
    for(const sec of grupos[i].secciones){
      if(chocaConLista(sec,elegidas)) continue;
      elegidas.push(sec); bt(i+1,elegidas); elegidas.pop();
      if(cortado) return;
    }
  })(0,[]);
  // Ordenar: primero menos docentes no-disponibles, luego más disponibles, luego menos huecos
  soluciones.sort((a,b)=>
    (a.noDispo - b.noDispo) ||
    (b.conDispo - a.conDispo) ||
    a.huecoTotal-b.huecoTotal || a.dias-b.dias || a.huecoMax-b.huecoMax
  );
  return {soluciones,truncado:cortado};
}
