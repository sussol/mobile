# mSupply Mobile

Sustainable Solutions' Mobile app for use with the mSupply medical inventory control software. See http://msupply.org.nz

### Get the Latest Release
* Available at Jottacloud/mSupply Mobile Builds/mSupplyMobile.apk.zip
* Copy the .zip somewhere on your own computer before extracting it
* Copy the .apk onto an android tablet
* Open the .apk on the tablet and follow the install instructions (need to allow apps from unknown sources)

### Working on mSupply Mobile
#### Setting up React Native Tools and Environment
We to get the tools needed for creating and running a react native project. 

1. install homebrew
2. `brew install node`
3. `npm install -g react-native-cli`
4. install android studio
5. set up paths
6. set up .bashrc file
7. put this 
```if [ -n "$BASH_VERSION" ]; then
    # include .bashrc if it exists
    if [ -f "$HOME/.bashrc" ]; then
        . "$HOME/.bashrc"
    fi
fi``` 
in .bash_profile
8. Set up ndk
9. set up android 23 api


The essential things you need to have installed and done are:
* node/npm
* react-native-cli
* Android studio
* Set up paths

#### Genymotion
* You will need a genymotion account to use the software, so make an account on their [website](https://www.genymotion.com/account/create/) if you have not got one. Use a personal email address.
* Install genymotion using [these instructions](https://docs.genymotion.com/Content/01_Get_Started/Installation.htm). You will need to install virtual box.
* We'll now need to set up a device to emulate. Open Genymotion and login. There should be a modal asking if you'd like to add your first device, click this or click "Add" near the top. Search the list of available devices to find "Custom Tablet - 4.4.4 - API 19 - 2560x1600". This will take some time to install, but once it's done Genymotion is ready to go.
* Click Settings and go to the ADB tab. Check te 
#### Git
* Install GitHub Desktop and signin with your GitHub account. 
* Clone the mobile repository by clicking the plus icon at the top left and selecting clone. This should show a list of all repositories you can see on GitHub. Find "sussol/mobile" and click the "Clone Repository" button. If you cannot see it, make sure you have been added as developer in the sussol repository on GitHub.
* At this stage, you can right click on the repository in GitHub desktop and click "open in terminal". Run the command `npm install`. This will install all the packages defined in the `packages.json` file in the mobile project. Packages include open source components such as react and react-native as well as development packages, such as linter rules (which helps enforce all of us developers have consistent rules when using Atom/Nuclide which we'll have in the next step of setup!).

#### Atom + Nuclide
To use Nuclide, you will have to be on a Mac or Linux system. Unfortunately not currently supported on Windows.
* Install [atom](https://atom.io/). This is editor will be the base that Nuclide is installed on. Atom is an open source project managed by GitHub themselves.
* Install [Nuclide](https://nuclide.io/docs/editor/setup/). This is a development environment created by facebook specifically geared toward React Native. **Do this through the atom package manager**, as the next step we'll want to be in there.
* Open Atom.
* Choose Atom | Preferences to bring up the Settings tab.
* In the Settings tab, and select Install from the list at the left.
* In the search box, type “Nuclide” and press the Enter key.
* Click the Install button for the nuclide package
* Install additional packages
 * Still in the settings tab in Atom, click on "Packages"
 * Click the "Settings" button for Nuclide
 * Find the checkbox for "Install recommended packages on startup"
 * Restart atom. On start up atom should install several packages to supplement Nuclide.
 * In atom navigate back to settings (cmd+,), install tab. Search for and install:
  - linter
  - linter-eslint
  - react (This may conflict with language-babel. Ignore the warning or disable/enable according to preference)
  - atom-react-native-autocomplete
  - badass-react-snippets
  - Unnecessary packages that can be great: pigments, color-picker

On the left in Atom you should see a file tree section and the button "Add Project Folder". Click this and find add the folder where you cloned the sussol/mobile repository earlier. Now you should be able to easily look through the mobile code with all the bells and whistles!

#### Running Debug in Emulator
* Open genymotion and start the deviced added earlier: "Custom Tablet - 4.4.4 - API 19 - 2560x1600"
* With terminal open in the project root folder, run the command `react-native run-android`
* Provided everything went okay in set up, it should run!

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
