// routes/cash.route.js
const express = require("express");
const router = express.Router();
const CashRegister = require("../models/cashregister.model");
const Bill = require("../models/bill.model");
const { DateTime } = require("luxon");

// Timezone constant for Costa Rica
const TIMEZONE_CR = "America/Costa_Rica";

// Middleware: verificar que el usuario esté logueado
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

// ============================================
// APERTURA DE CAJA
// ============================================

// GET: Mostrar formulario de apertura
router.get("/apertura", requireLogin, async (req, res) => {
  try {
    const username = req.session.user.username;

    // Verificar si ya hay una caja abierta HOY
    const today = DateTime.now().setZone(TIMEZONE_CR).startOf("day").toJSDate();

    const cajaAbierta = await CashRegister.findOne({
      fecha: today,
      usuario: username,
      estado: "abierta",
    });

    if (cajaAbierta) {
      // Si ya está abierta, redirigir a home
      req.session.cajaActiva = cajaAbierta._id.toString();
      return res.redirect("/");
    }

    res.render("caja.apertura.ejs", {
      error: null,
      cajaAbierta: null,
      currentUser: req.session.user,
    });
  } catch (error) {
    console.error("Error en GET /cash/apertura:", error);
    res.status(500).render("caja.apertura.ejs", {
      error: "Error al verificar apertura de caja",
      cajaAbierta: null,
      currentUser: req.session ? req.session.user : null,
    });
  }
});

// POST: Procesar apertura de caja
router.post("/apertura", requireLogin, async (req, res) => {
  try {
    const { montoApertura, usuarioApertura } = req.body;
    const username = req.session.user.username;

    const montoNum = parseFloat(montoApertura) || 0;

    if (montoNum < 0) {
      return res.status(400).render("caja.apertura.ejs", {
        error: "El monto no puede ser negativo",
        cajaAbierta: null,
        currentUser: req.session.user,
      });
    }

    // Verificar si ya existe apertura hoy (solo bloquear si hay una abierta)
    const today = DateTime.now().setZone(TIMEZONE_CR).startOf("day").toJSDate();

    // Si el mismo usuario ya tiene una caja ABIERTA hoy, evitar duplicados
    const abiertaMismoUsuario = await CashRegister.findOne({
      fecha: today,
      usuario: username,
      estado: "abierta",
    });

    if (abiertaMismoUsuario) {
      return res.status(400).render("caja.apertura.ejs", {
        error: "Ya tienes una caja abierta para hoy",
        cajaAbierta: abiertaMismoUsuario,
      });
    }

    // Si ya existe una caja ABIERTA por otro usuario, bloquear apertura
    const anyOpen = await CashRegister.findOne({ estado: "abierta" });
    if (anyOpen && anyOpen.usuario !== username) {
      return res.status(400).render("caja.apertura.ejs", {
        error: `Ya existe una caja abierta por ${anyOpen.usuario}. Ciérrala primero o contacta al administrador.`,
        cajaAbierta: anyOpen,
      });
    }

    // Determinar usuario responsable (campo opcional en el formulario)
    const usuarioResponsable = usuarioApertura && usuarioApertura.trim().length > 0 ? usuarioApertura.trim() : username;

    // Obtener hora de apertura en Costa Rica
    const aperturaHora = DateTime.now().setZone(TIMEZONE_CR);

    // Crear nueva apertura de caja
    const nuevaCaja = new CashRegister({
      fecha: today,
      usuario: usuarioResponsable,
      montoApertura: montoNum,
      montoCierre: montoNum, // Al inicio es solo la apertura
      totalIngresos: 0,
      totalEfectivo: 0,
      totalSinpe: 0,
      estado: "abierta",
      horaApertura: aperturaHora.toJSDate(),
    });

    await nuevaCaja.save();

    // Guardar en sesión el ID de la caja activa
    req.session.cajaActiva = nuevaCaja._id.toString();

    res.redirect("/");
  } catch (error) {
    console.error("Error en POST /cash/apertura:", error);
    res.status(500).render("caja.apertura.ejs", {
      error: "Error al crear apertura de caja",
      cajaAbierta: null,
    });
  }
});

// ============================================
// CIERRE DE CAJA
// ============================================

