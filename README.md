# mSupply Mobile

Cross-platform, offline-first mobile application designed and developed by [Sustainable Solutions](http://sussol.net). Integrates with [mSupply](https://www.msupply.org.nz/) to provide accessible and user-friendly electronic inventory control for medical stock. Open-source and free-to-use, mSupply Mobile is designed and built with a specific focus on the needs of developing countries.

## Features

- Track stock movements and view stock on hand.
- Receive and issue goods with automatic inventory adjustments.
- Order stock from suppliers.
- Forecast required stock based on usage.
- Sync data with a local or remote mSupply server when internet is available.

See [http://msupply.org.nz/mobile](http://msupply.org.nz/mobile) for more details of these and many other features.

## Getting started

### Prerequisites

#### Android SDK

- Install Android Studio and SDK tools: https://developer.android.com/studio.
- Install SDKMAN for managing Java versions: https://sdkman.io/.

#### React Native

- Install nvm for managing Node versions: https://github.com/nvm-sh/nvm.
- Install yarn for managing Node packages: https://yarnpkg.com/lang/en/.
- Install React Native: https://facebook.github.io/react-native/docs/getting-started. Follow the steps listed under "Building Projects with Native Code" and set Target OS as "Android".

### Installing

- Clone the repo: `git clone https://github.com/openmsupply/mobile.git`.
- Setup local node environment as specified in `.nvmrc`: `nvm install && nvm use`.
- Install/update app dependencies: `yarn install`.

### Running mSupply mobile

1. Connect a physical device or start an Android emulator. Check the device is running with `adb devices` (if the `adb` daemon is not running, start it with `adb start-server`).
2. Run `react-native run-android` (`react-native run-android && react-native log-android` for logging)
3. Done! For instructions on connecting to mSupply, see the instructions on the [setup page](https://github.com/sussol/mobile/wiki/Setup#setting-up-msupply-server).

### Building from source

- To build mSupply Mobile from source, you will need a signing key from a Sussol insider.
- Copy or move the release key to the `./android/app` directory, e.g. `mv my-release-key.keystore ./android/app`.
- Build the mSupply Mobile APK: `yarn install && ./android/gradlew assembleRelease`.
- The mSupply Mobile APK file can be found at `android/app/build/outputs/apk/app-release.apk`.
- For more information, see the official React Native documentation for generating signed APKs.

## Contributors

We welcome contributions from external developers!

### Prequisites

Before getting started, see the development environment instructions on the [setup page](https://github.com/openmsupply/mobile/wiki/Setup).

### How to contribute

1. Find a bug or feature you'd like to work on from the [issues page](https://github.com/sussol/mobile/issues), or submit your own. If suggesting a feature, make sure to provide a general use case (functionality useful to only one or a few users is unlikely to be approved).
2. Comment on the issue to indicate you are interested in working on it.
3. Be patient :). A Sussoler will respond with any additional information or questions, and assign you when the issue is ready to be worked on.
4. Fork the repository.
5. Code!
6. Make a pull request to the appropriate branch.
7. A Sussoler will review your PR and provide comments or request changes.
8. Sit back and enjoy the warm glow :-).

### Useful stuff

mSupply Mobile uses [Realm](https://realm.io/) for local storage of mSupply data. Realm Browser is a useful debugging tool for viewing and editing Realm databases.

- Download Realm Browser [here](https://realm.io/products/realm-studio/#download-studio).
- Run `chmod +x ./dev_scripts/get_db.sh && ./dev_scripts/get_db.sh`. A copy of the default.realm database should now be placed in the ./data directory.
- Open `default.realm` in Realm Browser.

### Tips and advice

- Before making any changes to the code, make sure to familiarise yourself with our [coding conventions and design standards](https://github.com/sussol/mobile/wiki/Code-Design).
- Before opening your pull request, go through the following checklist:
  - do all you changes adhered to the Sussol code conventions?
  - have you tested all changes you have made for bugs and regressions?
  - are your changes consistent with the mSupply Mobile mission statement (basic functionality with a focus on user-friendly and consistent design)?
