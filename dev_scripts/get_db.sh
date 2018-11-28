#!/usr/bin/env bash

# mSupply Mobile
# Sustainable Solutions (NZ) Ltd. 2018.
#
# Copy mSupply local Realm database from emulator or connected device onto local machine.

PACKAGE="com.msupplymobile"
DB_NAME="default.realm"

DIR_EMULATOR="/data/data/$PACKAGE/files"
DIR_LOCAL="data"

if [ ! -d "$DIR_LOCAL" ]; then
    mkdir "$DIR_LOCAL"
fi

adb pull $DIR_EMULATOR/$DB_NAME $DIR_LOCAL
