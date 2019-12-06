#!/usr/bin/env bash

# mSupply Mobile
# Sustainable Solutions (NZ) Ltd. 2019.
#
# Generate debug signing key.

KEYDIR=./android/app
KEYSTORE=$KEYDIR/debug.keystore
STOREPASS=android
ALIAS=androiddebugkey
KEYPASS=android
KEYALG=RSA
KEYSIZE=2048
VALIDITY=10000

keytool -genkey \
 -keystore $KEYSTORE \
 -storepass $STOREPASS \
 -alias $ALIAS \
 -keypass $KEYPASS \
 -keyalg $KEYALG \
 -keysize $KEYSIZE \
 -validity $VALIDITY 