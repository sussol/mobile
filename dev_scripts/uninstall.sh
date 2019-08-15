#!/usr/bin/env bash

# mSupply Mobile
# Sustainable Solutions (NZ) Ltd. 2019.
#
# Uninstall mobile app.

PACKAGE="com.msupplymobile"

adb root > /dev/null
adb uninstall $PACKAGE
