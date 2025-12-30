# 🔧 Referencia Rápida - Desarrollador

## 📍 Dónde está qué

### Flujo de Login
- **Archivo:** `routes/auth.route.js`
- **Línea:** ~35
- **Qué hace:** Verifica caja abierta post-login, restaura sesión

### Verificación de Caja en Home
- **Archivo:** `server.js`
- **Línea:** ~56
- **Qué hace:** Redirige a apertura si no hay `req.session.cajaActiva`

### Apertura de Caja
- **Ruta:** `routes/cash.route.js` (línea ~35)
- **Endpoints:** 
  - `GET /cash/apertura` - Mostrar formulario
  - `POST /cash/apertura` - Procesar

### Cierre de Caja
- **Ruta:** `routes/cash.route.js` (línea ~110)
- **Endpoints:**
  - `GET /cash/cierre` - Mostrar resumen
  - `POST /cash/cierre` - Procesar cierre

### Vistas
- **Apertura:** `views/caja.apertura.ejs`
- **Cierre:** `views/caja.cierre.ejs`
- **Reporte:** `views/caja.reporte.ejs`
- **Navbar:** `views/partials/navbar.ejs` (botón de cierre)

### Modelo
- **Archivo:** `models/cashregister.model.js`
- **Colección:** `cashregisters`

---

## 🔄 Flujos Clave

### 1. Login + Apertura
```
auth.route.js POST /login
  ├─ Validar credenciales
  ├─ Buscar CashRegister abierta (fecha hoy)
  ├─ Si existe: session.cajaActiva = _id
  └─ Redirige a / → server.js redirige a /cash/apertura si no hay cajaActiva
```

### 2. Apertura de Caja
```
GET  /cash/apertura → Renderiza caja.apertura.ejs
POST /cash/apertura → 
  ├─ Validar monto > 0
  ├─ Crear CashRegister
  ├─ Guardar en BD
  ├─ session.cajaActiva = _id
  └─ Redirige a /
```

### 3. Operación Normal (Cobro)
```
mesas.route.js POST /:numero/cobrar
  ├─ Validar método de pago
  ├─ Bill.metodoPago = "efectivo" | "sinpe"
  ├─ Bill.estado = "pagada"
  ├─ Bill.pagadoEn = Date.now()  ← CRÍTICO
  └─ Guardar en BD
```

### 4. Cierre de Caja
```
GET /cash/cierre →
  ├─ Obtener cajaId de session.cajaActiva
  ├─ Buscar CashRegister por ID
  ├─ Ejecutar agregación en Bills:
  │  └─ Sumar por metodoPago (efectivo/sinpe)
  │     WHERE pagadoEn entre hoy 00:00 y 23:59
  │     AND estado = "pagada"
  ├─ Renderizar caja.cierre.ejs con datos calculados
  │
POST /cash/cierre →
  ├─ Validar cajaId en sesión
  ├─ Actualizar CashRegister (montoCierre, horaCierre, etc)
  ├─ Cambiar estado a "cerrada"
  ├─ Limpiar session.cajaActiva
  └─ Redirige a /login
```

---

## 🔍 Búsquedas Útiles

### Encontrar dónde se guarda fechaApertura
```bash
grep -r "horaApertura\|Date.now()" routes/cash.route.js
```

### Ver todas las validaciones
```bash
grep -r "if.*montoApertura\|if.*metodoPago" routes/
```

### Encontrar dónde se calcula totalEfectivo
```bash
grep -r "totalEfectivo" routes/cash.route.js
# Línea ~185
```

### Ver todas las referencias a CashRegister
```bash
grep -r "CashRegister" .
```

---

## 🧪 Testing Rápido

### Verificar que Bills se guardan con pagadoEn
```javascript
// En navegador, tras cobrar una mesa:
fetch('/api/bills')  // Si existe endpoint
  .then(r => r.json())
  .then(bills => bills.filter(b => b.pagadoEn))
  .then(console.log)
```

### Verificar que CashRegister se crea
```javascript
// En MongoDB Compass o terminal:
db.cashregisters.findOne({}, { sort: { creadoEn: -1 } })
```

### Verificar sesión
```javascript
// En server.js, agregar endpoint de debug (temporal):
app.get('/debug/session', (req, res) => {
  res.json({
    user: req.session.user,
    cajaActiva: req.session.cajaActiva
  });
});
```

---

## 🎯 Puntos de Integración Críticos

### 1. **bill.model.js** (NO modificar)
✅ Ya tiene campos necesarios:
- `metodoPago` (pendiente|efectivo|sinpe)
- `estado` (abierta|pagada|anulada)
- `pagadoEn` (timestamp)

### 2. **mesas.route.js** (VERIFICAR no cambiar)
✅ Línea ~443: Debe tener
```javascript
bill.pagadoEn = new Date();  // ← CRÍTICO
```

### 3. **server.js**
✅ Debe tener:
```javascript
const cashRoutes = require("./routes/cash.route");
app.use("/cash", requireAuth, cashRoutes);
```

### 4. **auth.route.js**
✅ Debe restaurar sesión post-login

---

## 📋 Campos Importantes

