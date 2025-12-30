# ⚡ Quick Start - Sistema de Caja (5 minutos)

## 🚀 Pasos Rápidos

### 1️⃣ Reinicia el servidor
```bash
npm run dev
# o
npm start
```

### 2️⃣ Accede a la aplicación
```
http://localhost:4000/login
```

### 3️⃣ Haz login
- Usuario: [tu usuario configurado en .env]
- Contraseña: [tu contraseña configurada en .env]

✨ **Se redirige automáticamente a `/cash/apertura`**

### 4️⃣ Abre caja
- Ingresa monto inicial (ej: `50000`)
- Click en "✓ Abrir Caja"

✨ **Se redirige a inicio, ahora tienes acceso total**

### 5️⃣ Factura normalmente
- Ve a Mesas
- Selecciona mesa → Agrega productos → Cobra
- Selecciona método de pago (Efectivo o SINPE)

✨ **Sistema registra automáticamente**

### 6️⃣ Cierra caja
- Click en "🔒 Cerrar Caja" (navbar arriba a la derecha)
- Revisa resumen automático
- Click en "🔒 Cerrar Caja" para confirmar

✨ **¡Listo! Caja cerrada**

---

## 📋 Lo Que Pasó

```
┌──────────────────────────────────────────────────┐
│              AUTOMÁTICO, SIN CONFIG               │
├──────────────────────────────────────────────────┤
│                                                  │
│  ✅ Se creó modelo CashRegister en MongoDB      │
│  ✅ Se agregaron 4 rutas de caja                │
│  ✅ Se crearon 3 vistas profesionales           │
│  ✅ Se modificó flow de login                   │
│  ✅ Se agregó botón de cierre en navbar         │
│  ✅ Se modificó ruta raíz                       │
│                                                  │
│  🎯 RESULTADO: Sistema funcional end-to-end    │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 🤔 Preguntas Comunes

### **P: ¿Qué pasa si reinicio sesión?**
A: El sistema busca si hay caja abierta hoy. Si existe, la restaura automáticamente. No necesitas abrir nuevamente.

### **P: ¿Puedo tener múltiples cajas abiertas?**
A: No, sistema permite una apertura por usuario/día. Si intentas abrir dos, te da error.

### **P: ¿Qué pasa si me voy sin cerrar caja?**
A: Nada malo. Mañana cuando hagas login, sistema te deja cerrar la caja anterior.

### **P: ¿Cómo sé qué montos cobré en efectivo vs SINPE?**
A: Sistema calcula automáticamente en el cierre, mostrando totales separados.

### **P: ¿Se puede editar después de cerrar?**
A: No, es irreversible. Por eso hay pantalla de confirmación antes de cerrar.

### **P: ¿Dónde se guardan los datos?**
A: En MongoDB, en colección `cashregisters` + historial en `bills`.

---

## 🎯 Flujo Visual

```
Login
  ↓
¿Hay caja abierta hoy?
  ├─ SÍ → Restaura y va a Inicio
  └─ NO → Va a Apertura
  
Apertura
  ├─ Ingresa ₡50,000
  └─ Abre → Va a Inicio

Inicio (con caja activa)
  ├─ Mesas
  ├─ Reportes
  └─ 🔒 Cerrar Caja ← New!

Cierre
  ├─ Muestra resumen automático
  ├─ Ingresas nota (opcional)
  └─ Confirmas → Caja cerrada

Logout (automático después de cierre)
  ↓
Mañana, nuevo login → Nueva apertura
```

---

## 📊 Datos Guardados

Cada cierre genera documento con:
```
{
  fecha: "2025-12-29",
  usuario: "admin",
  montoApertura: 50000,
  totalEfectivo: 185300,
  totalSinpe: 42500,
  totalIngresos: 227800,
  montoCierre: 277800,
  estado: "cerrada"
}
```

**Útil para:**
- 📈 Ver ingresos por día
- 📊 Hacer reportes
- 🔍 Auditar operaciones

---

## ⚙️ Configuración (NO necesaria)

Todo está pre-configurado. No necesitas hacer nada especial.

### Pero si quieres personalizar:

#### Variables de sesión
**Archivo:** `server.js` línea ~25
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET || "fallback-secret",
  // Aquí puedes cambiar tiempo de expiración de sesión
}));
```

