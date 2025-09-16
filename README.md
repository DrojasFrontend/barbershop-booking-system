# 🔥 BarberShop - Sistema de Turnos Inteligente

Una aplicación web moderna para gestionar turnos de barbería con reservas inteligentes y comunicación en tiempo real.

## ✨ Características Principales

- 🗓️ **Reservas Inteligentes**: Sistema de calendario que previene conflictos de horarios
- 👥 **Panel Dual**: Interfaces optimizadas para clientes y barberos
- ⚡ **Tiempo Real**: Notificaciones instantáneas con Socket.IO
- 🔐 **Autenticación Segura**: Acceso protegido para barberos
- 📱 **Responsive**: Funciona perfectamente en móvil y desktop
- 🔍 **Búsqueda de Turnos**: Clientes pueden consultar sus citas por nombre/teléfono

## 🚀 Tecnologías

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes, Socket.IO
- **Base de Datos**: SQLite + Prisma ORM
- **Autenticación**: Sistema personalizado con cookies seguras
- **Tiempo Real**: Socket.IO para notificaciones instantáneas

## 📦 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repo>
   cd barbershop-app
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar base de datos**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Crear usuario barbero**
   ```bash
   node scripts/create-barber.js
   ```

5. **Datos de prueba (opcional)**
   ```bash
   node prisma/seed.js
   ```

6. **Iniciar la aplicación**
   ```bash
   npm run dev
   ```

7. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🔐 Autenticación

### Credenciales de Prueba
- **Email**: barbero@test.com
- **Contraseña**: 123456

## 🎯 Uso

### Para Clientes
1. Ve a `/cliente`
2. Completa el formulario con tus datos
3. Selecciona el servicio deseado
4. Envía la solicitud
5. Recibe confirmación en tiempo real

### Para Barberos
1. Ve a `/login` e inicia sesión
2. Accede automáticamente al panel del barbero
3. Ve las solicitudes pendientes en tiempo real
4. Aprueba o rechaza turnos
5. Asigna horarios específicos
6. Marca turnos como completados
7. Cierra sesión cuando termines

## 🔧 Estructura del Proyecto

```
barbershop-app/
├── src/
│   ├── app/
│   │   ├── api/appointments/     # APIs REST
│   │   ├── cliente/             # Panel del cliente
│   │   ├── barbero/             # Panel del barbero
│   │   └── page.js              # Página principal
│   └── lib/
│       └── prisma.js            # Configuración de Prisma
├── prisma/
│   ├── schema.prisma            # Esquema de base de datos
│   └── seed.js                  # Datos de prueba
└── server.js                    # Servidor con Socket.IO
```

## 📊 Base de Datos

### Modelo Appointment
- `id`: Identificador único
- `clientName`: Nombre del cliente
- `clientPhone`: Teléfono del cliente
- `service`: Tipo de servicio
- `status`: Estado (pending, approved, rejected, completed)
- `requestedAt`: Fecha de solicitud
- `scheduledAt`: Fecha programada
- `notes`: Notas adicionales

## 🌟 Funcionalidades en Tiempo Real

- **Nuevas Solicitudes**: Los barberos reciben notificaciones instantáneas
- **Actualizaciones de Estado**: Los clientes ven cambios en tiempo real
- **Notificaciones del Navegador**: Alertas push para barberos

## 🚀 Despliegue

### Desarrollo Local
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

### Deploy en Railway/Render
1. Conectar repositorio de GitHub
2. Configurar variables de entorno (ver `.env.example`)
3. Deploy automático

### Variables de Entorno Requeridas
```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-app-url.com"
```

## 🔮 Próximas Mejoras

- [ ] Autenticación de barberos
- [ ] Múltiples barberos
- [ ] Calendario visual
- [ ] Notificaciones por SMS/WhatsApp
- [ ] Sistema de pagos
- [ ] Historial de clientes
- [ ] Métricas y reportes

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

MIT License - ve el archivo LICENSE para más detalles.

---

**¡Disfruta gestionando tu barbería! ✂️**