#!/usr/bin/env bash

# mSupply Mobile
# Sustainable Solutions (NZ) Ltd. 2019.
#
# Clean up mSupply mobile app data.

PACKAGE="com.msupplymobile"

echo "Resetting mSupply mobile app data..."
adb shell pm clear $PACKAGE