### Session
```javascript
req.session = {
  user: { username: "admin" },
  cajaActiva: "507f1f77bcf86cd799439011"  // ID de CashRegister
}
```

### Bill
```javascript
{
  mesa: Number,
  items: Array,
  total: Number,
  metodoPago: "efectivo|sinpe|pendiente",  // ← Importante
  estado: "abierta|pagada|anulada",       // ← Importante
  pagadoEn: Date,                          // ← Muy importante
  creadoEn: Date
}
```

### CashRegister
```javascript
{
  fecha: Date,           // 2025-12-29 00:00:00 (sin hora)
  usuario: String,       // Quién abrió
  montoApertura: Number, // Ingresado por usuario
  horaApertura: Date,    // Automático
  totalEfectivo: Number, // Calculado
  totalSinpe: Number,    // Calculado
  totalIngresos: Number, // Calculado
  montoCierre: Number,   // Calculado
  horaCierre: Date,      // Automático
  estado: "abierta"|"cerrada",
  notas: String          // Opcional
}
```

---

## 🔐 Validaciones Clave

### En Apertura
```javascript
if (montoNum < 0) → Error
if (existente) → Error (ya existe)
if (!username) → Error
```

### En Cierre
```javascript
if (!cajaId) → Error
if (caja.usuario !== username) → Error
if (caja.estado === "cerrada") → Error
if (caja no existe) → Error
```

### En Cobro (mesas)
```javascript
if (metodoPago !== "efectivo" && !== "sinpe") → Error
if (efectivo && monto < total) → Error
```

---

## 🚀 Modificaciones Futuras Fáciles

### Agregar campo en CashRegister
```javascript
// En models/cashregister.model.js:
nuevoField: { type: String, default: "valor" }

// En routes/cash.route.js POST /cierre:
caja.nuevoField = "nuevo valor";
```

### Agregar método en Bills
```javascript
// En cobro:
bill.metodoPago = "nuevometodo";  // Agregar a enum en modelo

// En cierre:
else if (metodoPago === "nuevometodo") {
  totalNuevoMetodo += factura.total;
}
```

### Cambiar validación
```javascript
// En routes/cash.route.js, find the validation
// y cambiar la condición
```

---

## 🐛 Debugging

### Log en apertura
```javascript
// En routes/cash.route.js POST /apertura, agregar:
console.log("Apertura solicitada:", {
  usuario: username,
  monto: montoNum,
  fecha: today
});
```

### Log en cierre
```javascript
// En routes/cash.route.js POST /cierre, agregar:
console.log("Facturas encontradas:", facturasDia.length);
console.log("Totales:", { totalEfectivo, totalSinpe });
```

### Ver sesión
```javascript
// En cualquier ruta:
console.log("Session:", req.session);
console.log("CajaActiva:", req.session.cajaActiva);
```

---

## 📊 Agregación de MongoDB

Para verificar cálculos manuales:
```javascript
// Total efectivo:
db.bills.aggregate([
  {
    $match: {
      estado: "pagada",
      metodoPago: "efectivo",
      pagadoEn: { $gte: ISODate("2025-12-29"), $lt: ISODate("2025-12-30") }
    }
  },
  { $group: { _id: null, total: { $sum: "$total" } } }
])

// Mismo para SINPE (metodoPago: "sinpe")
```

---

## 🔗 Dependencias Entre Archivos

```
server.js
├── routes/auth.route.js
│   └── models/cashregister.model.js
├── routes/cash.route.js
│   ├── models/cashregister.model.js
│   └── models/bill.model.js
├── routes/mesas.route.js
│   └── models/bill.model.js ← Debe incluir pagadoEn
└── Middleware de sesión
```

---

## 📁 Estructura de Directorios

```
Archivos de Sistema:
├─ server.js (punto de entrada, modifica)
├─ package.json (NO modificar)
├─ .env (local, NO en git)

Nuevos Archivos:
├─ models/cashregister.model.js
├─ routes/cash.route.js
├─ views/caja.*.ejs (3 archivos)

Archivos Modificados:
├─ routes/auth.route.js
├─ views/partials/navbar.ejs

Documentación:
├─ QUICK_START.md (comienza aquí)
├─ APERTURA_CIERRE_CAJA.md (usuario)
├─ NOTAS_TECNICAS_CAJA.md (dev)
├─ PRUEBA_SISTEMA_CAJA.md (QA)
├─ CHANGELOG.md (cambios)
└─ Este archivo (referencia)
```

---

## 🎓 Conceptos Usados

**Express Middleware:**
```javascript
app.use((req, res, next) => { ... })
const middleware = (req, res, next) => { ... }
```

**Sesiones:**
```javascript
req.session.user = { ... }
req.session.cajaActiva = _id
```

**Async/Await:**
```javascript
const caja = await CashRegister.findOne({...})
```

**Agregaciones Mongo:**
```javascript
db.bills.aggregate([ $match, $group, $sum ])
```

**EJS Templates:**
```html
<%= variable %>
<%- include('partial') %>
<% if (condition) { %>
```

---

**Última actualización:** 2025-12-29
**Para desarrolladores:** v1.0
