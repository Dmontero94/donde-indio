# 🏪 Sistema de Apertura y Cierre de Caja - Donde Indio

## ✨ Características Nuevas

Hemos implementado un completo sistema de **apertura y cierre de caja** que:

- 🔓 **Requiere apertura obligatoria** antes de iniciar jornada
- 💰 **Registra monto inicial** en efectivo
- 📊 **Contabiliza automáticamente** todos los ingresos del día
- 💵 **Separa por método de pago**: Efectivo y SINPE
- 🔒 **Genera reportes detallados** de cierre
- 📋 **Mantiene historial** de apertura y cierre diario

---

## 🚀 Instalación

### 1. Actualizar la Base de Datos

Necesitas crear el nuevo modelo de CashRegister. Si usas MongoDB, ejecuta lo siguiente en tu conexión:

```javascript
// En MongoDB Compass o terminal:
db.createCollection('cashregisters', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["fecha", "usuario", "estado"],
      properties: {
        fecha: { bsonType: "date" },
        usuario: { bsonType: "string" },
        montoApertura: { bsonType: "double" },
        horaApertura: { bsonType: "date" },
        totalEfectivo: { bsonType: "double" },
        totalSinpe: { bsonType: "double" },
        totalIngresos: { bsonType: "double" },
        montoCierre: { bsonType: "double" },
        horaCierre: { bsonType: "date" },
        estado: { enum: ["abierta", "cerrada"] }
      }
    }
  }
});
```

**Nota:** Mongoose creará automáticamente la colección en la primera inserción, así que si no quieres hacerlo manualmente, simplemente ejecuta el servidor y haz login.

---

## 📖 Guía de Uso

### 👤 Flujo de Usuario

#### **1. Login**
```
1. Ingresa usuario y contraseña
2. El sistema verifica si hay caja abierta hoy
3. Si NO → Redirige a apertura de caja
4. Si SÍ → Redirige al inicio
```

#### **2. Apertura de Caja** (`/cash/apertura`)
```
1. Ingresa monto inicial en efectivo
2. Ejemplo: ₡50,000 (apertura del día)
3. Clic en "✓ Abrir Caja"
4. Sistema registra fecha, hora, usuario y monto
5. Redirige a inicio para comenzar a facturar
```

#### **3. Operación Normal**
```
1. Accede a Mesas → Selecciona mesa → Agrega productos
2. Cobra la mesa seleccionando método de pago:
   - EFECTIVO: ingresa monto recibido
   - SINPE: se registra automáticamente
3. El sistema registra método de pago y timestamp
```

#### **4. Cierre de Caja** (`/cash/cierre`)
```
1. Botón "🔒 Cerrar Caja" en navbar (arriba a la derecha)
2. Sistema muestra resumen automático:
   - Monto de apertura
   - Total ingresos en efectivo
   - Total ingresos en SINPE
   - Total en caja
3. Opcionalmente ingresa notas
4. Clic en "🔒 Cerrar Caja"
5. Caja se marca como cerrada
6. Sesión se limpia
7. Redirige a login
```

---

## 📊 Ejemplo de Cierre

