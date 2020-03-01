#!/usr/bin/env bash

# mSupply Mobile
# Sustainable Solutions (NZ) Ltd. 2019.
#
# Upload source maps to bugsnag server.

BUGSNAG_URL=https://upload.bugsnag.com/react-native-source-map
BUGSNAG_KEY=16a680e189b1e5f03f28665870f1401f
APP_VERSION=4.0.0-rc15

PLATFORM=android
DEV=false
ENTRY_FILE=index.js
PROJECT_ROOT=$(pwd)
BUNDLE_OUTPUT=android-release.bundle
SOURCEMAP_OUTPUT=android-release.bundle.map

echo "Building source map..."
react-native bundle \
--platform $PLATFORM \
--dev $DEV \
--entry-file $ENTRY_FILE \
--bundle-output $BUNDLE_OUTPUT \
--sourcemap-output $SOURCEMAP_OUTPUT
echo "Uploading source map..."
curl $BUGSNAG_URL \
-F apiKey=$BUGSNAG_KEY \
-F appVersion=$APP_VERSION \
-F dev=$DEV \
-F platform=$PLATFORM \
-F sourceMap=@$SOURCEMAP_OUTPUT \
-F bundle=@$BUNDLE_OUTPUT \
-F projectRoot=$PROJECT_ROOT