#### Estilos
**Archivos:** `views/caja.*.ejs`
- Bootstrap 5 incluido
- Colores: morado (`#667eea`) y púrpura (`#764ba2`)
- Modifica estilos en `<style>` si quieres otros colores

#### Mensajes
**Archivos:** `routes/cash.route.js`
- Todos los mensajes de error están en el código
- Modifica si quieres otros textos

---

## 🆘 Si Algo No Funciona

### Error: "No hay caja abierta"
- Recarga la página
- Intenta login nuevamente
- Verifica credenciales

### Error: "Monto no puede ser negativo"
- Ingresa número positivo
- Formato: solo números (ej: 50000)

### Cierre muestra ₡0 en todo
- Asegúrate de haber cobrado al menos una factura
- El método de pago debe ser "efectivo" o "sinpe"
- La factura debe tener estado "pagada"

### Botón "Cerrar Caja" no aparece
- Verifica que estés en una vista con navbar
- Recarga la página (F5)
- Abre las herramientas de desarrollador (F12)

---

## 📚 Documentación Disponible

Para más detalles, lee:

| Documento | Para qué | Tiempo |
|-----------|----------|--------|
| **RESUMEN_IMPLEMENTACION.md** | Vista general | 5 min |
| **APERTURA_CIERRE_CAJA.md** | Guía de usuario | 10 min |
| **NOTAS_TECNICAS_CAJA.md** | Detalles técnicos | 15 min |
| **PRUEBA_SISTEMA_CAJA.md** | Testing completo | 30 min |
| **GUIA_CAJA.md** | Referencia rápida | 3 min |

---

## 💡 Tips Útiles

✨ **Consejo 1:** Documenta diferencias en el campo de notas del cierre
```
Ejemplo: "Se encontró diferencia de +500 colones en efectivo"
```

✨ **Consejo 2:** Cierra caja todos los días, aunque no haya vendido nada
```
Apertura: ₡50,000
Sin ventas
Cierre: ₡50,000 (igual a apertura)
```

✨ **Consejo 3:** Guarda reportes de cierre como respaldo
```
Pantalla de cierre → 🖨️ Imprimir Reporte → Guardar como PDF
```

✨ **Consejo 4:** Si hay diferencia, investiga
```
El sistema suma automáticamente Bills pagadas
Si diferencia ≠ 0, revisa:
  - ¿Se cobraron todas las mesas?
  - ¿El método de pago es correcto?
```

---

## 🔗 Rutas Disponibles

```
GET  /cash/apertura        → Formulario de apertura
POST /cash/apertura        → Procesar apertura
GET  /cash/cierre          → Pantalla de cierre
POST /cash/cierre          → Procesar cierre
GET  /cash/reporte/:cajaId → Ver reporte
```

---

## ✅ Checklist Inicial

- [ ] Servidor ejecutándose (`npm run dev`)
- [ ] Acceso a `http://localhost:4000/login`
- [ ] Login exitoso → Redirige a apertura
- [ ] Apertura completada
- [ ] Acceso a mesas y reportes
- [ ] Botón "🔒 Cerrar Caja" visible en navbar
- [ ] Cierre funcional

**Si todos los checks pasan → ¡Sistema listo! 🎉**

---

## 📞 Soporte Rápido

**Problema:** Sesión se pierde al cierre
**Solución:** Es normal, debe hacer login nuevamente

**Problema:** No puedo abrir caja
**Solución:** Verifica que sea tu primer login del día

**Problema:** Números no coinciden en cierre
**Solución:** Verifica que todas las facturas se hayan cobrado

**Problema:** No sé qué montos ingresé al abrir
**Solución:** Revisa en MongoDB o guarda screenshot

---

## 🚀 Listo para Comenzar

```
1. ✅ Código implementado
2. ✅ BD lista (MongoDB)
3. ✅ Documentación completa
4. ✅ Sistema testeado

     SIMPLEMENTE:
     npm run dev
     → Login
     → ¡A facturar!
```

---

**¿Preguntas adicionales?** Lee los otros archivos de documentación.

**¿Lista para producción?** Todo está listo, solo ejecuta el servidor. 🚀
