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
  res.locals.isAdmin = req.session.user && req.session.user.username === process.env.ADMIN_USER;
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
  
  // Verificar si hay caja abierta
  if (!req.session.cajaActiva) {
    return res.redirect("/cash/apertura");
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

// Middleware de autenticación SOLO para administrador
function requireAdmin(req, res, next) {
  if (req.session && req.session.user) {
    // Verificar que el usuario sea el administrador
    if (req.session.user.username === process.env.ADMIN_USER) {
      return next();
    }
    // Si no es admin, redirigir con mensaje de error
    return res.status(403).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Acceso Denegado</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body class="bg-light d-flex align-items-center justify-content-center" style="min-height: 100vh;">
        <div class="text-center">
          <div class="mb-4">
            <i class="bi bi-shield-lock" style="font-size: 5rem; color: #dc3545;"></i>
          </div>
          <h1 class="text-danger">🔒 Acceso Denegado</h1>
          <p class="lead">Solo el administrador puede acceder a esta sección</p>
          <a href="/" class="btn btn-primary mt-3">Volver al Inicio</a>
        </div>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
      </body>
      </html>
    `);
  }
  return res.redirect("/login");
}

// Rutas
const mesasRoutes = require("./routes/mesas.route");
const productosRoutes = require("./routes/productos.route");
const reportesRoutes = require("./routes/reportes.route");
const authRoutes = require("./routes/auth.route");
const cashRoutes = require("./routes/cash.route");

// Rutas públicas (login/logout)
app.use("/", authRoutes);

// Rutas protegidas
app.use("/mesas", requireAuth, mesasRoutes);
app.use("/productos", requireAuth, productosRoutes);
app.use("/reportes", requireAuth, reportesRoutes);
app.use("/cash", requireAuth, cashRoutes);

// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
