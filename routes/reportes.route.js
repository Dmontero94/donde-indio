// routes/reportes.route.js
const express = require("express");
const router = express.Router();
const Bill = require("../models/bill.model");

const TIMEZONE = "America/Costa_Rica";
const TIMEZONE_OFFSET = 6 * 60 * 60 * 1000; // Costa Rica es UTC-6

// ===============================
// HELPERS FECHA (COSTA RICA)
// ===============================
function startOfDayCR(date) {
  const d = new Date(
    new Date(date).toLocaleString("en-US", { timeZone: TIMEZONE })
  );
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDayCR(date) {
  const d = new Date(
    new Date(date).toLocaleString("en-US", { timeZone: TIMEZONE })
  );
  d.setHours(23, 59, 59, 999);
  return d;
}

// Convierte una cadena de fecha "YYYY-MM-DD" del input como si fuera en CR
function dateStringToStartOfDayCR(dateString) {
  // dateString es "YYYY-MM-DD" - lo interpretamos como inicio del día EN COSTA RICA
  // CR 00:00 = UTC 06:00 (sumamos 6 horas porque CR es UTC-6)
  const [year, month, day] = dateString.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day, 6, 0, 0, 0));
  return d;
}

// Convierte una cadena de fecha "YYYY-MM-DD" del input como si fuera en CR
function dateStringToEndOfDayCR(dateString) {
  // dateString es "YYYY-MM-DD" - lo interpretamos como final del día EN COSTA RICA
  // CR 23:59:59 = UTC 05:59:59 del próximo día (CR 23:59 + 6h = UTC 05:59 del día siguiente)
  const [year, month, day] = dateString.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day + 1, 5, 59, 59, 999));
  return d;
}

function dateKeyCR(date) {
  return new Date(date).toLocaleDateString("en-CA", {
    timeZone: TIMEZONE,
  });
}

// ===============================
// RANGO DE FECHAS - INGRESOS
// ===============================
router.get("/ingresos", async (req, res) => {
  try {
    let { desde, hasta } = req.query;

    // Obtener fechas en Costa Rica
    let desdeDate, hastaDate;

    if (!desde) {
      // Si no viene fecha, usar últimos 29 días
      const hoy = new Date();
      const hace29 = new Date(hoy);
      hace29.setDate(hace29.getDate() - 29);
      const crDateString = hace29.toLocaleDateString("en-CA", { timeZone: "America/Costa_Rica" });
      desdeDate = dateStringToStartOfDayCR(crDateString);
    } else {
      // La fecha viene como "YYYY-MM-DD" del input - interpretarla como CR
      desdeDate = dateStringToStartOfDayCR(desde);
    }

    if (!hasta) {
      // Si no viene fecha, usar hoy
      const hoy = new Date();
      const crDateString = hoy.toLocaleDateString("en-CA", { timeZone: "America/Costa_Rica" });
      hastaDate = dateStringToEndOfDayCR(crDateString);
    } else {
      // La fecha viene como "YYYY-MM-DD" del input - interpretarla como CR
      hastaDate = dateStringToEndOfDayCR(hasta);
    }

    // Buscar facturas pagadas dentro del rango
    const facturas = await Bill.find({
      estado: "pagada",
      pagadoEn: { $gte: desdeDate, $lte: hastaDate },
    }).sort({ pagadoEn: 1 });

    // Total general
    const total = facturas.reduce((acc, f) => acc + f.total, 0);

    // Agrupación por día (Costa Rica)
    const dias = {};
    facturas.forEach((f) => {
      const clave = dateKeyCR(f.pagadoEn);
      if (!dias[clave]) dias[clave] = 0;
      dias[clave] += f.total;
    });

    const resumenDias = Object.keys(dias).map((d) => ({
      fecha: d,
      total: dias[d],
    }));

    // Convertir fechas a formato ISO string para el formulario
    const desdeISO = dateKeyCR(desdeDate);
    const hastaISO = dateKeyCR(hastaDate);

    res.render("reportes.ingresos.ejs", {
      total,
      resumenDias,
      desde: desdeISO,
      hasta: hastaISO,
      activePage: "ingresos",
    });
  } catch (err) {
    console.error("Error en GET /reportes/ingresos:", err);
    res.status(500).send("Error cargando reporte");
  }
});

// ===============================
// TOP PRODUCTOS MÁS VENDIDOS
// ===============================
router.get("/top-productos", async (req, res) => {
  try {
    const facturas = await Bill.find({ estado: "pagada" });

    const conteo = {};

    facturas.forEach((f) => {
      f.items.forEach((item) => {
        if (!conteo[item.nombreProducto]) {
          conteo[item.nombreProducto] = {
            nombre: item.nombreProducto,
            cantidad: 0,
            total: 0,
          };
        }
        conteo[item.nombreProducto].cantidad += item.cantidad;
        conteo[item.nombreProducto].total += item.subtotal;
      });
    });

    const lista = Object.values(conteo).sort(
      (a, b) => b.cantidad - a.cantidad
    );

    res.render("reportes.top-productos.ejs", {
      lista,
      activePage: "top-productos",
    });
  } catch (err) {
    console.error("Error en top productos:", err);
    res.status(500).send("Error cargando top productos");
  }
});

// ===============================
// HISTORIAL DE FACTURAS
// ===============================
router.get("/facturas", async (req, res) => {
  try {
    const facturas = await Bill.find({ estado: "pagada" }).sort({
      pagadoEn: -1,
    });

    res.render("reportes.facturas.ejs", {
      facturas,
      activePage: "facturas",
    });
  } catch (err) {
    console.error("Error en historial de facturas:", err);
    res.status(500).send("Error cargando facturas");
  }
});

// ===============================
// DETALLE DE FACTURA
// ===============================
router.get("/facturas/:id", async (req, res) => {
  try {
    const factura = await Bill.findById(req.params.id);

    if (!factura) {
      return res.status(404).send("Factura no encontrada");
    }

    res.render("reportes.factura-detalle.ejs", {
      factura,
      activePage: "facturas",
    });
  } catch (err) {
    console.error("Error en detalle de factura:", err);
    res.status(500).send("Error cargando detalle de factura");
  }
});

module.exports = router;