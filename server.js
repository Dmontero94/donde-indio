const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const { MONGODB_URI } = process.env;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Motor de vistas
app.set("view engine", "ejs"); // 👈 MUY importante: siempre "ejs"
app.set("views", path.join(__dirname, "views"));

// Conexión a BD
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) => console.error("❌ Error conectando a MongoDB:", err.message));

// Ruta raíz de prueba
app.get("/", (req, res) => {
  res.render("inicio.ejs", { activePage: "inicio" });
});

// Rutas
const mesasRoutes = require("./routes/mesas.route");
const productosRoutes = require("./routes/productos.route");
const reportesRoutes = require("./routes/reportes.route"); 

app.use("/mesas", mesasRoutes);
app.use("/productos", productosRoutes);
app.use("/reportes", reportesRoutes); 

// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
