// routes/mesas.route.js
const express = require("express");
const router = express.Router();

const Table = require("../models/table.model");
const Bill = require("../models/bill.model");
const Product = require("../models/product.model");

// 🔹 Inicializar las 10 mesas
router.get("/init", async (req, res) => {
  try {
    const count = await Table.countDocuments();

    if (count === 0) {
      const mesas = [];
      for (let i = 1; i <= 10; i++) {
        mesas.push({ numero: i });
      }

      await Table.insertMany(mesas);
      return res.send("Mesas inicializadas (1 a 10)");
    }

    res.send("Las mesas ya existen en la base de datos");
  } catch (err) {
    console.error("Error en /mesas/init:", err);
    res.status(500).send("Error inicializando mesas");
  }
});

// 🔹 Listar mesas
router.get("/", async (req, res) => {
  try {
    const mesas = await Table.find().sort({ numero: 1 });
    res.render("mesas.ejs", { mesas, activePage: "mesas" });
  } catch (err) {
    console.error("Error en GET /mesas:", err);
    res.status(500).send("Error cargando mesas");
  }
});

// 🔹 Detalle de una mesa
router.get("/:numero", async (req, res) => {
  try {
    const numero = parseInt(req.params.numero, 10);
    console.log("Detalle de mesa, numero:", numero);

    const mesa = await Table.findOne({ numero }).populate("cuentaActual");

    if (!mesa) {
      return res.status(404).send("Mesa no encontrada");
    }

    // Productos del menú
    const productos = await Product.find({ activo: true }).sort({
      categoria: 1,
      nombre: 1,
    });

    res.render("mesas.detalle.ejs", { mesa, productos, activePage: "mesas" });
  } catch (err) {
    console.error("Error en GET /mesas/:numero ->", err);
    res
      .status(500)
      .send(
        "Error cargando detalle de mesa: " + (err.message || "desconocido")
      );
  }
});

// 🔹 Abrir cuenta en una mesa
router.get("/:numero/abrir", async (req, res) => {
  try {
    const numero = parseInt(req.params.numero, 10);
    const mesa = await Table.findOne({ numero });

    if (!mesa) {
      return res.status(404).send("Mesa no encontrada");
    }

    if (mesa.estado === "ocupada" && mesa.cuentaActual) {
      return res.redirect(`/mesas/${numero}`);
    }

    const bill = await Bill.create({
      mesa: numero,
      items: [],
      total: 0,
    });

    mesa.estado = "ocupada";
    mesa.cuentaActual = bill._id;
    await mesa.save();

    res.redirect(`/mesas/${numero}`);
  } catch (err) {
    console.error("Error al abrir cuenta:", err);
    res
      .status(500)
      .send("Error abriendo cuenta: " + (err.message || "desconocido"));
  }
});

