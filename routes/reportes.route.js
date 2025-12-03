// routes/reportes.route.js
const express = require("express");
const router = express.Router();
const Bill = require("../models/bill.model");

// Helper para normalizar fecha al inicio del día
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

// ===============================
// RANGO DE FECHAS
// ===============================
router.get("/ingresos", async (req, res) => {
  try {
    let { desde, hasta } = req.query;

    const hoy = new Date();
    const inicioHoy = startOfDay(hoy);

    // Si no envían fechas → por defecto últimos 30 días
    if (!desde) desde = startOfDay(new Date(hoy.setDate(hoy.getDate() - 29)));
    else desde = startOfDay(new Date(desde));

    if (!hasta) hasta = endOfDay(new Date());
    else hasta = endOfDay(new Date(hasta));

    // Buscar facturas pagadas dentro del rango
    const facturas = await Bill.find({
      estado: "pagada",
      pagadoEn: { $gte: desde, $lte: hasta },
    }).sort({ pagadoEn: 1 });

    // Calcular total general
    const total = facturas.reduce((acc, f) => acc + f.total, 0);

    // Agrupación por día
    const dias = {};
    facturas.forEach((f) => {
      const clave = startOfDay(f.pagadoEn).toISOString().slice(0, 10);
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
    desde: desde.toISOString().slice(0, 10),
    hasta: hasta.toISOString().slice(0, 10),
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
    // Solo facturas pagadas
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

    res.render("reportes.top-productos.ejs", { lista, activePage: "top-productos" });
  } catch (err) {
    console.error("Error en top productos:", err);
    res.status(500).send("Error cargando top productos");
  }
});

// HISTORIAL DE FACTURAS
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

// DETALLE DE UNA FACTURA
router.get("/facturas/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const factura = await Bill.findById(id);

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