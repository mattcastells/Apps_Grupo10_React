# RitmoFit Mobile App - Grupo 10

Mobile application for RitmoFit gym management system. This React Native app handles user interactions, class bookings, attendance tracking, and profile management for the TPO of Desarrollo de Aplicaciones I.

## Technologies Used
- React Native 0.81
- Expo SDK 54
- React Navigation 7
- Axios (HTTP client)
- Expo Camera (QR scanning)
- Expo Secure Store (authentication)

## Backend Requirements
This project depends on a backend API to function. The backend repository and setup instructions can be found at:

**Backend Repository:** [Project](https://github.com/mattcastells/Apps_Grupo10_Backend)

Make sure the backend is running before starting the mobile app. The default API URL is configured for Android emulator at `http://10.0.2.2:8080/api/v1`.

## Environment Setup

### Prerequisites
- Node.js 18+ and npm installed
- Expo CLI installed globally: `npm install -g expo-cli`
- Android Studio (recommended) or Xcode for iOS

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd Apps_Grupo10_React
```

2. Install dependencies:
```bash
npm install
```

3. Configure API endpoint (if needed):
Edit `src/utils/constants.js` and update the `API_CONFIG.BASE_URL` with your backend URL.

### Running the Application

Start the development server:
```bash
npm start
```

Run on Android:
```bash
npm run android
```

Run on iOS:
```bash
npm run ios
```

Run on Web:
```bash
npm run web
```

## Recommendations

### Android Studio Setup
It is highly recommended to use Android Studio for this project because:
- **Integrated Android Emulator:** Provides the most accurate simulation of real Android devices with full support for Expo features like camera and secure storage.
- **Debugging Tools:** Includes powerful debugging capabilities, logcat viewer, and network inspection.
- **Native Module Support:** Essential for testing features that require native Android APIs (QR scanning, camera, secure storage).
- **Performance:** The official Android emulator offers better performance and stability compared to third-party alternatives.

To set up Android Studio:
1. Download and install Android Studio from the official website
2. Install Android SDK and create a virtual device (AVD)
3. Ensure Android SDK tools are available in your PATH
4. Run `npm run android` to launch the app in the emulator

### API Configuration
For physical devices, update the `BASE_URL` in `src/utils/constants.js` to use your computer's IP address instead of `10.0.2.2`.