```
┌─────────────────────────────────────────┐
│     💰 RESUMEN DE CIERRE DE CAJA        │
│                                         │
│  Fecha: Lunes 29 de Diciembre 2025     │
│  Usuario: admin                         │
├─────────────────────────────────────────┤
│                                         │
│  🔓 Apertura:          ₡50,000.00      │
│  💵 Efectivo:         ₡185,300.00      │
│  📱 SINPE:             ₡42,500.00      │
│  ─────────────────────────────────     │
│  📊 Ingresos del día:  ₡227,800.00     │
│  ─────────────────────────────────     │
│  🔒 TOTAL EN CAJA:    ₡277,800.00      │
│                                         │
│  ⏰ Abierto: 08:30 AM                  │
│  ⏰ Cerrado: 09:45 PM                  │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔧 Archivos Incluidos

### Modelos
- **`models/cashregister.model.js`** - Esquema para cajas diarias

### Rutas
- **`routes/cash.route.js`** - Lógica completa de apertura/cierre

### Vistas
- **`views/caja.apertura.ejs`** - Pantalla de ingreso de monto inicial
- **`views/caja.cierre.ejs`** - Pantalla de cierre con resumen
- **`views/caja.reporte.ejs`** - Reporte detallado (imprimible)

### Modificaciones
- **`server.js`** - Registro de rutas y lógica de redireccionamiento
- **`routes/auth.route.js`** - Verificación de caja activa post-login
- **`views/partials/navbar.ejs`** - Botón para cierre de caja

---

## 🔒 Seguridad

✅ **Autenticación requerida** para acceder a cualquier función
✅ **Validación de usuario** - solo ve su propia caja
✅ **Caja cerrada inmodificable** - una vez cerrada, no se puede reabrirse
✅ **Una apertura por día** - evita duplicados
✅ **Contabilización automática** - sin errores manuales

---

## 📱 API/Rutas Disponibles

### **GET** `/cash/apertura`
Muestra formulario de apertura de caja

### **POST** `/cash/apertura`
Procesa la apertura
- **Body:** `{ montoApertura: number }`
- **Redirige a:** `/`

### **GET** `/cash/cierre`
Muestra pantalla de cierre con resumen automático

### **POST** `/cash/cierre`
Procesa el cierre
- **Body:** `{ notas?: string }`
- **Response:** JSON con datos de cierre

### **GET** `/cash/reporte/:cajaId`
Muestra reporte de cierre específico (imprimible)

---

## 🛠️ Validaciones Implementadas

### Apertura
- ✅ Valida que el monto no sea negativo
- ✅ Verifica que no exista apertura duplicada el mismo día
- ✅ Registra automáticamente fecha, hora y usuario

### Cierre
- ✅ Verifica que haya caja activa
- ✅ Calcula automáticamente totales sin intervención manual
- ✅ Contabiliza solo facturas con estado "pagada"
- ✅ Separa correctamente por método de pago
- ✅ Previene cierre duplicado

---

## 💡 Casos de Uso

### **Caso 1: Aún No Hay Caja Abierta**
```
Usuario login → Sistema verifica → No encuentra apertura hoy
→ Redirige a /cash/apertura → Usuario abre caja
```

### **Caso 2: Caja Ya Abierta (Mismo Usuario, Mismo Día)**
```
Usuario login → Sistema verifica → Encuentra caja abierta
→ Restaura sesión automáticamente → Redirige a inicio
```

### **Caso 3: Necesita Cerrar Antes de Terminar Día**
```
Usuario hace clic en "🔒 Cerrar Caja"
→ Ve resumen detallado calculado automáticamente
→ Revisa números y agrega notas si es necesario
→ Confirma cierre → Caja se marca como "cerrada"
```

---

## 📊 Estructura de Datos

### Documento CashRegister
```javascript
{
  _id: ObjectId,
  fecha: Date,              // 2025-12-29 00:00:00
  usuario: String,          // "admin"
  montoApertura: Number,    // 50000
  horaApertura: Date,       // 2025-12-29 08:30:00
  totalEfectivo: Number,    // 185300
  totalSinpe: Number,       // 42500
  totalIngresos: Number,    // 227800
  montoCierre: Number,      // 277800 (apertura + ingresos)
  horaCierre: Date,         // 2025-12-29 21:45:00
  estado: String,           // "cerrada"
  facturas: Array,          // Referencias a Bills pagadas
  notas: String,            // "Diferencia de 500 colones"
  creadoEn: Date            // Timestamp de creación
}
```

---

## 🐛 Troubleshooting

### **Problema:** "No hay caja abierta" al hacer login
**Solución:** Es lo esperado. Ingresa el monto inicial en la pantalla de apertura.

### **Problema:** No aparece el botón "Cerrar Caja"
**Solución:** Verifica que estés autenticado. El botón solo aparece con navbar.

### **Problema:** El cierre muestra ₡0 en todos los campos
**Solución:** Asegúrate que las facturas fueron pagadas (estado = "pagada") con `pagadoEn` registrado.

### **Problema:** Diferencia entre efectivo contado y sistema
**Solución:** Usa campo de notas en cierre para documentar diferencias.

---

## 🚀 Mejoras Futuras

### Posibles expansiones:
- 📊 Reporte histórico de cierres pasados
- 📄 Exportar cierre a PDF/Excel
- ⚠️ Alertas por diferencias en caja
- 🏪 Soporte para múltiples cajas simultáneamente
- 💰 Remesas (retiros parciales de caja)
- 🔔 Notificaciones por email con cierre
- 📈 Gráficas de ingresos por día/semana/mes
- 🗂️ Categorización de ingresos/egresos

---

## 📞 Soporte

Si necesitas modificaciones o tienes preguntas, contacta al desarrollador.

---

**Versión:** 1.0  
**Fecha:** Diciembre 29, 2025  
**Desarrollado para:** Restaurante y Cevichería Donde Indio
