# 🔧 Notas Técnicas - Sistema de Caja

## 📋 Requisitos Cumplidos

- ✅ Apertura obligatoria de caja antes de facturar
- ✅ Ingreso de monto inicial
- ✅ Contabilización automática de ingresos del día
- ✅ Separación por método de pago (Efectivo y SINPE)
- ✅ Reportes de cierre detallados
- ✅ Integración con sistema existente

---

## 🏗️ Arquitectura de la Solución

### Flujo de Autenticación Mejorado

```
┌─────────────────┐
│  Login Exitoso  │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────┐
│ Buscar caja abierta en DB    │
│ WHERE fecha = hoy            │
│   AND usuario = actual       │
│   AND estado = "abierta"     │
└──────┬───────────┬───────────┘
       │           │
   Encontrada    No encontrada
       │           │
       ▼           ▼
    Restaurar   Redirigir a
    sesión con  apertura
    ID caja     /cash/apertura
       │           │
       └─────┬─────┘
             ▼
         Redirigir a /
```

### Flujo de Cierre Automático

```
┌─────────────────────────────────────────┐
│  GET /cash/cierre (Usuario autorizado)  │
└──────────────────┬──────────────────────┘
                   │
                   ▼
        ┌─────────────────────────┐
        │  Obtener Caja Activa    │
        │  por ID de sesión       │
        └──────────┬──────────────┘
                   │
                   ▼
        ┌──────────────────────────────────┐
        │ Buscar todas las Bills pagadas   │
        │ WHERE fecha = hoy                │
        │   AND estado = "pagada"          │
        │   AND pagadoEn between 00:00-23:59
        └──────┬───────────────────────────┘
               │
               ▼
        ┌────────────────────────┐
        │ Separar por método     │
        │ Calcular totales       │
        │ SUM(total WHERE método │
        │  = efectivo/sinpe)     │
        └───────┬────────────────┘
                │
                ▼
        ┌────────────────────────┐
        │ Mostrar resumen en     │
        │ caja.cierre.ejs        │
        │ (Valores automáticos)  │
        └────────────────────────┘
```

---

## 📊 Modelo de Datos

### Relación Bills ↔ CashRegister

```
┌─────────────────┐                ┌──────────────────┐
│     Bill        │                │  CashRegister    │
├─────────────────┤                ├──────────────────┤
│ _id             │◄──────ref──────┤ facturas.billId  │
│ mesa            │                │                  │
│ items[]         │                │ fecha            │
│ total           │                │ usuario          │
│ metodoPago      │                │ montoApertura    │
│ estado          │                │ totalEfectivo    │
│ pagadoEn ◄──────┼────usado para──┤ totalSinpe       │
│ creadoEn        │   filtrar      │ montoCierre      │
└─────────────────┘                │ estado           │
                                   │ horaCierre       │
                                   └──────────────────┘

Bill.estado === "pagada" 
  && Bill.pagadoEn >= startOfDay 
  && Bill.pagadoEn < startOfNextDay
    ↓
Se incluye en CashRegister.totalEfectivo 
  o CashRegister.totalSinpe
```

---

## 🔄 Flujos Clave

### 1. **Apertura de Caja**

```javascript
POST /cash/apertura
  ↓
Validar autenticación
  ↓
Buscar apertura anterior hoy
  ↓
Si existe → Error 400 "Ya existe apertura"
  ↓
Si no existe:
  - Crear nuevo documento CashRegister
  - fecha = hoy (00:00:00)
  - usuario = session.user.username
  - montoApertura = valor ingresado
  - horaApertura = Date.now()
  - estado = "abierta"
  - totalEfectivo = 0
  - totalSinpe = 0
  ↓
Guardar en DB
  ↓
Almacenar ID en: session.cajaActiva = _id
  ↓
Redirigir a /
```

### 2. **Cobro de Factura**

```javascript
POST /mesas/:numero/cobrar
  ↓
Validar método de pago (efectivo/sinpe)
  ↓
Bill.metodoPago = metodoPago
Bill.estado = "pagada"
Bill.pagadoEn = Date.now()  ◄── CRÍTICO para cierre
  ↓
Guardar Bill
  ↓
Liberar mesa
  ↓
Redirigir a /mesas
```

### 3. **Cierre de Caja**

```javascript
GET /cash/cierre
  ↓
Obtener cajaId de session.cajaActiva
  ↓
Buscar CashRegister por ID
  ↓
Validar que no esté ya cerrada
  ↓
Buscar todas las Bills del día:
  SELECT * FROM bills
  WHERE pagadoEn >= todayStart 
    AND pagadoEn < tomorrowStart
    AND estado = "pagada"
  ↓
Iterar y contar:
  - Si metodoPago = "efectivo" → sumar a totalEfectivo
  - Si metodoPago = "sinpe" → sumar a totalSinpe
  ↓
Calcular:
  - totalIngresos = totalEfectivo + totalSinpe
  - montoCierre = montoApertura + totalIngresos
  ↓
Renderizar caja.cierre.ejs con valores calculados
  ↓
  (Usuario confirma)
  ↓
POST /cash/cierre
  ↓
Actualizar registro:
  - horaCierre = Date.now()
  - estado = "cerrada"
  - notas = campos opcionales
  ↓
Guardar en DB
  ↓
Limpiar session.cajaActiva
  ↓
Redirigir a /login
```

