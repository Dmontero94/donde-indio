# 🧪 Guía de Prueba - Sistema de Caja

## ✅ Checklist de Prueba Completa

### Fase 1: Login y Apertura

- [ ] **1.1** Ir a `/login`
- [ ] **1.2** Ingresar credenciales (usuario y contraseña)
- [ ] **1.3** Click en "Iniciar Sesión"
- [ ] **1.4** Se debe redirigir a `/cash/apertura` (NO a `/`)
- [ ] **1.5** Ingresar monto inicial (ej: 50000)
- [ ] **1.6** Click en "✓ Abrir Caja"
- [ ] **1.7** Se debe redirigir a `/` (inicio)
- [ ] **1.8** Se debe ver navbar con opción "🔒 Cerrar Caja"

**Resultado esperado:** ✅ Caja abierta, usuario en sesión, puede ver inicio

---

### Fase 2: Operación Normal (Facturación)

- [ ] **2.1** Desde inicio, click en "Ir a Mesas"
- [ ] **2.2** Seleccionar una mesa (ej: Mesa 1)
- [ ] **2.3** Click en "Ocupar Mesa"
- [ ] **2.4** Agregar productos (ej: 2x Ceviche, 1x Cerveza)
- [ ] **2.5** Verificar total se actualiza correctamente
- [ ] **2.6** Click en botón "Cobrar"
- [ ] **2.7** Ingresar método de pago:
  - [ ] **2.7a** Intentar EFECTIVO con ₡10,000 (insuficiente) → Debe dar error
  - [ ] **2.7b** Intentar EFECTIVO con ₡50,000 → Debe aceptar y mostrar vuelto
  - [ ] **2.7c** En otra mesa, intentar SINPE → Debe aceptar sin monto

**Resultado esperado:** ✅ Facturas se registran con método de pago y hora

---

### Fase 3: Múltiples Facturas

Repetir Fase 2 pero con diferentes mesas y métodos de pago:

- [ ] **3.1** Mesa 2: Efectivo ₡30,000
- [ ] **3.2** Mesa 3: SINPE ₡25,000
- [ ] **3.3** Mesa 4: Efectivo ₡45,000
- [ ] **3.4** Mesa 5: SINPE ₡50,000

**Resultado esperado:** ✅ Múltiples facturas cobradas con diferentes métodos

---

### Fase 4: Cierre de Caja

- [ ] **4.1** Ir a navbar, click en "🔒 Cerrar Caja"
- [ ] **4.2** Se redirige a `/cash/cierre`
- [ ] **4.3** Verificar que el sistema muestra:
  - Monto de Apertura (₡50,000)
  - Total en Efectivo (suma de facturas en efectivo)
  - Total en SINPE (suma de facturas en SINPE)
  - Total Ingresos (efectivo + SINPE)
  - Total en Caja (apertura + ingresos)
- [ ] **4.4** Verificar datos son correctos (comparar con cálculo manual)
- [ ] **4.5** Ingresar nota opcional (ej: "Se revisó efectivamente")
- [ ] **4.6** Click en "🔒 Cerrar Caja"
- [ ] **4.7** Se debe mostrar confirmación con resumen
- [ ] **4.8** Se redirige a `/login`

**Resultado esperado:** ✅ Caja cerrada correctamente, totales match

---

### Fase 5: Reapertura Después del Cierre

- [ ] **5.1** Hacer login nuevamente
- [ ] **5.2** Se debe ir a `/cash/apertura` (nueva apertura)
- [ ] **5.3** Ingresar nuevo monto (ej: 40,000)
- [ ] **5.4** Click en "✓ Abrir Caja"
- [ ] **5.5** Redirige a `/` normalmente

**Resultado esperado:** ✅ Se puede abrir nueva caja para día siguiente

---

### Fase 6: Verificación de Caja Duplicada

- [ ] **6.1** Abrir nueva sesión en otra pestaña (mismo navegador o incógnito)
- [ ] **6.2** Login con mismo usuario (mientras caja anterior está abierta)
- [ ] **6.3** Sistema debe restaurar sesión con caja abierta
- [ ] **6.4** Debe ir directamente a `/` (no a apertura)
- [ ] **6.5** Debe tener access a caja anterior (mismo ID)

**Resultado esperado:** ✅ Session se restaura automáticamente

---

### Fase 7: Validaciones

#### 7A - Monto Negativo en Apertura
- [ ] **7.1** Intentar apertura con monto -50000 → Debe rechazar
- [ ] **7.2** Intentar apertura con monto 0 → Debe aceptar (opcional)

#### 7B - Cierre sin Caja Abierta
- [ ] **7.3** Simular sesión sin cajaActiva
- [ ] **7.4** Intentar acceder a `/cash/cierre` → Debe mostrar error

#### 7C - Cierre Duplicado
- [ ] **7.5** Después de cerrar, intentar cerrar nuevamente
- [ ] **7.6** Debe mostrar error "Esta caja ya está cerrada"

