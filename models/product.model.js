// models/product.model.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  categoria: { type: String, required: true }, // Ej: "Desayunos", "Bebidas - Calientes"
  precio: { type: Number, required: true },    // En colones
  activo: { type: Boolean, default: true },
});

module.exports = mongoose.model("Product", productSchema);
