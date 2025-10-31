# RitmoFit API Endpoints - React Native

Este documento describe todos los endpoints del backend configurados en la aplicación React Native.

## Configuración Base

**URL Base:** `http://localhost:8080/api/v1`

**Nota:** Para desarrollo con dispositivos físicos, reemplaza `localhost` con la IP de tu máquina (ej: `http://192.168.1.100:8080/api/v1`)

---

## 🔐 Authentication Service (`authService.js`)

### Login
- **Endpoint:** `POST /auth/login`
- **Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "token": "string"
  }
  ```

### Register
- **Endpoint:** `POST /auth/register`
- **Body:**
  ```json
  {
    "email": "string",
    "password": "string",
    "name": "string",
    "age": number,
    "gender": "string"
  }
  ```
- **Response:**
  ```json
  {
    "message": "string"
  }
  ```

### Verify Email
- **Endpoint:** `POST /auth/verify-email`
- **Body:**
  ```json
  {
    "email": "string",
    "otp": "string"
  }
  ```
- **Response:**
  ```json
  {
    "message": "string"
  }
  ```

---

## 📅 Schedule Service (`scheduleService.js`)

### Get Weekly Schedule
- **Endpoint:** `GET /schedule/weekly`
- **Auth:** Required (Bearer Token)
- **Response:**
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "professor": "string",
      "dateTime": "string (ISO 8601)",
      "durationMinutes": number,
      "availableSlots": number
    }
  ]
  ```

### Get Class Detail
- **Endpoint:** `GET /schedule/{classId}`
- **Auth:** Required (Bearer Token)
- **Response:**
  ```json
  {
    "id": "string",
    "name": "string",
    "professor": "string",
    "dateTime": "string (ISO 8601)",
    "durationMinutes": number,
    "availableSlots": number
  }
  ```

---

## 📝 Booking Service (`bookingService.js`)

### Get My Bookings
- **Endpoint:** `GET /booking/my-bookings`
- **Auth:** Required (Bearer Token)
- **Response:**
  ```json
  [
    {
      "bookingId": "string",
      "className": "string",
      "classDateTime": "string (ISO 8601)",
      "professor": "string",
      "status": "string"
    }
  ]
  ```

### Create Booking
- **Endpoint:** `POST /booking`
- **Auth:** Required (Bearer Token)
- **Body:**
  ```json
  {
    "scheduledClassId": "string"
  }
  ```
- **Response:**
  ```json
  {
    "bookingId": "string",
    "className": "string",
    "classDateTime": "string",
    "professor": "string",
    "status": "string"
  }
  ```

### Cancel Booking
- **Endpoint:** `DELETE /booking/{bookingId}`
- **Auth:** Required (Bearer Token)
- **Response:** `204 No Content` or confirmation message

---

## 📊 History Service (`historyService.js`)

### Get My History
- **Endpoint:** `GET /history/users/{userId}?from=YYYY-MM-DD&to=YYYY-MM-DD`
- **Auth:** Required (Bearer Token)
- **Query Params:**
  - `from`: Start date (YYYY-MM-DD format)
  - `to`: End date (YYYY-MM-DD format)
- **Response:**
  ```json
  [
    {
      "attendanceId": "string",
      "className": "string",
      "classDateTime": "string",
      "professor": "string",
      "status": "string"
    }
  ]
  ```

### Get Attendance Detail
- **Endpoint:** `GET /history/attendances/{attendanceId}`
- **Auth:** Required (Bearer Token)
- **Response:**
  ```json
  {
    "attendanceId": "string",
    "className": "string",
    "classDateTime": "string",
    "professor": "string",
    "status": "string",
    "duration": number,
    "caloriesBurned": number
  }
  ```

---

## 👤 User Service (`userService.js`)

### Get User
- **Endpoint:** `GET /users/{id}`
- **Auth:** Required (Bearer Token)
- **Response:**
  ```json
  {
    "email": "string",
    "name": "string",
    "age": number,
    "gender": "string",
    "profilePicture": "string"
  }
  ```

### Update User
- **Endpoint:** `PUT /users/{id}`
- **Auth:** Required (Bearer Token)
- **Body:**
  ```json
  {
    "email": "string",
    "name": "string",
    "age": number,
    "gender": "string",
    "password": "string"
  }
  ```

### Update Profile Photo
- **Endpoint:** `PUT /users/{id}/photo`
- **Auth:** Required (Bearer Token)
- **Body:**
  ```json
  {
    "profilePicture": "string (URL or base64)"
  }
  ```

---

## 🔑 Authentication Headers

Todos los endpoints que requieren autenticación deben incluir el header:

```
Authorization: Bearer {token}
```

El token se obtiene del login o verificación de email y se almacena automáticamente usando `SessionManager`.

---

## ⚙️ Error Handling

Todos los servicios manejan errores de forma consistente:

- **401 Unauthorized:** Token inválido o expirado (se limpia la sesión automáticamente)
- **400 Bad Request:** Datos inválidos en la petición
- **404 Not Found:** Recurso no encontrado
- **500 Internal Server Error:** Error del servidor

---

## 🧪 Modo Mock

Para habilitar el modo mock (útil para desarrollo sin backend):

```javascript
// En src/utils/constants.js
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api/v1',
  TIMEOUT: 30000,
  USE_MOCK: true, // Cambiar a true para usar datos simulados
};
```

---

## 📱 Configuración para Dispositivos Físicos

Si estás probando en un dispositivo físico en la misma red:

1. Encuentra tu IP local:
   - Windows: `ipconfig` en CMD
   - Mac/Linux: `ifconfig` en terminal

2. Actualiza la URL base en `src/utils/constants.js`:
   ```javascript
   BASE_URL: 'http://192.168.1.XXX:8080/api/v1'
   ```

3. Asegúrate de que tu backend esté escuchando en `0.0.0.0` y no solo en `localhost`

---

## 🔄 Cambios Principales Realizados

### 1. URL Base
- **Antes:** `http://10.0.2.2:8080/api/v1` (Android emulator)
- **Ahora:** `http://localhost:8080/api/v1` (React Native)

### 2. Endpoints de Booking
- **Antes:** `/bookings/*`
- **Ahora:** `/booking/*`

### 3. Endpoints de History
- **Antes:** `/attendance/*`
- **Ahora:** `/history/*`

### 4. Método de History
- **Antes:** `GET /attendance/my-history?userId={id}&from={date}&to={date}`
- **Ahora:** `GET /history/users/{userId}?from={date}&to={date}`

### 5. Update Photo Request
- **Antes:** `{ photoUrl: "..." }`
- **Ahora:** `{ profilePicture: "..." }`

### 6. Métodos Eliminados
Los siguientes métodos fueron eliminados por no existir en el backend de Android:
- `userService.uploadPhoto()`
- `userService.deleteUser()`
- `userService.changePassword()`
- `historyService.getAllHistory()`
- `historyService.getStatistics()`
- `historyService.submitReview()`
- `historyService.recordAttendance()`
- `bookingService.getUpcomingBookings()` (existe pero puede que no esté implementado)
- `bookingService.getPastBookings()` (existe pero puede que no esté implementado)
- `bookingService.checkAvailability()` (existe pero puede que no esté implementado)

---

## ✅ Verificación

Para verificar que todo está funcionando correctamente:

1. Asegúrate de que el backend esté corriendo en `http://localhost:8080`
2. Desactiva el modo mock: `USE_MOCK: false` en `constants.js`
3. Prueba el flujo de login desde la aplicación
4. Verifica que se reciba el token correctamente
5. Prueba las demás funcionalidades autenticadas

---

**Última actualización:** Octubre 31, 2025
