# mSupply Mobile

Sustainable Solutions' Mobile app for use with the mSupply medical inventory control software. See http://msupply.org.nz

### Get the Latest Release
* Available at Jottacloud/mSupply Mobile Builds/mSupplyMobile.apk.zip
* Copy the .zip somewhere on your own computer before extracting it
* Copy the .apk onto an android tablet
* Open the .apk on the tablet and follow the install instructions (need to allow apps from unknown sources)

### Working on mSupply Mobile
These instructions are only for Mac OSX.
#### Setting up React Native Tools and Environment
We to get the tools needed for creating and running a react native project. 

1. Install homebrew. Simply open Terminal, copy and paste the following press enter:
`/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`. Homebrew is a MacOS development tool manager.
2. Install Node using homebrew: `brew install node`. Node provides a javascript runtime, and importantly brings with it npm, Node Package Manager. We use npm to manage all the packages that we use the mSupply Mobile project.
3. Install the React Native Command Line Interface: `npm install -g react-native-cli`. This gives us some tools for managing React Native projects via Terminal, such as starting the app. 
4. Install Android Studio. We actually are only using this to manage some Android SDKs (Software Development Kit). Android Studio is a popular integrated development environment (IDE) for coding Native Android apps in Java. 
    * [Download it here](https://developer.android.com/studio/index.html) and follow [these instructions](https://developer.android.com/studio/install.html) to install. 
    * Once installed start Android Studio and choose the standard setup option. Click next, next and finish. There should download between 700MB and 800MB. Do not change the SDK directory, or you will have to adjust the path in later steps appropriately.
5. Your PATH variable needs to updated so that Terminal can find the tools that we are installing.
    * Open Terminal and enter `cd`. This will change the directory to your home directory, also referred to as `~` (tilda). 
    * Enter `ls -a`. This will list all files in the directory, including hidden ones prefixed with a `.`. There should be a file .bash_profile. If there isn't don't worry. Type `touch .bash_profile` to create it.
    * Enter `open .bash_profile`. This should open the file in a text editor. (Alternatively you could have found this file through Finder and double clicked it.)
    * Paste the following bash commands into this file
    ```
    export ANDROID_HOME=~/Library/Android/sdk
    export ANDROID_NDK=~Library/Android/ndk/android-ndk-r10e
export PATH=${PATH}:${ANDROID_HOME}/tools
export PATH=${PATH}:${ANDROID_HOME}/platform-tools
```
Now every time Terminal is opened, these directories will be added to the PATH variable. Close and reopen the Terminal so that it has the updated PATH.
8. Next we have to set up the Android NDK. You may have noticed we added to PATH the directory where we will be putting it in the previous step.
    * First download the NDK here: [android-ndk-r10e-darwin-x86_64.zip](http://dl.google.com/android/repository/android-ndk-r10e-darwin-x86_64.zip). It is important that the version is r10e, newer versions will break the compiling process later.
    * Open Finder and Navigate to your home directory `/user/[your user name]/`. Open the folder "Library". If you cannot see it, you need to run in Terminal `defaults write com.apple.Finder AppleShowAllFiles TRUE` then `option + right-click` Finder in the dock at the bottom of the screen and click "Relaunch". Get back to the home directory an find the folder "Library"
    * Open "Library", open the folder "Android", and make a new folder here called "ndk".
    * Copy the file "android-ndk-r10e-darwin-x86_64.zip" that you downloaded from the first step into this folder you created.
    * Double click "android-ndk-r10e-darwin-x86_64.zip" to extract it. There should now be a folder called android-ndk-r10e and we are done setting up the ndk.
9. We need to get the android SDK through Android Studio. 
    * Open Android Studio. If it wants setup, follow the later part of android 4 that covers that.
    * Click the "Configure" menu down the bottom right, and click "SDK Manager"
    * Check the box for "Android 6.0 (Marshmallow)". If you like, deselect the other options (7.1.1 likely checked by default)
    * Click Next and accept the liscenses and click next
    * Click Finish when it is done and close Android Studio
10. We need to make sure you have Android SDK Build-tools 23.0.1
   * Open Terminal and enter `android`. A window called "Android SDK Manager" should be opened.
   * In the "Tools" folder in this window, check the box on the row for "Android Build-tools 23.0.1
   * Click "Install [number] Packages", select each liscense and check "Accept License" on the right of the window.
   * Click "Install". Likely several 100MB download. Once this is done, your React Native environment for Android should be good to go.

#### Genymotion
* You will need a genymotion account to use the software, so make an account on their [website](https://www.genymotion.com/account/create/) if you have not got one. Use a personal email address.
* Install genymotion using [these instructions](https://docs.genymotion.com/Content/01_Get_Started/Installation.htm). You will need to install virtual box.
* We'll now need to set up a device to emulate. Open Genymotion and login. There should be a modal asking if you'd like to add your first device, click this or click "Add" near the top. Search the list of available devices to find "Custom Tablet - 4.4.4 - API 19 - 2560x1600". This will take some time to install, but once it's done Genymotion is ready to go.
* Click Settings and go to the ADB tab. Check te 
#### Git
* Install GitHub Desktop and signin with your GitHub account. 
* Clone the mobile repository by clicking the plus icon at the top left and selecting clone. This should show a list of all repositories you can see on GitHub. Find "sussol/mobile" and click the "Clone Repository" button. If you cannot see it, make sure you have been added as developer in the sussol repository on GitHub.
* At this stage, you can right click on the repository in GitHub desktop and click "Open in Terminal". Run the command `npm install`. This will install all the packages defined in the `packages.json` file in the mobile project. Packages include open source components such as react and react-native as well as development packages, such as linter rules (which helps enforce all of us developers have consistent style rules when using Atom/Nuclide, which we'll have in the next step of setup!).

#### Atom + Nuclide
To use Nuclide, you will have to be on a Mac or Linux system. Unfortunately not currently supported on Windows.
* Install [Atom](https://atom.io/). This is editor will be the base that Nuclide is installed on. Atom is an open source project managed by GitHub themselves.
* Install [Nuclide](https://nuclide.io/). This is a development environment created by facebook specifically geared toward React and React Native. **Do this through the atom package manager as follows**, as the next step we'll want to be in there as well.
* Open Atom.
* Choose Atom | Preferences (cmd+,) to bring up the Settings tab.
* In the Settings tab select "Install" from the list on the left.
* In the search box, type “Nuclide” and press the Enter key.
* Click the install button for the Nuclide package
* Install additional packages
 * Still in the settings tab in Atom, click on "Packages"
 * Click the "Settings" button for Nuclide
 * Find the checkbox for "Install recommended packages on startup"
 * Restart atom. On start up atom should install several packages to supplement Nuclide.
 * In atom navigate back to settings (cmd+,), install tab. Search for and install:
  - linter
  - linter-eslint
  - react (This may conflict with language-babel. Ignore the warning or disable/enable according to your preference)
  - atom-react-native-autocomplete
  - badass-react-snippets
  - Unnecessary packages that can be great: pigments, color-picker

On the left in Atom you should see a file tree section and the button "Add Project Folder". Click this and find add the folder where you cloned the sussol/mobile repository earlier. Now you should be able to easily look through the mobile code with all the bells and whistles!

#### Running Debug in Emulator
* Open genymotion and start the deviced added earlier: "Custom Tablet - 4.4.4 - API 19 - 2560x1600"
* With terminal open in the project root folder (In GitHub Desktop, right click the project and choose "Open in Terminal"), run the command `react-native run-android`

This will open a new Terminal window running the React Packager, running on a node server. The packager crawls through the files in our repository and will find all the Javascript files we write and transpile them from ES6 syntax into another that is supported by React Native.

Your original Terminal window will show many dependancies being checked. The first time you run this on a fresh copy of the repository (such as when setting all the above up for the first time), this process will take a long time. 20 minutes is a plausible amount of time. This will include some downloading and due to us actually running a customer fork of the React Native repository, we need to compile a lot of files on the first run.

Once all that is done, it'll use the Android Debug Bridge to connect to the Genymotion emulated device. You can check what devices are connected by typing `adb devices` in Terminal.

### Building from Source
* Assumes you have [npm](https://nodejs.org/en/download/) and the [react-native](https://facebook.github.io/react-native/docs/getting-started.html#dependencies-for-mac-ios) dev tools installed
* Clone the repo
* ```$ npm install```
* Get the signing key from a Sussol insider
* Place the my-release-key.keystore file under the android/app directory
* ```$ cd android && ./gradlew assembleRelease```
* The APK is now at android/app/build/outputs/apk/app-release.apk
* More here: https://facebook.github.io/react-native/docs/signed-apk-android.html

### Running in Debug On Physical Tablet
* Assumes you have [npm](https://nodejs.org/en/download/) and the [react-native](https://facebook.github.io/react-native/docs/getting-started.html#dependencies-for-mac-ios) dev tools installed
* Clone the repo
* ```$ npm install```
* Connect an Android tablet, with developer settings configured to allow remote debugging
* ```$ react-native run-android```
* If Android is >= 5.0, can debug via USB, generally have to run ```$ adb reverse tcp:8081 tcp:8081```
* If Android < 5.0, need to debug via wifi, by setting your computer's ip in the dev menu's 'Debug server for device'
* More here: https://facebook.github.io/react-native/docs/debugging.html

### Setting up mSupply Server
* Use mSupply v3.6 or higher
* If you want to start with the example data file:
  * Use the data file in Jottacloud/mSupply Mobile Builds/datafile_for_mobile.zip
  * This has been configured as per the instructions below
  * The mobile sync site name, mobile sync site password, mobile store user's name, and mobile store user's password are all 'Mobile'
* Otherwise configure your data file like so:
  * Each mobile store needs its own sync site
  * On the primary server
    * Each mobile store should be set as a Collector store on the primary sync site (id 1)
    * Each mobile store should be set as an Active/Collector store, with local checked, on its own sattelite sync site
  * The name associated with each mobile store should have the central store selected as its Supplying Store
  * Users who should be able to log in to the mobile store need to have that store set as their default
  * The name associated with the central store needs to have each mobile store set as visible
  * Each mobile store needs to have the central store set as visible
  * Appropriate item visibilities need to be set for the store
  * The store's customers need to be added centrally
  * Master lists need to be set up for each store and its customers
  * The central supplying store needs to have its preference for supplier invoices made from stock transfers to be set to 'On Hold'
  
### Connecting the App to the Server
* The first time you use the app, you'll see a screen with three fields
* Enter the ip of the computer running the mSupply server in the first one, in the following format: ```http://server_ip:server_port```, or a URL if the server has one set up
* Enter the sync site's name in the second
* Enter the sync site's password in the third
* Pressing connect will begin the one-time-only initialisation process, retrieving all relevant data from the mSupply server
* When this has completed (could take several minutes), you will see the normal user login screen, which you will see immediately from now on
