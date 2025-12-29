// routes/reportes.route.js
const express = require("express");
const router = express.Router();
const Bill = require("../models/bill.model");

const TIMEZONE = "America/Costa_Rica";

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

    // Si no envían fechas → últimos 30 días (CR)
    if (!desde) {
      const d = new Date();
      d.setDate(d.getDate() - 29);
      desde = startOfDayCR(d);
    } else {
      desde = startOfDayCR(new Date(desde));
    }

    if (!hasta) {
      hasta = endOfDayCR(new Date());
    } else {
      hasta = endOfDayCR(new Date(hasta));
    }

    // Buscar facturas pagadas dentro del rango (UTC guardado, CR calculado)
    const facturas = await Bill.find({
      estado: "pagada",
      pagadoEn: { $gte: desde, $lte: hasta },
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

    res.render("reportes.ingresos.ejs", {
      total,
      resumenDias,
      desde: dateKeyCR(desde),
      hasta: dateKeyCR(hasta),
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
router.get("/facturas", async (req, res) => {
  try {
    const facturasDB = await Bill.find({ estado: "pagada" }).sort({
      pagadoEn: -1,
    });

    const facturas = facturasDB.map((f) => ({
      ...f.toObject(),
      pagadoEnCR: f.pagadoEn
        ? f.pagadoEn.toLocaleString("es-CR", {
            timeZone: "America/Costa_Rica",
            dateStyle: "short",
            timeStyle: "short",
          })
        : "",
    }));

    res.render("reportes.facturas.ejs", {
      facturas,
      activePage: "facturas",
    });
  } catch (err) {
    console.error("Error en historial de facturas:", err);
    res.status(500).send("Error cargando facturas");
  }
});

module.exports = router;