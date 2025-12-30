// models/cashregister.model.js
const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const cashRegisterSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    default: () => {
      return DateTime.now().setZone("America/Costa_Rica").startOf("day").toJSDate();
    },
    required: true,
  },
  usuario: { type: String, required: true },

  // APERTURA
  montoApertura: { type: Number, default: 0 },
  horaApertura: { type: Date, default: Date.now },

  // INGRESOS DEL DÍA
  totalEfectivo: { type: Number, default: 0 },
  totalSinpe: { type: Number, default: 0 },
  totalIngresos: { type: Number, default: 0 }, // efectivo + sinpe

  // CIERRE
  montoCierre: { type: Number, default: 0 }, // apertura + ingresos
  horaCierre: Date,

  // ESTADO
  estado: {
    type: String,
    enum: ["abierta", "cerrada"],
    default: "abierta",
  },

  // Quién cerró la caja (usuario de sesión que hizo el cierre)
  usuarioCierre: { type: String },

  // Detalle de todas las facturas del día
  facturas: [
    {
      billId: { type: mongoose.Schema.Types.ObjectId, ref: "Bill" },
      metodoPago: String,
      monto: Number,
    },
  ],

  notas: String,
  creadoEn: { type: Date, default: Date.now },
});

// Índice para facilitar búsquedas por fecha y usuario
cashRegisterSchema.index({ fecha: 1, usuario: 1 });

module.exports = mongoose.model("CashRegister", cashRegisterSchema);
