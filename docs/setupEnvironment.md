# Setup Environment Documentation

## Firebase Setup

Simple guide for setting up Firebase in this project.

This project uses only two Firebase modules:

- Firebase Authentication (Email/Password)
- Cloud Firestore

### Development Environment

- Node.js LTS
- npm
- Expo (run with npx expo)
- Android Studio emulator or physical device
- Firebase Console account

### Install Firebase

Command used:

```bash
npx expo install firebase
```

### Firebase Console Steps

1. Create a Firebase project.
2. Add Android and iOS apps.
3. Download and place files in the project:
   - firebase/google-services.json
   - firebase/GoogleService-Info.plist
4. Enable Authentication with Email/Password.
5. Enable Firestore Database.

### Project Configuration

- Firebase initialization is in firebase/firebaseConfig.js.
- Auth uses AsyncStorage persistence.
- Firestore is initialized and exported from the same file.
- app.json points to native Firebase files for Android and iOS.
- No other Firebase modules are used in this project.

### Run and Verify

```bash
npm install
npm run start
```

Check:

- App opens without Firebase errors.
- Login/register work.
- Firestore read/write works.

### Coding Standards

- Keep Firebase setup in one file only (firebase/firebaseConfig.js).
- Do not initialize Firebase inside screens/components.
- Handle Firebase errors with clear user messages.
- Run lint and tests before merge:

```bash
npm run lint
npm test
```

### References

- Firebase Docs (main): https://firebase.google.com/docs
- Add Firebase to JavaScript app: https://firebase.google.com/docs/web/setup
- Firebase Auth (Web/JS): https://firebase.google.com/docs/auth/web/start
- Cloud Firestore (Web/JS): https://firebase.google.com/docs/firestore/quickstart
- Expo guide for Firebase: https://docs.expo.dev/guides/using-firebase/

## Running development server

- To run the development server for Android, use the following command:

```bash
npx expo run:android
```

- Then, it is possible to run the app in an Android emulator or physical device, via USB or Wi-Fi debugging.

## Running acceptance tests
- Used a development build in Android to run the acceptance tests. To create a development build, use the following command:

```bash
npx expo run:android
```
- Acceptance tests for this project were written using the Maestro testing framework.
- To install Maestro, follow the instructions in the official QuickStart guide [here](https://docs.maestro.dev/get-started/quickstart).
- To run the acceptance tests:
  1. Launch the MaestroStudio application (also followint the instructions in the QuickStart guide)
  2. Open the `__tests__/acceptance_tests/` directory.
  3. Select device as emulator or physical device.
  4. Run the desired test file, select it and clicking the "Run test" button in MaestroStudio.


## Google Sign In
- To sign in into the app using Google, simply have a Google account in the phone and click the "Sign in" button with the google logo.
- This will open a Google Sign In prompt, where you can select the account you want to use to sign in into the app. After selecting the account, you will be signed in and redirected to the home screen of the app.
- If you don't have a previous account associated with the app, the account is automatically created for you and you are signed in. If you already have an account associated with the app, you are simply signed in and redirected to the home screen of the app. 