// GET: Mostrar formulario de cierre
router.get("/cierre", requireLogin, async (req, res) => {
  try {
    const username = req.session.user.username;
    const cajaId = req.session.cajaActiva;

    if (!cajaId) {
      return res.status(400).render("caja.cierre.ejs", {
        error: "No hay caja abierta. Debes abrir caja primero.",
        caja: null,
      });
    }

    const caja = await CashRegister.findById(cajaId).populate("facturas.billId");

    if (!caja) {
      return res.status(404).render("caja.cierre.ejs", {
        error: "Caja no encontrada",
        caja: null,
      });
    }

    // Permitir que otro usuario cierre la caja (soporte de cambio de turno).
    const isOwner = caja.usuario === username;

    if (caja.estado === "cerrada") {
      return res.status(400).render("caja.cierre.ejs", {
        error: "Esta caja ya está cerrada",
        caja: null,
      });
    }

    // Calcular totales del día para mostrar antes de cerrar (sin persistir)
    try {
      // Use the actual caja.fecha to ensure we query bills for the correct day
      const cajaFechaDate = DateTime.fromJSDate(new Date(caja.fecha)).setZone(TIMEZONE_CR).startOf("day");
      const tomorrowDate = cajaFechaDate.plus({ days: 1 });
      const cajaFecha = cajaFechaDate.toJSDate();
      const tomorrow = tomorrowDate.toJSDate();

      console.log("GET /cash/cierre - buscando facturas entre:", cajaFecha, "y", tomorrow);

      const facturasDia = await Bill.find({
        pagadoEn: { $gte: cajaFecha, $lt: tomorrow },
        estado: "pagada",
      });

      let totalEfectivo = 0;
      let totalSinpe = 0;
      facturasDia.forEach((f) => {
        if (f.metodoPago === "efectivo") totalEfectivo += f.total;
        else if (f.metodoPago === "sinpe") totalSinpe += f.total;
      });

      caja.totalEfectivo = totalEfectivo;
      caja.totalSinpe = totalSinpe;
      caja.totalIngresos = totalEfectivo + totalSinpe;

      // preparar listado de facturas para mostrar en la vista (sin guardar)
      caja.facturas = facturasDia.map((f) => ({
        billId: f._id,
        metodoPago: f.metodoPago,
        monto: f.total,
        pagadoEn: f.pagadoEn,
      }));
    } catch (err) {
      console.error("Error calculando totales en GET /cash/cierre:", err);
    }

    res.render("caja.cierre.ejs", {
      error: null,
      caja: caja,
      currentUser: req.session.user,
      isOwner: isOwner,
    });
  } catch (error) {
    console.error("Error en GET /cash/cierre:", error);
    res.status(500).render("caja.cierre.ejs", {
      error: "Error al cargar datos de cierre",
      caja: null,
    });
  }
});