// 🔹 Agregar producto a la cuenta de una mesa
router.post("/:numero/items", async (req, res) => {
  try {
    const numero = parseInt(req.params.numero, 10);
    const { productoId, cantidad } = req.body;
    const qty = parseInt(cantidad, 10) || 1;

    // Buscar mesa
    const mesa = await Table.findOne({ numero }).populate("cuentaActual");

    if (!mesa) {
      return res.status(404).send("Mesa no encontrada");
    }

    // Si no hay cuentaActual, creamos una nueva
    let bill = mesa.cuentaActual;

    if (!bill) {
      bill = new Bill({
        mesa: mesa.numero,
        items: [],
        total: 0,
        estado: "abierta",
        creadoEn: new Date(),
      });
    }

    // Buscar producto
    const producto = await Product.findById(productoId);

    if (!producto) {
      return res.status(404).send("Producto no encontrado");
    }

    // Ver si el producto ya está en la cuenta
    let item = bill.items.find(
      (it) =>
        (it.producto && it.producto.toString() === producto._id.toString()) ||
        it.nombreProducto === producto.nombre
    );

    if (!item) {
      // Agregar nuevo item a la cuenta
      item = {
        producto: producto._id,
        nombreProducto: producto.nombre,
        cantidad: qty,
        precioUnitario: producto.precio,
        subtotal: qty * producto.precio,
      };
      bill.items.push(item);
    } else {
      // Sumar a uno existente
      item.cantidad += qty;
      item.subtotal = item.cantidad * item.precioUnitario;
    }

    // Recalcular total
    bill.total = bill.items.reduce((sum, it) => sum + it.subtotal, 0);

    // Guardar cuenta
    await bill.save();

    // Vincular cuenta a la mesa si recién se creó
    if (!mesa.cuentaActual) {
      mesa.cuentaActual = bill._id;
      mesa.estado = "ocupada";
      await mesa.save();
    }

    res.redirect(`/mesas/${numero}`);
  } catch (err) {
    console.error("Error agregando producto a la mesa:", err);
    res.status(500).send("Error agregando producto a la cuenta");
  }
});
// 🔹 Agregar extra personalizado a la cuenta de una mesa
router.post("/:numero/extras", async (req, res) => {
  try {
    const numero = parseInt(req.params.numero, 10);
    const { descripcion, monto } = req.body;
    const amount = parseInt(monto, 10) || 0;

    // Si el monto es 0 o negativo, no hacemos nada
    if (amount <= 0) {
      return res.redirect(`/mesas/${numero}`);
    }

    // Buscar mesa
    const mesa = await Table.findOne({ numero }).populate("cuentaActual");

    if (!mesa) {
      return res.status(404).send("Mesa no encontrada");
    }

    // Si no hay cuenta, crear una nueva
    let bill = mesa.cuentaActual;

    if (!bill) {
      bill = new Bill({
        mesa: mesa.numero,
        items: [],
        total: 0,
        estado: "abierta",
        creadoEn: new Date(),
      });
    }

    // Agregar item personalizado
    bill.items.push({
      nombreProducto: descripcion || "Extra personalizado",
      cantidad: 1,
      precioUnitario: amount,
      subtotal: amount,
    });

    // Recalcular total
    bill.total = bill.items.reduce((sum, it) => sum + it.subtotal, 0);

    // Guardar cuenta
    await bill.save();

    // Si la mesa no tenía cuenta, ligarla ahora
    if (!mesa.cuentaActual) {
      mesa.cuentaActual = bill._id;
      mesa.estado = "ocupada";
      await mesa.save();
    }

    res.redirect(`/mesas/${numero}`);
  } catch (err) {
    console.error("Error agregando extra a la mesa:", err);
    res.status(500).send("Error agregando extra personalizado");
  }
});

// 🔹 Aumentar cantidad de un item
router.post("/:numero/items/:itemId/increase", async (req, res) => {
  try {
    const numero = parseInt(req.params.numero, 10);
    const itemId = req.params.itemId;

    const mesa = await Table.findOne({ numero });

    if (!mesa || !mesa.cuentaActual) {
      return res.status(400).send("La mesa no tiene cuenta activa");
    }

    const bill = await Bill.findById(mesa.cuentaActual);

    if (!bill) {
      return res.status(404).send("Cuenta no encontrada");
    }

    const item = bill.items.id(itemId);
    if (!item) {
      return res.status(404).send("Producto no encontrado en la cuenta");
    }

    item.cantidad += 1;
    item.subtotal = item.cantidad * item.precioUnitario;
    bill.total = bill.items.reduce((sum, it) => sum + it.subtotal, 0);

    await bill.save();
    res.redirect(`/mesas/${numero}`);
  } catch (err) {
    console.error("Error aumentando cantidad:", err);
    res.status(500).send("Error aumentando cantidad");
  }
});

// 🔹 Disminuir cantidad de un item
router.post("/:numero/items/:itemId/decrease", async (req, res) => {
  try {
    const numero = parseInt(req.params.numero, 10);
    const itemId = req.params.itemId;

    const mesa = await Table.findOne({ numero });

    if (!mesa || !mesa.cuentaActual) {
      return res.status(400).send("La mesa no tiene cuenta activa");
    }

    const bill = await Bill.findById(mesa.cuentaActual);

    if (!bill) {
      return res.status(404).send("Cuenta no encontrada");
    }

    const item = bill.items.id(itemId);
    if (!item) {
      return res.status(404).send("Producto no encontrado en la cuenta");
    }

    item.cantidad -= 1;

    if (item.cantidad <= 0) {
      item.deleteOne();
    } else {
      item.subtotal = item.cantidad * item.precioUnitario;
    }

    bill.total = bill.items.reduce((sum, it) => sum + it.subtotal, 0);

    if (bill.items.length === 0) {
      mesa.cuentaActual = null;
      mesa.estado = "libre";

      await mesa.save();
      await bill.deleteOne();

      return res.redirect(`/mesas/${numero}`);
    }

    await bill.save();
    await mesa.save();

    res.redirect(`/mesas/${numero}`);
  } catch (err) {
    console.error("Error disminuyendo cantidad:", err);
    res.status(500).send("Error disminuyendo cantidad");
  }
});

