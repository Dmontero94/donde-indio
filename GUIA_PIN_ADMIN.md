# 🔐 Sistema de PIN para Administración del Menú

## Configuración Inicial

### 1. Configurar el PIN en el archivo `.env`:
```
ADMIN_PIN=1234
```
**⚠️ IMPORTANTE:** Cambia `1234` por tu PIN de seguridad (4-6 dígitos)

---

## 🎯 Cómo Funciona

### **Flujo de Acceso:**

1. **Login Normal** → Todos los usuarios ingresan con:
   - Usuario: `DondeIndioAdmin`
   - Contraseña: `RestIndi02025!`

2. **Acceso al Admin del Menú** → Solo quien tenga el PIN puede:
   - Al hacer clic en "📋 Admin Menú" se solicita el PIN
   - Interfaz con teclado numérico (táctil y físico)
   - Una vez validado, queda activo durante toda la sesión

3. **Bloquear Acceso** → Botón "🔒 Bloquear" en la vista de admin
   - Invalida el PIN en la sesión actual
   - Volverá a solicitarlo la próxima vez

---

## 🔒 Niveles de Seguridad

### **Nivel 1: Login de Usuario**
- Protege el acceso al sistema completo
- Todos los empleados conocen estas credenciales

### **Nivel 2: PIN de Administrador**
- Protege solo la administración del menú
- Solo tú conoces este PIN
- Se solicita cada vez que se inicia sesión

---

## 📱 Características del PIN

✅ **Teclado Táctil** - Funciona en tablets y pantallas táctiles
✅ **Teclado Físico** - También funciona con teclado normal
✅ **4-6 Dígitos** - Puedes usar PIN de 4 o 6 números
✅ **Protección Visual** - Los dígitos se ocultan (••••)
✅ **Sesión Persistente** - Una vez ingresado, válido hasta cerrar sesión o bloquear

---

## 🔧 Cambiar el PIN

Edita el archivo `.env`:
```env
ADMIN_PIN=tu_nuevo_pin
```

**Reinicia el servidor** para aplicar cambios.

---

## 🛡️ Recomendaciones de Seguridad

1. **Cambia el PIN por defecto** (`1234`)
2. **Usa un PIN que no sea obvio** (evita 0000, 1111, etc.)
3. **No compartas el PIN** con empleados regulares
4. **Usa el botón "Bloquear"** cuando te alejes del sistema

---

## ✅ Rutas Protegidas

Todas estas rutas requieren PIN validado:
- `GET /productos/admin` - Vista de administración
- `POST /productos/admin/crear` - Crear productos
- `PUT /productos/admin/editar/:id` - Editar productos
- `DELETE /productos/admin/eliminar/:id` - Eliminar productos

---

## 🔄 Cerrar Sesión del PIN

**Opción 1:** Botón "🔒 Bloquear" en la vista de admin
**Opción 2:** Visita `/productos/admin/logout-pin`
**Opción 3:** Cierra sesión completamente (Cerrar sesión en navbar)

---

## 📝 Ejemplo de Uso

**Caso de Uso:**
- Juan (mesero) puede tomar órdenes en mesas → Solo necesita login
- Tú (admin) necesitas cambiar precios → Necesitas login + PIN

Esto evita que los empleados modifiquen accidentalmente el menú.
