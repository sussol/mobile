#!/usr/bin/env bash

# mSupply Mobile
# Sustainable Solutions (NZ) Ltd. 2019.
#
# Deploy mobile app.

APK_DIR="android/app/build/outputs/apk/release"
APK_VERSION="mSupplyMobile-3_0_2-universal-release"
PACKAGE="com.msupplymobile"

echo "Rooting device..."
adb root > /dev/null
echo "Uninstalling mSupply mobile..."
adb uninstall $PACKAGE > /dev/null
echo "Installing latest .apk build..."
adb install $APK_DIR/$APK_VERSION.apk > /dev/null
