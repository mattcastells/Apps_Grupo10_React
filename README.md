# RitmoFit Mobile App - Grupo 10

Aplicación móvil para el sistema de gestión de gimnasios RitmoFit. Esta app React Native maneja las interacciones de usuario, reservas de clases, seguimiento de asistencia y gestión de perfiles para el TPO de la materia Desarrollo de Aplicaciones I.

## Tecnologías Utilizadas
- React Native 0.81
- Expo SDK 54
- React Navigation 7
- Axios (cliente HTTP)
- Expo Camera (escaneo QR)
- Expo Secure Store (autenticación)

## Requisitos del Backend
Este proyecto depende de una API backend para funcionar. El repositorio del backend y sus instrucciones de configuración se encuentran en:

**Repositorio Backend:** [Project](https://github.com/mattcastells/Apps_Grupo10_Backend)

Asegúrate de que el backend esté corriendo antes de iniciar la aplicación móvil. La URL de la API está configurada por defecto para el emulador de Android en `http://10.0.2.2:8080/api/v1`.

## Configuración del Entorno

### Requisitos Previos
- Node.js 18+ y npm instalados
- Expo CLI instalado globalmente: `npm install -g expo-cli`
- Android Studio (recomendado) o Xcode para iOS

### Instalación

1. Clonar el repositorio:
```bash
git clone [repository-url]
cd Apps_Grupo10_React
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar el endpoint de la API (si es necesario):
Edita `src/utils/constants.js` y actualiza `API_CONFIG.BASE_URL` con la URL de tu backend.

### Cómo Levantar la Aplicación

Iniciar el servidor de desarrollo:
```bash
npm start
```

Ejecutar en Android:
```bash
npm run android
```

Ejecutar en iOS:
```bash
npm run ios
```

Ejecutar en Web:
```bash
npm run web
```

### Modo Desarrollo en iPhone (Development Build)

Para instalar y correr la app en un iPhone físico con todas las funcionalidades (notificaciones, background tasks, etc.):

#### Prerrequisitos
- Mac con Xcode instalado
- iPhone con cable USB
- Cuenta de Apple Developer (gratis o de pago)
- iPhone y Mac conectados a la **misma red WiFi**

#### Pasos para Instalación

**1. Preparar el proyecto para iOS**
```bash
# Instalar dependencias de iOS
cd ios
pod install
cd ..

# O usar npx si no tienes CocoaPods global
npx pod-install
```

**2. Configurar Code Signing en Xcode**
```bash
# Abrir el workspace de Xcode
open ios/ritmofitreact.xcworkspace
```

En Xcode:
- Selecciona el proyecto "ritmofitreact" en el panel izquierdo (icono azul)
- Ve a la pestaña **"Signing & Capabilities"**
- ✅ Activa **"Automatically manage signing"**
- Selecciona tu **Team** (tu Apple ID)
- Cambia el **Bundle Identifier** a algo único: `com.tunombre.ritmofitreact`

**3. Remover Push Notifications (para cuentas gratuitas)**

⚠️ **IMPORTANTE**: Las cuentas gratuitas de Apple Developer NO soportan Push Notifications remotas.

En Xcode, en la pestaña **"Signing & Capabilities"**:
- Busca la capability **"Push Notifications"**
- Haz click en el botón **"-"** para eliminarla

> **Nota**: La app usa notificaciones LOCALES (`expo-notifications`) que funcionan sin esta capability.

**4. Conectar tu iPhone**
- Conecta tu iPhone por USB a tu Mac
- Desbloquea el iPhone
- Si aparece "Confiar en esta computadora", toca **"Confiar"**

**5. Buildear e instalar en el iPhone**

Opción A - Desde Xcode (Recomendado):
- En la barra superior de Xcode, selecciona tu iPhone como destino
- Presiona el botón **▶️ Play** para buildear e instalar
- Espera a que termine el build (~5-10 minutos la primera vez)

Opción B - Desde terminal:
```bash
npx expo run:ios --device
```

**6. Confiar en el Developer en iPhone**

Si aparece error de "Untrusted Developer":
- Ve a: **Ajustes > General > VPN y administración de dispositivos**
- Toca tu email/certificado
- Toca **"Confiar en [tu email]"**

**7. Conectar al servidor de desarrollo**

```bash
# Iniciar el servidor de desarrollo
npx expo start --dev-client

# O con limpieza de caché
npx expo start --dev-client --clear
```

En tu iPhone:
- Abre la app "ritmofitreact" instalada
- Te pedirá la URL del servidor de desarrollo
- Ingresa: `exp://[TU-IP-LOCAL]:8081`

Para obtener tu IP local:
```bash
# En macOS
ipconfig getifaddr en0

# O busca en: Preferencias del Sistema → Red
```

Ejemplo: `exp://192.168.100.5:8081`

**8. Hot Reload Automático**

Una vez conectada, la app se recargará automáticamente cuando hagas cambios en el código. No necesitas reinstalar.

**Troubleshooting**

- **Error "Failed to build"**: Verifica que hayas removido Push Notifications capability
- **"No provisioning profile"**: Asegúrate de tener "Automatically manage signing" activado
- **App no conecta**: Verifica que iPhone y Mac estén en la misma WiFi
- **Cambios no se ven**: Sacude el iPhone → "Reload" o cierra y abre la app

## Recomendaciones

### Configuración de Android Studio
Se recomienda altamente usar Android Studio para este proyecto debido a:
- **Emulador Android Integrado:** Proporciona la simulación más precisa de dispositivos Android reales con soporte completo para características de Expo como cámara y almacenamiento seguro.
- **Herramientas de Debugging:** Incluye capacidades de depuración avanzadas, visor de logcat e inspección de red.
- **Soporte de Módulos Nativos:** Esencial para probar características que requieren APIs nativas de Android (escaneo QR, cámara, almacenamiento seguro).
- **Performance:** El emulador oficial de Android ofrece mejor rendimiento y estabilidad comparado con alternativas de terceros.

Para configurar Android Studio:
1. Descarga e instala Android Studio desde el sitio oficial
2. Instala el Android SDK y crea un dispositivo virtual (AVD)
3. Asegúrate de que las herramientas del Android SDK estén disponibles en tu PATH
4. Ejecuta `npm run android` para lanzar la app en el emulador

### Configuración de la API
Para dispositivos físicos, actualiza el `BASE_URL` en `src/utils/constants.js` para usar la dirección IP de tu computadora en lugar de `10.0.2.2`.
