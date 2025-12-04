// routes/auth.route.js
const express = require("express");
const router = express.Router();

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Mostrar formulario de login
router.get("/login", (req, res) => {
  // Si ya está logueado, lo mandamos al inicio
  if (req.session && req.session.user) {
    return res.redirect("/");
  }

  res.render("auth.login.ejs", {
    error: null,
  });
});

// Procesar login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
    // Guardamos usuario en sesión
    req.session.user = { username };
    return res.redirect("/");
  }

  // Si falla: recargamos el formulario con mensaje
  res.status(401).render("auth.login.ejs", {
    error: "Usuario o contraseña incorrectos",
  });
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
