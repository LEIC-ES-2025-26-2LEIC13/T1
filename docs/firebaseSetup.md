# Firebase Setup

Simple guide for setting up Firebase in this project.

This project uses only two Firebase modules:

- Firebase Authentication (Email/Password)
- Cloud Firestore

## Development Environment

- Node.js LTS
- npm
- Expo (run with npx expo)
- Android Studio emulator or physical device
- Firebase Console account

## Install Firebase

Command used:

```bash
npx expo install firebase
```

## Firebase Console Steps

1. Create a Firebase project.
2. Add Android and iOS apps.
3. Download and place files in the project:
	 - firebase/google-services.json
	 - firebase/GoogleService-Info.plist
4. Enable Authentication with Email/Password.
5. Enable Firestore Database.

## Project Configuration

- Firebase initialization is in firebase/firebaseConfig.js.
- Auth uses AsyncStorage persistence.
- Firestore is initialized and exported from the same file.
- app.json points to native Firebase files for Android and iOS.
- No other Firebase modules are used in this project.

## Run and Verify

```bash
npm install
npm run start
```

Check:

- App opens without Firebase errors.
- Login/register work.
- Firestore read/write works.

## Coding Standards

- Keep Firebase setup in one file only (firebase/firebaseConfig.js).
- Do not initialize Firebase inside screens/components.
- Handle Firebase errors with clear user messages.
- Run lint and tests before merge:

```bash
npm run lint
npm test
```

## References

- Firebase Docs (main): https://firebase.google.com/docs
- Add Firebase to JavaScript app: https://firebase.google.com/docs/web/setup
- Firebase Auth (Web/JS): https://firebase.google.com/docs/auth/web/start
- Cloud Firestore (Web/JS): https://firebase.google.com/docs/firestore/quickstart
- Expo guide for Firebase: https://docs.expo.dev/guides/using-firebase/
