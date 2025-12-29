// routes/productos.route.js
const express = require("express");
const router = express.Router();
const Product = require("../models/product.model");

// 🔹 Menú completo de Donde Indio (según las fotos)
const menuSeed = [
  // === COMIDAS RÁPIDAS ===
  { nombre: "Hamburguesa con papas", categoria: "Comidas rápidas", precio: 4500 },
  { nombre: "Orden de papas", categoria: "Comidas rápidas", precio: 2500 },
  { nombre: "Nachos de (Carne-Pollo-Mixto)", categoria: "Comidas rápidas", precio: 5000 },
  { nombre: "Quesadilla de carne", categoria: "Comidas rápidas", precio: 4500 },
  { nombre: "Dedos de pollo", categoria: "Comidas rápidas", precio: 4500 },
  { nombre: "Dedos de pescado", categoria: "Comidas rápidas", precio: 5000 },
  { nombre: "Alitas de pollo (BBQ-Búfalo-Mostaza miel)", categoria: "Comidas rápidas", precio: 4500 },

  // === DESAYUNOS ===
  {
    nombre: "Pinto tradicional (salchichón, natilla, maduro y huevos al gusto)",
    categoria: "Desayunos",
    precio: 2500,
  },
  { nombre: "Pinto con carne en salsa", categoria: "Desayunos", precio: 3500 },
  { nombre: "Pinto con pollo en salsa", categoria: "Desayunos", precio: 3500 },
  { nombre: "Pinto con bistec", categoria: "Desayunos", precio: 3500 },
  { nombre: "Pinto con chuleta", categoria: "Desayunos", precio: 3500 },
  {
    nombre: "Desayuno americano (pan, huevo al gusto, tocineta, pancakes)",
    categoria: "Desayunos",
    precio: 4000,
  },

  // Empanadas
  { nombre: "Empanada de queso", categoria: "Empanadas", precio: 1000 },
  { nombre: "Empanada de frijol", categoria: "Empanadas", precio: 1000 },
  { nombre: "Empanada de carne", categoria: "Empanadas", precio: 1000 },
  { nombre: "Empanada de pollo", categoria: "Empanadas", precio: 1000 },
  { nombre: "Empanada mixta", categoria: "Empanadas", precio: 1000 },

  // Sándwiches
  { nombre: "Sándwich jamón y queso", categoria: "Sándwiches", precio: 2500 },
  { nombre: "Sándwich de carne", categoria: "Sándwiches", precio: 2500 },
  { nombre: "Sándwich de pollo", categoria: "Sándwiches", precio: 2500 },
  { nombre: "Sándwich mixto", categoria: "Sándwiches", precio: 2500 },

  // === CASADOS ===
  {
    nombre: "Casado carne en salsa",
    categoria: "Casados",
    precio: 4500,
  },
  {
    nombre: "Casado pollo en salsa",
    categoria: "Casados",
    precio: 4500,
  },
  {
    nombre: "Casado bistec",
    categoria: "Casados",
    precio: 4500,
  },
  {
    nombre: "Casado filet de pescado",
    categoria: "Casados",
    precio: 4500,
  },
  {
    nombre: "Casado filet de pollo",
    categoria: "Casados",
    precio: 4500,
  },
  {
    nombre: "Casado chuleta",
    categoria: "Casados",
    precio: 4500,
  },

  // === ESPECIALES – CEVICHES ===
  { nombre: "Ceviche de pescado", categoria: "Ceviches", precio: 3000 },
  { nombre: "Ceviche de camarones", categoria: "Ceviches", precio: 4000 },
  { nombre: "Ceviche de piangua", categoria: "Ceviches", precio: 4000 },
  { nombre: "Ceviche mixto", categoria: "Ceviches", precio: 4000 },

  // === ESPECIALES – ARROCES ===
  {
    nombre: "Arroz de la casa (pollo-carne-camarones)",
    categoria: "Arroces",
    precio: 5000,
  },
  {
    nombre: "Arroz con camarones (entero)",
    categoria: "Arroces",
    precio: 6000,
  },
  {
    nombre: "Arroz con mariscos (entero)",
    categoria: "Arroces",
    precio: 6000,
  },
  {
    nombre: "Arroz con mariscos (medio)",
    categoria: "Arroces",
    precio: 4500,
  },

  // === PASTAS ===
  {
    nombre: "Pasta salsa blanca con camarones",
    categoria: "Pastas",
    precio: 6500,
  },
  {
    nombre: "Pasta salsa blanca con pollo",
    categoria: "Pastas",
    precio: 6000,
  },
  {
    nombre: "Pasta salsa de tomate con pollo",
    categoria: "Pastas",
    precio: 6000,
  },
  {
    nombre: "Pasta salsa de tomate con camarones",
    categoria: "Pastas",
    precio: 6000,
  },

  // === SOPAS ===
  {
    nombre: "Sopa de mariscos en agua",
    categoria: "Sopas",
    precio: 5500,
  },
  {
    nombre: "Sopa de mariscos en crema",
    categoria: "Sopas",
    precio: 6000,
  },
  {
    nombre: "Olla de carne (media)",
    categoria: "Sopas",
    precio: 3000,
  },
  {
    nombre: "Olla de carne (grande)",
    categoria: "Sopas",
    precio: 4000,
  },
  {
    nombre: "Sopa negra",
    categoria: "Sopas",
    precio: 2500,
  },

  // === PLATOS FUERTES ===
  { nombre: "Gordon Blue", categoria: "Platos fuertes", precio: 6000 },
  {
    nombre: "Filet de pollo al ajillo o empanizado",
    categoria: "Platos fuertes",
    precio: 5500,
  },
  {
    nombre: "Filet de pescado al ajillo o empanizado",
    categoria: "Platos fuertes",
    precio: 6000,
  },
  {
    nombre: "Filet de pescado en salsa de camarones",
    categoria: "Platos fuertes",
    precio: 7000,
  },
  {
    nombre: "Chicharrones",
    categoria: "Platos fuertes",
    precio: 4500,
  },
  {
    nombre: "Pollo Caribeño",
    categoria: "Platos fuertes",
    precio: 5500,
  },

  // === BEBIDAS – CALIENTES (1.000) ===
  { nombre: "Café", categoria: "Bebidas calientes", precio: 1000 },
  { nombre: "Chocolate caliente", categoria: "Bebidas calientes", precio: 1000 },
  { nombre: "Aguadulce", categoria: "Bebidas calientes", precio: 1000 },
  { nombre: "Té caliente", categoria: "Bebidas calientes", precio: 1000 },

  // === BEBIDAS – NATURALES (700) ===
  { nombre: "Refresco natural de chan", categoria: "Bebidas naturales", precio: 700 },
  {
    nombre: "Refresco natural de naranja zanahoria",
    categoria: "Bebidas naturales",
    precio: 700,
  },
  { nombre: "Refresco natural de linaza", categoria: "Bebidas naturales", precio: 700 },
  {
    nombre: "Refresco natural de tamarindo",
    categoria: "Bebidas naturales",
    precio: 700,
  },

  // === BATIDOS EN AGUA / LECHE ===
  { nombre: "Batido en agua (sabores varios)", categoria: "Batidos", precio: 1500 },
  { nombre: "Batido en leche (sabores varios)", categoria: "Batidos", precio: 2000 },

    // === BEBIDAS – GASEOSAS (1200) ===
  { nombre: "Refresco gaseosas", categoria: "Bebidas gaseosas", precio: 1200 },

  // Sabores sugeridos (si quieres llevar registro por sabor)
  { nombre: "Sabor batido: fresa", categoria: "Batidos - sabor", precio: 0 },
  { nombre: "Sabor batido: mora", categoria: "Batidos - sabor", precio: 0 },
  { nombre: "Sabor batido: piña", categoria: "Batidos - sabor", precio: 0 },
  { nombre: "Sabor batido: papaya", categoria: "Batidos - sabor", precio: 0 },
  { nombre: "Sabor batido: banano", categoria: "Batidos - sabor", precio: 0 },
  { nombre: "Sabor batido: guanábana", categoria: "Batidos - sabor", precio: 0 },
  { nombre: "Sabor batido: limonada", categoria: "Batidos - sabor", precio: 0 },
  { nombre: "Sabor batido: melón", categoria: "Batidos - sabor", precio: 0 },
  { nombre: "Sabor batido: maracuyá", categoria: "Batidos - sabor", precio: 0 },
  { nombre: "Sabor batido: mango", categoria: "Batidos - sabor", precio: 0 },
];

// 👉 Ruta para sembrar el menú (solo la usas una vez)
router.get("/init", async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) {
      return res.send("Ya hay productos en la base de datos. (No se volvió a sembrar)");
    }

    await Product.insertMany(menuSeed);
    res.send("Menú de Donde Indio insertado correctamente 🍽️");
  } catch (err) {
    console.error("Error sembrando menú:", err);
    res.status(500).send("Error sembrando menú: " + (err.message || "desconocido"));
  }
});

// 👉 Ruta de prueba para ver el menú en JSON
router.get("/", async (req, res) => {
  try {
    const productos = await Product.find().sort({ categoria: 1, nombre: 1 });
    res.json(productos);
  } catch (err) {
    console.error("Error listando productos:", err);
    res.status(500).send("Error listando productos");
  }
});

module.exports = router;