// 🔹 Eliminar un item de la cuenta
router.post("/:numero/items/:itemId/delete", async (req, res) => {
  try {
    const numero = parseInt(req.params.numero, 10);
    const itemId = req.params.itemId;

    const mesa = await Table.findOne({ numero });

    if (!mesa || !mesa.cuentaActual) {
      return res.status(400).send("La mesa no tiene cuenta activa");
    }

    const bill = await Bill.findById(mesa.cuentaActual);

    if (!bill) {
      return res.status(404).send("Cuenta no encontrada");
    }

    bill.items = bill.items.filter((item) => item._id.toString() !== itemId);
    bill.total = bill.items.reduce((sum, it) => sum + it.subtotal, 0);

    if (bill.items.length === 0) {
      mesa.cuentaActual = null;
      mesa.estado = "libre";

      await mesa.save();
      await bill.deleteOne();

      return res.redirect(`/mesas/${numero}`);
    }

    await bill.save();
    await mesa.save();

    res.redirect(`/mesas/${numero}`);
  } catch (err) {
    console.error("Error eliminando item:", err);
    res.status(500).send("Error eliminando producto");
  }
});

// 🔹 Pantalla de cobro
router.get("/:numero/cobrar", async (req, res) => {
  try {
    const numero = parseInt(req.params.numero, 10);

    const mesa = await Table.findOne({ numero }).populate("cuentaActual");

    if (!mesa || !mesa.cuentaActual) {
      return res.status(400).send("La mesa no tiene una cuenta abierta");
    }

    const bill = mesa.cuentaActual;

    if (!bill.items || bill.items.length === 0) {
      return res
        .status(400)
        .send("No se puede cobrar una cuenta sin productos");
    }

    res.render("mesas.cobrar.ejs", { mesa, bill, activePage: "mesas" });
  } catch (err) {
    console.error("Error en GET /mesas/:numero/cobrar ->", err);
    res
      .status(500)
      .send(
        "Error cargando pantalla de cobro: " + (err.message || "desconocido")
      );
  }
});

// 🔹 Procesar cobro
router.post("/:numero/cobrar", async (req, res) => {
  try {
    const numero = parseInt(req.params.numero, 10);
    const { metodoPago, montoRecibido } = req.body;

    const mesa = await Table.findOne({ numero }).populate("cuentaActual");

    if (!mesa || !mesa.cuentaActual) {
      return res.status(400).send("La mesa no tiene una cuenta abierta");
    }

    const bill = mesa.cuentaActual;

    if (!bill.items || bill.items.length === 0) {
      return res
        .status(400)
        .send("No se puede cobrar una cuenta sin productos");
    }

    const total = bill.total;
    let recibidoNum = parseInt(montoRecibido, 10) || 0;
    let vuelto = 0;

    if (metodoPago === "efectivo") {
      if (recibidoNum < total) {
        return res
          .status(400)
          .send("El monto recibido en efectivo no puede ser menor al total");
      }
      vuelto = recibidoNum - total;
    } else if (metodoPago === "sinpe") {
      recibidoNum = total;
      vuelto = 0;
    } else {
      return res.status(400).send("Método de pago no válido");
    }

    bill.metodoPago = metodoPago;
    bill.montoRecibido = recibidoNum;
    bill.vuelto = vuelto;
    bill.estado = "pagada";
    bill.pagadoEn = new Date();
    await bill.save();

    mesa.estado = "libre";
    mesa.cuentaActual = null;
    await mesa.save();

    res.redirect("/mesas");
  } catch (err) {
    console.error("Error en POST /mesas/:numero/cobrar ->", err);
    res
      .status(500)
      .send("Error procesando cobro: " + (err.message || "desconocido"));
  }
});

module.exports = router;