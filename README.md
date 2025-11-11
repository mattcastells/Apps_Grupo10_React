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