**Resultado esperado:** ✅ Todas las validaciones funcionan correctamente

---

## 📊 Ejemplo de Cálculo Manual

**Para verificar que cierre es correcto:**

```
Apertura:        ₡50,000.00

Factura 1 (Mesa 2): Efectivo ₡30,000
Factura 2 (Mesa 3): SINPE    ₡25,000
Factura 3 (Mesa 4): Efectivo ₡45,000
Factura 4 (Mesa 5): SINPE    ₡50,000

────────────────────────────────────

Total Efectivo:    ₡30,000 + ₡45,000 = ₡75,000
Total SINPE:       ₡25,000 + ₡50,000 = ₡75,000
Total Ingresos:    ₡75,000 + ₡75,000 = ₡150,000

────────────────────────────────────

TOTAL EN CAJA:     ₡50,000 + ₡150,000 = ₡200,000 ✓
```

---

## 🔍 Cómo Verificar en MongoDB

Si deseas verificar directamente en la BD:

```javascript
// Conectar a MongoDB Compass o terminal

// Ver cajas registradas
db.cashregisters.find({})

// Ver última caja abierta
db.cashregisters.findOne({}, { sort: { creadoEn: -1 } })

// Ver todas las facturas del día
db.bills.find({
  pagadoEn: { 
    $gte: ISODate("2025-12-29T00:00:00Z"),
    $lt: ISODate("2025-12-30T00:00:00Z")
  },
  estado: "pagada"
})

// Sumar efectivo manualmente
db.bills.aggregate([
  {
    $match: {
      pagadoEn: { 
        $gte: ISODate("2025-12-29T00:00:00Z"),
        $lt: ISODate("2025-12-30T00:00:00Z")
      },
      estado: "pagada",
      metodoPago: "efectivo"
    }
  },
  {
    $group: {
      _id: null,
      total: { $sum: "$total" }
    }
  }
])

// Sumar SINPE manualmente
db.bills.aggregate([
  {
    $match: {
      pagadoEn: { 
        $gte: ISODate("2025-12-29T00:00:00Z"),
        $lt: ISODate("2025-12-30T00:00:00Z")
      },
      estado: "pagada",
      metodoPago: "sinpe"
    }
  },
  {
    $group: {
      _id: null,
      total: { $sum: "$total" }
    }
  }
])
```

---

## 🐛 Si Algo No Funciona

### "Redirige a apertura en lugar de inicio"
**Causa:** `req.session.cajaActiva` no está guardado correctamente
**Solución:**
```javascript
// En routes/cash.route.js línea ~50, verifica:
req.session.cajaActiva = nuevaCaja._id.toString();
// Asegúrate que .toString() está presente

// En routes/auth.route.js línea ~45, verifica:
if (cajaAbierta) {
  req.session.cajaActiva = cajaAbierta._id.toString();
}
```

### "Cierre muestra todos los totales en 0"
**Causa:** No se encontraron facturas pagadas
**Solución:**
1. Verifica que las facturas tengan `estado: "pagada"`
2. Verifica que tengan `pagadoEn` registrado (no null)
3. Verifica que `pagadoEn` esté dentro del rango del día
4. Revisa en BD directamente con queries de MongoDB

### "Error: Cannot read property 'username'"
**Causa:** Usuario no está autenticado
**Solución:** 
- Verifica que estés logueado
- Revisa que middleware `requireLogin` está presente
- Confirma que session está configurada correctamente en server.js

### "Botón 'Cerrar Caja' no aparece"
**Causa:** Navbar no se está renderizando correctamente
**Solución:**
- Verifica que `views/partials/navbar.ejs` se incluye con `<%- include(...) %>`
- Verifica que `res.locals.currentUser` se está seteando en server.js

---

## 📝 Reportes de Error

Si encuentras un error, anota:

```
Fecha/Hora: [YYYY-MM-DD HH:MM:SS]
Navegador: [Chrome/Firefox/Safari]
Pasos para reproducir:
1. ...
2. ...
3. ...

Error observado: 
[Descripción del problema]

Consola del navegador (F12):
[Pegar errores de console]

Console del servidor (terminal):
[Pegar errores de servidor]
```

---

## ✨ Casos Avanzados (Opcional)

### Test: Múltiples Usuarios (si aplica)
- [ ] User 1 abre caja
- [ ] User 2 intenta abrir caja (mismo día) → Debe tener su propia
- [ ] Verificar que cada uno solo ve su caja

### Test: Caja Abierta por Largo Tiempo
- [ ] Abrir caja a las 08:00
- [ ] Facturar durante todo el día
- [ ] Cerrar a las 22:00
- [ ] Verificar que todas las facturas entre 08:00 y 22:00 se contabilizan

### Test: Datos Límite
- [ ] Apertura con ₡1,000,000 (monto alto)
- [ ] Facturación con ₡0.01 (monto bajo)
- [ ] Muchas facturas pequeñas (ej: 100 facturas de ₡1,000)

---

**Última actualización:** 2025-12-29  
**Versión de prueba:** 1.0