---

## 🔐 Validaciones de Seguridad

### Apertura
```javascript
1. requireLogin() - Usuario debe estar autenticado
2. Buscar apertura existente - evitar duplicados
3. Validar montoApertura >= 0
4. Registrar usuario en documento - solo él puede ver su caja
```

### Cierre
```javascript
1. requireLogin() - Usuario debe estar autenticado
2. Verificar session.cajaActiva existe
3. Verificar caja existe en DB
4. Verificar caja.usuario === session.user.username
5. Verificar caja.estado === "abierta" (no cerrada)
6. Solo obtener Bills con estado "pagada"
7. Solo contar Bills con pagadoEn dentro del mismo día
```

---

## 🗄️ Índices de Base de Datos

### Recomendado crear para optimización:

```javascript
// En MongoDB
db.cashregisters.createIndex({ fecha: 1, usuario: 1 })
db.bills.createIndex({ pagadoEn: 1, estado: 1 })
db.bills.createIndex({ mesa: 1, estado: 1 })
```

Estos índices mejoran significativamente las búsquedas en:
- Buscar apertura del día
- Obtener bills pagadas hoy
- Consultas por mesa

---

## 📱 Datos en Sesión

```javascript
req.session = {
  user: {
    username: "admin"
  },
  cajaActiva: "507f1f77bcf86cd799439011"  // ID de CashRegister
}
```

**Ventajas:**
- Acceso rápido al ID de caja sin query a BD
- Validación de que hay apertura activa
- Se limpia automáticamente en logout

---

## 🧮 Cálculos en Cierre

```javascript
// Datos que vienen del usuario (Bill):
- Bill.metodoPago: "efectivo" | "sinpe"
- Bill.total: número
- Bill.pagadoEn: timestamp

// Cálculos realizados:
totalEfectivo = SUM(Bill.total) WHERE Bill.metodoPago="efectivo"
totalSinpe = SUM(Bill.total) WHERE Bill.metodoPago="sinpe"
totalIngresos = totalEfectivo + totalSinpe
montoCierre = montoApertura + totalIngresos

// Ejemplo:
montoApertura = 50,000
totalEfectivo = 185,300
totalSinpe = 42,500
totalIngresos = 227,800
montoCierre = 277,800
```

---

## 🎨 Interfaz de Usuario

### Temas de Colores
```
- Primario: #667eea (morado)
- Secundario: #764ba2 (púrpura)
- Éxito: Verde Bootstrap
- Error: Rojo Bootstrap
```

### Componentes Reutilizables
```
- Summary Box: Resumen con gradiente
- Detail Row: Fila de dato/valor
- Card: Contenedor estándar
- Btn: Botones con estilos consistentes
```

---

## 🐛 Debugging

### Logs Útiles
```javascript
// En routes/cash.route.js agregué:
console.error("Error en GET /cash/apertura:", error);
console.error("Error en POST /cash/apertura:", error);
console.error("Error en GET /cash/cierre:", error);
console.error("Error en POST /cash/cierre:", error);
```

### Verificar Estado
```javascript
// En navegador, consola:
console.log(sessionStorage)  // Para ver session
// O hacer GET /session (si creas endpoint de debug)
```

---

## 📈 Escalabilidad

### Si necesitas agregar:

**Múltiples cajas simultáneamente:**
```javascript
// Agregar campo en CashRegister:
cajaNumero: Number  // 1, 2, 3...
// Actualizar índice:
db.cashregisters.createIndex({ fecha: 1, usuario: 1, cajaNumero: 1 })
```

**Remesas (retiros):**
```javascript
// Agregar sub-documentos:
remesas: [{
  monto: Number,
  hora: Date,
  motivo: String
}]
```

**Cierre con diferencias:**
```javascript
// Agregar campos:
efectivoContado: Number  // Lo que realmente contó
diferencia: Number       // efectivoContado - totalEfectivo
```

---

## ✅ Checklist de Integración

- [x] Crear modelo CashRegister
- [x] Crear rutas de cash (apertura/cierre/reporte)
- [x] Crear vistas (apertura/cierre/reporte)
- [x] Modificar auth para verificar caja activa
- [x] Modificar ruta raíz para redirigir a apertura
- [x] Agregar rutas de cash a server.js
- [x] Modificar navbar con botón de cierre
- [x] Validaciones completas
- [x] Documentación
- [ ] Pruebas en producción (pendiente - usuario debe hacer)

---

## 🚀 Para Poner en Producción

1. Crear la colección en MongoDB (o dejar que Mongoose lo haga)
2. Probar flujo completo: login → apertura → facturación → cierre
3. Verificar que método de pago se guarda correctamente en Bills
4. Verificar que pagadoEn se registra en cobro
5. Probar cierre manual
6. Revisar que los totales sean correctos

---

**Nota Final:** El sistema está completamente funcional. Solo necesita ser testeado con datos reales de facturación para validar que los cálculos son exactos.