// POST: Procesar cierre de caja
router.post("/cierre", requireLogin, async (req, res) => {
  try {
    console.log("POST /cash/cierre recibido - user:", req.session && req.session.user ? req.session.user.username : "(no session)", "cajaActiva:", req.session ? req.session.cajaActiva : null);
    const username = req.session.user.username;
    const cajaId = req.session.cajaActiva;
    const { montoEfectivoContado, montoCobrado } = req.body;

    if (!cajaId) {
      return res.status(400).json({
        success: false,
        error: "No hay caja abierta",
      });
    }

    const caja = await CashRegister.findById(cajaId);

    if (!caja || caja.estado === "cerrada") {
      return res.status(403).json({
        success: false,
        error: "Caja no encontrada o ya cerrada",
      });
    }

    // Obtener todas las facturas pagadas del día usando la fecha de la caja
    // Use the actual caja.fecha to ensure we query bills for the correct day
    const cajaFechaDate = DateTime.fromJSDate(new Date(caja.fecha)).setZone(TIMEZONE_CR).startOf("day");
    const tomorrowDate = cajaFechaDate.plus({ days: 1 });
    const cajaFecha = cajaFechaDate.toJSDate();
    const tomorrow = tomorrowDate.toJSDate();

    console.log("Buscando facturas para la caja (fecha):", cajaFecha, "y", tomorrow);

    // Buscar todas las facturas pagadas (sin filtro de fecha para debug)
    const todasLasFacturas = await Bill.find({
      estado: "pagada",
    });

    console.log("TOTAL de facturas pagadas en la BD:", todasLasFacturas.length);

    const facturasDia = await Bill.find({
      pagadoEn: { $gte: cajaFecha, $lt: tomorrow },
      estado: "pagada",
    });

    console.log(
      "Facturas encontradas en el rango del día:",
      facturasDia.length
    );
    facturasDia.forEach((f) => {
      console.log(
        `  - Factura ${f._id}: ${f.metodoPago} - ₡${f.total} - ${f.pagadoEn}`
      );
    });

    // Guardar detalle de facturas dentro del documento de caja
    caja.facturas = facturasDia.map((f) => ({
      billId: f._id,
      metodoPago: f.metodoPago,
      monto: f.total,
    }));
    console.log("Se adjuntarán", caja.facturas.length, "facturas a la caja antes de cerrar.");

    // Calcular ingresos por método de pago
    let totalEfectivo = 0;
    let totalSinpe = 0;

    facturasDia.forEach((factura) => {
      if (factura.metodoPago === "efectivo") {
        totalEfectivo += factura.total;
      } else if (factura.metodoPago === "sinpe") {
        totalSinpe += factura.total;
      }
    });

    const totalIngresos = totalEfectivo + totalSinpe;
    
    // Calcular total de gastos
    const totalGastos = caja.gastos.reduce((sum, g) => sum + g.monto, 0);
    caja.totalGastos = totalGastos;
    
    const montoCierre = caja.montoApertura + totalIngresos - totalGastos;

    // Registrar quién cierra (usuario de sesión)
    caja.usuarioCierre = username;

    // Actualizar caja
    caja.totalEfectivo = totalEfectivo;
    caja.totalSinpe = totalSinpe;
    caja.totalIngresos = totalIngresos;
    caja.montoCierre = montoCierre;
    caja.horaCierre = DateTime.now().setZone(TIMEZONE_CR).toJSDate();
    caja.estado = "cerrada";
    caja.notas = req.body.notas || "";

    await caja.save();

    // Limpiar sesión
    delete req.session.cajaActiva;
    await new Promise((resolve) => req.session.save(resolve));

    res.json({
      success: true,
      mensaje: "Caja cerrada exitosamente",
      datos: {
        montoApertura: caja.montoApertura,
        totalEfectivo: totalEfectivo,
        totalSinpe: totalSinpe,
        totalIngresos: totalIngresos,
        montoCierre: montoCierre,
        facturas: caja.facturas,
      },
    });
  } catch (error) {
    console.error("Error en POST /cash/cierre:", error);
    res.status(500).json({
      success: false,
      error: "Error al cerrar caja: " + error.message,
    });
  }
});

// GET: Reporte de cierre diario
router.get("/reporte/:cajaId", requireLogin, async (req, res) => {
  try {
    const username = req.session.user.username;
    const { cajaId } = req.params;

    const caja = await CashRegister.findById(cajaId);

    if (!caja) {
      return res.status(404).render("caja.reporte.ejs", {
        error: "Caja no encontrada",
        caja: null,
      });
    }

    // Permitir ver solo si es el mismo usuario o es admin
    // (ajusta según tu lógica)

    res.render("caja.reporte.ejs", {
      error: null,
      caja: caja,
    });
  } catch (error) {
    console.error("Error en GET /cash/reporte:", error);
    res.status(500).render("caja.reporte.ejs", {
      error: "Error al cargar reporte",
      caja: null,
    });
  }
});

// ============================================
// GASTOS DE CAJA
// ============================================

// GET: Ver gastos del día actual
router.get("/gastos", requireLogin, async (req, res) => {
  try {
    const cajaId = req.session.cajaActiva;

    if (!cajaId) {
      return res.status(400).render("caja.gastos.ejs", {
        error: "No hay caja abierta. Debes abrir caja primero.",
        caja: null,
        currentUser: req.session.user,
      });
    }

    const caja = await CashRegister.findById(cajaId);

    if (!caja || caja.estado === "cerrada") {
      return res.status(400).render("caja.gastos.ejs", {
        error: "La caja está cerrada o no existe.",
        caja: null,
        currentUser: req.session.user,
      });
    }

    res.render("caja.gastos.ejs", {
      error: null,
      caja: caja,
      currentUser: req.session.user,
      success: req.query.success || null,
    });
  } catch (error) {
    console.error("Error en GET /cash/gastos:", error);
    res.status(500).render("caja.gastos.ejs", {
      error: "Error al cargar gastos",
      caja: null,
      currentUser: req.session ? req.session.user : null,
    });
  }
});

