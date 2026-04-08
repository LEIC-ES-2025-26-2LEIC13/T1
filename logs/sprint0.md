* To do unit and integration testing, we used Jest, which was installed in the project with the command:

```bash
`npx expo install @testing-library/react-native --dev`
```
* Installed Jest types with 

```bash
`npm install -D @types/jest`
```

* Fixed some dependency issues with the commands:

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

* And added the above commands to a script in package.json, since it was a recurrent issue:

```json
"scripts": {
    ...
    "fix-conflicts": "rm -rf node_modules package-lock.json && npm install"
    ...
}
```

* for the 
* Added a linter (ESLint)to the project with the command (and following [this](https://docs.expo.dev/guides/using-eslint/) guidelines):

```bash
npx expo lint
```

* ...and the corresponding VSCode extension: ESLint

* Added two GitHub Actions workflows: one for bundling, run the tests of the project and running the linter and another one for building the app and realease the .apk file:
    - `bundle-quality-test.yml`: for pushes in PRs to the main branch and for pushses to the main branch.
    - `android-ios-build-release.yml`: for pushes to tags beginning with "v".