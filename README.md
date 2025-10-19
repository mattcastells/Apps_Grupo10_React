# RitmoFit - React Native (Expo)

App móvil para socios de la cadena de gimnasios **RitmoFit** - versión React Native con Expo.

## 📱 Descripción

Esta es la versión **React Native** de la aplicación RitmoFit, equivalente funcional del proyecto Android. Incluye:

- ✅ Autenticación con email/password y OTP
- ✅ Catálogo de clases con filtros
- ✅ Sistema de reservas y cancelaciones
- ✅ Perfil de usuario con edición y carga de fotos
- ✅ Historial de asistencias con reseñas
- ✅ Noticias y novedades
- ✅ Escaneo QR para check-in (preparado)

---

## 🛠️ Tecnologías

- **React Native** con **Expo SDK 54**
- **React Navigation** (Stack + Bottom Tabs)
- **Axios** para llamadas API
- **AsyncStorage** para persistencia
- **Expo Image Picker** para fotos
- **Expo Camera** para QR (preparado)

---

## 📋 Requisitos

- Node.js >= 20
- npm o yarn
- Expo CLI (se instala automáticamente)
- Para Android: Android Studio + emulador o dispositivo físico
- Para iOS: macOS + Xcode + simulador o dispositivo físico

---

## 🚀 Instalación y Ejecución

### 1. Instalar dependencias

```bash
npm install
```

### 2. Iniciar el servidor de desarrollo

```bash
npm start
```

### 3. Ejecutar en plataforma específica

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

**Web:**
```bash
npm run web
```

O escanea el código QR con la app **Expo Go** desde tu dispositivo físico.

---

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables (Button, Input, Card)
├── context/            # AuthContext para estado global
├── navigation/         # Navegación (AuthStack, MainTabs, AppNavigator)
├── screens/            # Pantallas de la app
│   ├── auth/          # Login, CreateUser, OTP
│   ├── main/          # Home, ClassDetail, Reservations
│   ├── profile/       # Profile, EditUser
│   ├── history/       # History, HistoryDetail
│   └── other/         # News, ScanQR
├── services/          # Servicios API
│   ├── apiClient.js   # Configuración Axios
│   ├── authService.js # Autenticación
│   ├── userService.js # Usuarios
│   ├── scheduleService.js # Clases
│   ├── bookingService.js  # Reservas
│   └── historyService.js  # Historial
└── utils/             # Utilidades
    ├── constants.js   # Constantes (colores, API, etc.)
    ├── helpers.js     # Funciones auxiliares
    └── SessionManager.js # Manejo de sesión
```

---

## 🔧 Configuración del Backend

Por defecto, la app apunta a:

```javascript
BASE_URL: 'http://10.0.2.2:8080/api/v1'  // Android Emulator
```

### Para cambiar la URL del backend:

Edita `src/utils/constants.js`:

```javascript
export const API_CONFIG = {
  // Android Emulator
  BASE_URL: 'http://10.0.2.2:8080/api/v1',

  // iOS Simulator
  // BASE_URL: 'http://localhost:8080/api/v1',

  // Dispositivo físico (usa tu IP local)
  // BASE_URL: 'http://192.168.1.XXX:8080/api/v1',

  TIMEOUT: 30000,
};
```

---

## 🎨 Colores de RitmoFit

```javascript
PRIMARY: '#F26A3E'      // Naranja principal
SECONDARY: '#232323'    // Negro
BACKGROUND: '#FFFFFF'   // Blanco
ERROR: '#FF3B30'        // Rojo error
SUCCESS: '#34C759'      // Verde éxito
```

---

## 📱 Pantallas Implementadas

### Autenticación
- **LoginScreen**: Email, password, validación
- **CreateUserScreen**: Registro completo con validaciones
- **OtpScreen**: Verificación de email con código de 6 dígitos

### Principal
- **HomeScreen**: Catálogo de clases con filtros (disciplina, sede)
- **ClassDetailScreen**: Detalle completo, botón reservar, ver mapa
- **ReservationsScreen**: Mis reservas con opción de cancelar

### Perfil
- **ProfileScreen**: Info de usuario, editar, cambiar foto, logout
- **EditUserScreen**: Edición de datos personales

### Historial
- **HistoryScreen**: Asistencias de últimos 30 días
- **HistoryDetailScreen**: Detalle con reseña (rating + comentario)

### Otros
- **NewsScreen**: Noticias y promociones
- **ScanQRScreen**: Escaneo QR para check-in

---

## 🔐 Autenticación

El flujo de autenticación usa:

1. **Login**: `POST /auth/login` → Token JWT
2. **Registro**: `POST /auth/register` → Envío OTP
3. **Verificación**: `POST /auth/verify-email` → Cuenta activada
4. **Token**: Se guarda en AsyncStorage y se envía automáticamente en headers

```javascript
Authorization: Bearer <token>
```

---

## 📡 Endpoints API

### Auth
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/verify-email`

### Users
- `GET /users/{id}`
- `PUT /users/{id}`
- `PUT /users/{id}/photo`

### Schedule
- `GET /schedule/weekly`
- `GET /schedule/{classId}`

### Booking
- `GET /booking/my-bookings`
- `POST /booking`
- `DELETE /booking/{bookingId}`

### History
- `GET /history/users/{userId}?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /history/attendances/{attendanceId}`

---

## 🧪 Testing

Para ejecutar tests (cuando estén implementados):

```bash
npm test
```

---

## 📝 Notas Importantes

### AsyncStorage
Todos los datos de sesión se guardan localmente:
- Token JWT
- User ID
- Email
- Datos de usuario

### Navegación
- **AuthStack**: Pantallas de autenticación (Login, Register, OTP)
- **MainTabs**: 6 tabs con bottom navigation
- La navegación cambia automáticamente según el estado de autenticación

### Componentes Reutilizables
- **Button**: Botón con variantes (primary, secondary, outline, danger)
- **Input**: Input con label y mensaje de error
- **Card**: Card genérica para listas

---

## 🚧 Funcionalidades Pendientes

Si bien la estructura está completa, algunas funcionalidades requieren integración adicional:

- [ ] Integración completa de Expo Camera para QR
- [ ] Integración con Google Maps para ubicaciones
- [ ] Upload de imágenes a Cloudinary
- [ ] Push notifications
- [ ] Biometría (huella/Face ID) opcional
- [ ] Tests unitarios y de integración

---

## 🐛 Troubleshooting

### Error al conectar con backend
- Verifica que el backend esté corriendo en `localhost:8080`
- Usa la IP correcta según tu plataforma (emulador Android: `10.0.2.2`, iOS: `localhost`)

### App no arranca
```bash
# Limpia cache de Expo
npx expo start -c

# Reinstala dependencias
rm -rf node_modules
npm install
```

### AsyncStorage no funciona
- Verifica que `@react-native-async-storage/async-storage` esté instalado
- Reconstruye el proyecto

---

## 📄 Licencia

Proyecto académico - Grupo 10

---

## 👥 Autores

- Sebastian Porini
- Matt Castells
- [Agregar más miembros del equipo]

---

## 🔗 Repositorios Relacionados

- **Backend (Spring Boot)**: `Apps_Grupo10_Backend`
- **Android (Kotlin/Java)**: `Apps_Grupo10_Android`
- **React Native (Expo)**: `Apps_Grupo10_React` (este repo)

---

**¡Disfruta entrenando con RitmoFit! 💪🏋️‍♀️**