// POST: Registrar un gasto
router.post("/gastos", requireLogin, async (req, res) => {
  try {
    const { descripcion, monto } = req.body;
    const username = req.session.user.username;
    const cajaId = req.session.cajaActiva;

    if (!cajaId) {
      return res.status(400).json({
        success: false,
        error: "No hay caja abierta",
      });
    }

    const caja = await CashRegister.findById(cajaId);

    if (!caja || caja.estado === "cerrada") {
      return res.status(400).json({
        success: false,
        error: "La caja está cerrada o no existe",
      });
    }

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      return res.status(400).json({
        success: false,
        error: "El monto debe ser un número positivo",
      });
    }

    if (!descripcion || descripcion.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "La descripción es obligatoria",
      });
    }

    // Agregar gasto
    caja.gastos.push({
      descripcion: descripcion.trim(),
      monto: montoNum,
      fecha: DateTime.now().setZone(TIMEZONE_CR).toJSDate(),
      usuario: username,
    });

    // Actualizar total de gastos
    caja.totalGastos = caja.gastos.reduce((sum, g) => sum + g.monto, 0);

    await caja.save();

    res.json({
      success: true,
      mensaje: "Gasto registrado exitosamente",
      gasto: caja.gastos[caja.gastos.length - 1],
      totalGastos: caja.totalGastos,
    });
  } catch (error) {
    console.error("Error en POST /cash/gastos:", error);
    res.status(500).json({
      success: false,
      error: "Error al registrar gasto: " + error.message,
    });
  }
});

// DELETE: Eliminar un gasto
router.delete("/gastos/:gastoId", requireLogin, async (req, res) => {
  try {
    const { gastoId } = req.params;
    const cajaId = req.session.cajaActiva;

    if (!cajaId) {
      return res.status(400).json({
        success: false,
        error: "No hay caja abierta",
      });
    }

    const caja = await CashRegister.findById(cajaId);

    if (!caja || caja.estado === "cerrada") {
      return res.status(400).json({
        success: false,
        error: "La caja está cerrada o no existe",
      });
    }

    // Eliminar gasto
    caja.gastos = caja.gastos.filter((g) => g._id.toString() !== gastoId);

    // Recalcular total
    caja.totalGastos = caja.gastos.reduce((sum, g) => sum + g.monto, 0);

    await caja.save();

    res.json({
      success: true,
      mensaje: "Gasto eliminado exitosamente",
      totalGastos: caja.totalGastos,
    });
  } catch (error) {
    console.error("Error en DELETE /cash/gastos:", error);
    res.status(500).json({
      success: false,
      error: "Error al eliminar gasto: " + error.message,
    });
  }
});

// ============================================
// HISTORIAL DE CIERRES
// ============================================

// GET: Ver historial de cierres con filtros
router.get("/historial", requireLogin, async (req, res) => {
  try {
    const { fechaInicio, fechaFin, usuario } = req.query;

    // Construir filtro
    const filtro = { estado: "cerrada" };

    if (fechaInicio || fechaFin) {
      filtro.fecha = {};
      if (fechaInicio) {
        const inicio = DateTime.fromISO(fechaInicio).setZone(TIMEZONE_CR).startOf("day").toJSDate();
        filtro.fecha.$gte = inicio;
      }
      if (fechaFin) {
        const fin = DateTime.fromISO(fechaFin).setZone(TIMEZONE_CR).endOf("day").toJSDate();
        filtro.fecha.$lte = fin;
      }
    }

    if (usuario && usuario.trim().length > 0) {
      filtro.usuario = usuario.trim();
    }

    const cajas = await CashRegister.find(filtro).sort({ fecha: -1 }).limit(100);

    res.render("caja.historial.ejs", {
      error: null,
      cajas: cajas,
      currentUser: req.session.user,
      filtros: { fechaInicio, fechaFin, usuario },
    });
  } catch (error) {
    console.error("Error en GET /cash/historial:", error);
    res.status(500).render("caja.historial.ejs", {
      error: "Error al cargar historial de cierres",
      cajas: [],
      currentUser: req.session ? req.session.user : null,
      filtros: {},
    });
  }
});

module.exports = router;
