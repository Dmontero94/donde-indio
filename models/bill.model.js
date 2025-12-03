// models/bill.model.js
const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  mesa: { type: Number, required: true },
  items: [
    {
      productoId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      nombreProducto: String,
      cantidad: { type: Number, default: 1 },
      precioUnitario: Number,
      subtotal: Number,
    },
  ],
  total: { type: Number, default: 0 },

  // 👇 NUEVO: datos de pago
  metodoPago: {
    type: String,
    enum: ["pendiente", "efectivo", "sinpe"],
    default: "pendiente",
  },
  montoRecibido: { type: Number, default: 0 }, // en colones
  vuelto: { type: Number, default: 0 },

  estado: {
    type: String,
    enum: ["abierta", "pagada", "anulada"],
    default: "abierta",
  },
  creadoEn: { type: Date, default: Date.now },
  pagadoEn: Date,
});

module.exports = mongoose.model("Bill", billSchema);