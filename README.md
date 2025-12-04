# 🍽️ Donde Indio POS  
### Sistema Web de Mesas, Órdenes, Facturación y Reportes  
**Restaurante & Cevichería Donde Indio — Costa Rica 🇨🇷**

Solución digital creada para optimizar la atención al cliente, agilizar la toma de órdenes y centralizar la gestión operativa del restaurante.

---

## 🎯 Objetivo del Proyecto

Desarrollar un **POS Web moderno, rápido y responsivo** que permita gestionar mesas, órdenes, facturación e ingresos del restaurante de forma eficiente, sin depender de software externo.

---

## 🛠️ Stack Tecnológico

| **Categoría**       | **Tecnología**               | **Razón de Uso** |
|---------------------|------------------------------|------------------|
| Backend/API         | Node.js + Express.js         | JavaScript moderno, estable y modular. |
| Frontend            | EJS + Bootstrap 5            | Interfaces dinámicas, limpias y responsivas. |
| Base de Datos       | MongoDB Atlas (Mongoose)     | Manejo eficiente de datos no relacionales. |
| Control de Versión  | Git + GitHub                 | Versionado y colaboración. |
| Despliegue          | Render                       | Deploy rápido y escalable. |

---

## 👩🏻‍💻 Equipo de Desarrollo

| **Rol Principal**              | **Miembro del Equipo** | **Contacto** |
|-------------------------------|------------------------|--------------|
| Líder Técnico / Arquitectura  | Daniela Montero        | danimonte03@gmail.com |
| Front-End / Full-Stack (En progreso) | Daniela Montero        | github.com/Dmontero94 |

---

## 📘 Características del Sistema

### 🪑 Gestión de Mesas
- Estado en tiempo real (🟢 Libre / 🔴 Ocupada).  
- Vista detallada con cuenta activa.  
- Agregar productos desde el menú.  
- Cierre automático al procesar el pago.

---

### 🧾 Facturación

Métodos de pago:
- 💵 **Efectivo** (con cálculo automático de vuelto).  
- 📲 **SINPE Móvil**.  

Incluye:
- Registro automático de facturas.  
- Historial completo de pagos.  
- Detalle por factura con productos, totales y método de pago.  

---

### 📊 Reportes e Ingresos

Totales por:
- 📅 Día  
- 📆 Semana  
- 📈 Mes  
- 🎯 Rango personalizado  

Además:
- Top de productos más vendidos.  
- Cálculos en tiempo real.  

---

### 📱 Interfaz de Usuario
- Basado en **Bootstrap 5**.  
- Diseño intuitivo y responsivo.  
- Navbar global para navegación rápida.  

---

## 📂 Estructura del Proyecto

```
donde-indio/
│
├── models/          # Esquemas MongoDB (Mesas, Productos, Facturas)
├── routes/          # Rutas del sistema
├── views/           # Plantillas EJS
│   └── partials/    # Layouts y componentes compartidos
│
├── public/          # Estáticos (CSS, imágenes)
├── server.js        # Servidor Express
├── package.json     # Dependencias y scripts
└── .gitignore
```

---

## 🚀 Instalación y Ejecución

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/Dmontero94/donde-indio.git
cd donde-indio
```

### 2️⃣ Instalar dependencias
```bash
npm install
```

### 3️⃣ Configurar variables de entorno  

Crear archivo `.env`:

```
MONGODB_URI=tu_cadena_de_conexion_de_mongo_atlas
```

### 4️⃣ Iniciar entorno de desarrollo
```bash
npm run dev
```

Abrir en el navegador:  
➡️ http://localhost:4000

---

## 🌐 Deploy (Render + MongoDB Atlas)

**Comandos:**  
- Build: `npm install`  
- Start: `npm start`  

**Variables de Entorno:**  

```
MONGODB_URI=...
NODE_ENV=production
```

---

## 📸 Capturas del Sistema  
*(Agrega aquí tus imágenes)*

- 🏠 Inicio  
- 🪑 Vista de Mesas  
- 🍽️ Detalle de Orden  
- 💵 Cobro  
- 📊 Reportes  
- 🧾 Historial de Facturas  

---

## ⭐ ¿Te gusta este proyecto?

Si te fue útil, ¡regálale una ⭐ en GitHub!  
Si querés implementar un POS profesional para tu negocio, ¡escribime! 💚🔥

---

# 🇺🇸 English Version

## 🍽️ Donde Indio POS  
### Table, Order, Billing & Reporting System  
**Restaurant & Cevichería Donde Indio — Costa Rica 🇨🇷**

Modern web-based POS designed to streamline operations and optimize customer service.

---

## 🎯 Project Goal

Build a **fast, intuitive, and scalable POS web system** for restaurant table & order management, billing, and revenue tracking.

---

## 👩🏻‍💻 Author

**Daniela Montero**  
Software Developer (Front-End / Full-Stack in progress)  
📧 danimonte03@gmail.com  
🌐 Costa Rica 🇨🇷  