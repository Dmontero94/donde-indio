const express = require("express");
const session = require("express-session");
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

app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      // Cambia a true cuando tengas HTTPS en producción
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 8, // 8 horas
    },
  })
);

// 👇 NUEVO: currentUser disponible en TODAS las vistas
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Motor de vistas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Conexión a BD
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) =>
    console.error("❌ Error conectando a MongoDB:", err.message)
  );

// Ruta raíz
app.get("/", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("inicio.ejs", { activePage: "inicio" });
});

// Middleware de autenticación
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect("/login");
}

// Rutas
const mesasRoutes = require("./routes/mesas.route");
const productosRoutes = require("./routes/productos.route");
const reportesRoutes = require("./routes/reportes.route");
const authRoutes = require("./routes/auth.route");

// Rutas públicas (login/logout)
app.use("/", authRoutes);

// Rutas protegidas
app.use("/mesas", requireAuth, mesasRoutes);
app.use("/productos", requireAuth, productosRoutes);
app.use("/reportes", requireAuth, reportesRoutes);

// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
