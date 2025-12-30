# 📊 Guía de Apertura y Cierre de Caja - Donde Indio

## 🎯 Descripción General

El sistema de apertura y cierre de caja es un módulo que:
- ✅ Requiere apertura de caja antes de empezar a facturar
- ✅ Registra un monto inicial de efectivo
- ✅ Contabiliza automáticamente todos los ingresos del día
- ✅ Separa ingresos por método de pago (Efectivo y SINPE)
- ✅ Genera reportes detallados de cierre

## 📋 Flujo de Funcionamiento

### 1️⃣ **Login**
```
Usuario intenta acceder
    ↓
Ingresa credenciales en /login
    ↓
Sistema verifica si hay caja abierta hoy
    ↓
Si NO hay → Redirige a /cash/apertura
Si SÍ hay → Redirige a /
```

### 2️⃣ **Apertura de Caja** (`/cash/apertura`)
- Usuario ingresa el monto inicial en efectivo
- Se registra fecha, usuario, monto y hora
- Se crea registro en BD (estado: "abierta")
- Se guarda ID de caja en sesión
- Redirige al inicio

### 3️⃣ **Operación Normal**
- Usuario puede acceder a mesas, facturar productos
- Cada factura se registra con:
  - Método de pago (efectivo o sinpe)
  - Monto total
  - Timestamp de pago

### 4️⃣ **Cierre de Caja** (`/cash/cierre`)
- Sistema calcula automáticamente:
  - Todas las facturas pagadas del día
  - Total en efectivo
  - Total en SINPE
  - Total ingresos
- Muestra resumen de:
  - Monto apertura
  - Ingresos efectivo
  - Ingresos SINPE
  - Total en caja (apertura + ingresos)
- Usuario revisa datos y confirma
- Se actualiza caja a estado "cerrada"
- Se limpia sesión

## 📁 Archivos Creados

### Modelos
- `models/cashregister.model.js` - Esquema de caja diaria

### Rutas
- `routes/cash.route.js` - Lógica de apertura/cierre

### Vistas
- `views/caja.apertura.ejs` - Formulario de apertura
- `views/caja.cierre.ejs` - Resumen y cierre
- `views/caja.reporte.ejs` - Reporte de cierre

### Modificaciones
- `server.js` - Registro de rutas y lógica de redireccionamiento
- `routes/auth.route.js` - Verificación de caja abierta en login
- `views/partials/navbar.ejs` - Botón de cierre de caja

## 🔄 Estructura de Datos - CashRegister

```javascript
{
  fecha: Date,              // Fecha del día (00:00:00)
  usuario: String,          // Usuario que abrió
  montoApertura: Number,    // Cantidad inicial en caja
  horaApertura: Date,       // Timestamp de apertura
  totalEfectivo: Number,    // Ingresos en efectivo
  totalSinpe: Number,       // Ingresos en SINPE
  totalIngresos: Number,    // Total efectivo + SINPE
  montoCierre: Number,      // apertura + ingresos
  horaCierre: Date,         // Timestamp de cierre
  estado: String,           // "abierta" o "cerrada"
  facturas: Array,          // Referencia a billIds pagadas
  notas: String,            // Observaciones del cierre
  creadoEn: Date            // Timestamp de creación
}
```

## 🚀 Casos de Uso

### Caso 1: Inicio Normal del Día
```
1. Usuario hace login
2. Sistema redirige a /cash/apertura
3. Ingresa monto inicial (ej: ₡50,000)
4. Abre caja
5. Redirigido a inicio, puede facturar
```

### Caso 2: Reapertura (ya existe apertura hoy)
```
1. Usuario hace login
2. Sistema encuentra caja abierta hoy
3. Restaura sesión con ID de caja
4. Redirige a inicio normalmente
```

### Caso 3: Cierre de Caja
```
1. Usuario hace clic en "🔒 Cerrar Caja" (navbar)
2. Ve resumen automático calculado
3. Revisa montos (apertura, efectivo, SINPE)
4. Ingresa notas si es necesario
5. Confirma cierre
6. Caja se marca como "cerrada"
7. Sesión se limpia
8. Sistema redirige a login
```

## 📊 Ejemplo de Cierre

```
Monto de Apertura:        ₡50,000.00
Total Efectivo (facturas): ₡185,300.00
Total SINPE (transferencias): ₡42,500.00
────────────────────────────────────
Total Ingresos:           ₡227,800.00
────────────────────────────────────
TOTAL EN CAJA:            ₡277,800.00
```

## 🔐 Seguridad

- ✅ Requiere autenticación para acceder
- ✅ Valida que usuario solo vea su propia caja
- ✅ Caja cerrada no puede reabrirse
- ✅ Solo una apertura por día/usuario
- ✅ Datos contabilizados automáticamente

## 🛠️ Integración Pendiente

Si es necesario, puede:
1. **Agregar reporte histórico** de cierres pasados
2. **Exportar a PDF/Excel** resumen de cierre
3. **Alertas** por diferencia en cierre
4. **Múltiples cajas** (si hay varios puntos de venta)
5. **Remesas** (cuánto se retira de caja a fin de día)

## 📝 Notas de Desarrollo

- Las fechas se almacenan sin hora para facilitar búsquedas por día completo
- El índice en CashRegister mejora búsquedas por fecha + usuario
- Las facturas se contabilizan solo si estado === "pagada"
- El cierre es irreversible por diseño (seguridad)

---

**Creado:** 2025-12-29  
**Version:** 1.0
