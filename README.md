🍽️ Donde Indio POS

Sistema de Mesas, Órdenes, Facturación y Reportes
Restaurante y Cevichería Donde Indio — Costa Rica 🇨🇷

🔥 POS Web completo para restaurantes: mesas, órdenes, facturas, reportes y administración del menú.

🌟 Características principales
🪑 Gestión de Mesas

Vista general de mesas con estado:

🟢 Libre

🔴 Ocupada

Detalle de mesa con cuenta activa.

Agregar productos del menú.

Cierre automático de cuenta al pagar.

🧾 Facturación

Pago mediante:

💵 Efectivo (con cálculo automático del vuelto)

📲 SINPE móvil

Registro automático de factura.

Historial de facturas pagadas.

Detalle completo de cada factura.

📊 Reportes

Ingresos por:

📅 Día

📆 Semana

📈 Mes

🎯 Rango personalizado

Totales calculados en tiempo real.

Top de productos más vendidos.

📱 Interfaz intuitiva

Basado en Bootstrap 5.

Vistas limpias y responsivas.

Navbar global para navegación fluida.

🛠️ Tecnologías Utilizadas
| Área               | Tecnología                  |
| ------------------ | --------------------------- |
| Backend            | Node.js, Express.js         |
| Base de Datos      | MongoDB Atlas (Mongoose)    |
| Frontend           | EJS Templates + Bootstrap 5 |
| Control de Versión | Git & GitHub                |
| Deploy             | Render                      |

📂 Estructura del Proyecto
donde-indio/
│
├── models/          # Esquemas MongoDB (Mesas, Productos, Facturas)
├── routes/          # Rutas del sistema (mesas, reportes, facturas)
├── views/           # Plantillas EJS (UI del sistema)
│   └── partials/    # Navbar, layout, componentes
│
├── public/          # Archivos estáticos (css, imgs…)
├── server.js        # Servidor Express
├── package.json     # Dependencias y scripts
└── .gitignore

🚀 Instalación y Ejecución Local
1️⃣ Clonar el repositorio
git clone https://github.com/Dmontero94/donde-indio.git
cd donde-indio

2️⃣ Instalar dependencias
npm install

3️⃣ Configurar variables de entorno

Crear archivo .env:

MONGODB_URI=tu_cadena_de_conexion_de_mongo_atlas

4️⃣ Ejecutar en modo desarrollo
npm run dev


Abrir en el navegador:

http://localhost:4000

🌐 Deploy (Render + MongoDB Atlas)
Configuración para Render:
Build Command:  npm install
Start Command:  npm start

Variables de entorno:
MONGODB_URI=...
NODE_ENV=production

📸 Capturas del Sistema

🏠 Inicio

🪑 Vista de Mesas

🍽️ Detalle de Mesa / Orden

💵 Cobro

📊 Reportes

🧾 Historial de Facturas

👩🏻‍💻 Autora
Daniela Montero

Desarrolladora de Software (Front-End / Full Stack en progreso)
💼 GitHub: https://github.com/Dmontero94

📧 danimonte03@gmail.com

🌐 Costa Rica 🇨🇷

⭐ ¿Te gusta este proyecto?

¡Regálale una estrella en GitHub!
Y si quieres implementar un POS completo para tu negocio, ¡contáctame! 💚🔥

***English Version Below***

🍽️ Donde Indio POS

Table, Order, Billing & Reporting System
Restaurant & Cevichería Donde Indio — Costa Rica 🇨🇷












🔥 A full web-based POS system for restaurant operations: table management, orders, billing, reports, and product analytics.

🌟 Key Features
🪑 Table Management

Overview of all tables with live status:

🟢 Available

🔴 Occupied

🟡 Pending Payment

Per-table active order view

Add items from the restaurant menu

Auto-close and clear tables upon payment

🧾 Billing & Payments

Supported payment methods:

💵 Cash (automatic change calculation)

📲 SINPE mobile (Costa Rica)

Automatically stores each completed bill

Full invoice history

Detailed invoice view including products, totals, and payment info

📊 Reports & Analytics

Revenue reporting by:

📅 Day

📆 Week

📈 Month

🎯 Custom date range

Real-time total calculations

Most sold products ranking (top sellers)

📱 User-Friendly Interface

Built with Bootstrap 5 for responsive design

Clean and intuitive UI

Global navigation bar for quick access

🛠️ Tech Stack
| Category        | Technology                        |
| --------------- | --------------------------------- |
| Backend         | Node.js, Express.js               |
| Database        | MongoDB Atlas (Mongoose ORM)      |
| Frontend        | EJS Template Engine + Bootstrap 5 |
| Version Control | Git & GitHub                      |
| Deployment      | Render Web Services               |

📂 Project Structure
donde-indio/
│
├── models/          # MongoDB Schemas (Tables, Products, Bills)
├── routes/          # Express routes (tables, billing, reports)
├── views/           # EJS templates (UI for all pages)
│   └── partials/    # Navbar, shared layout components
│
├── public/          # Static files (CSS, images)
├── server.js        # Express server entry point
├── package.json     # Dependencies and scripts
└── .gitignore

🚀 Run Locally
1️⃣ Clone the repository
git clone https://github.com/Dmontero94/donde-indio.git
cd donde-indio

2️⃣ Install dependencies
npm install

3️⃣ Environment variables

Create a .env file in the root folder:

MONGODB_URI=your_mongodb_atlas_connection_string

4️⃣ Start development mode
npm run dev


Open in browser:

http://localhost:4000

🌐 Deployment (Render + MongoDB Atlas)
Build & Start commands
Build:  npm install
Start:  npm start

Environment Variables
MONGODB_URI=your_connection_string
NODE_ENV=production

📸 Screenshots

(You can add screenshots once you capture them — these are placeholders.)

🏠 Home

🪑 Tables View

🍽️ Table Order Detail

💵 Payment Screen

📊 Reports

🧾 Invoice History

👩🏻‍💻 Author
Daniela Montero

Software Developer (Front-End / Full-Stack in progress)
💼 GitHub: https://github.com/Dmontero94

📧 danimonte03@gmail.com

🌐 Costa Rica 🇨🇷

⭐ Like this project?

If you find it useful, give it a ⭐ on GitHub!
For POS implementations for real businesses, feel free to reach out! 💚🔥