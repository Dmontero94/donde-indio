// models/table.model.js
const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  numero: { type: Number, required: true, unique: true },
  estado: {
    type: String,
    enum: ["libre", "ocupada"],
    default: "libre",
  },
  cuentaActual: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bill",
    default: null,
  },
});

module.exports = mongoose.model("Table", tableSchema);
