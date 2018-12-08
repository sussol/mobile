#!/usr/bin/env bash

# mSupply Mobile
# Sustainable Solutions (NZ) Ltd. 2018.
#
# Automate mSupply site login.

KEYEVENT_ENTER=66

SERVER_URL_INPUT_X=750
SERVER_URL_INPUT_Y=630

M_SUPPLY_IP_DEFAULT=$(ipconfig getifaddr en0)
M_SUPPLY_PORT_DEFAULT=2048

SITE_NAME_DEFAULT=demo
SITE_PASS_DEFAULT=pass

M_SUPPLY_IP=${1:-$M_SUPPLY_IP_DEFAULT}
M_SUPPLY_PORT=${2:-$M_SUPPLY_PORT_DEFAULT}
SITE_NAME=${3:-$SITE_NAME_DEFAULT}
SITE_PASS=${4:-$SITE_PASS_DEFAULT}

M_SUPPLY_URL=http://$M_SUPPLY_IP:$M_SUPPLY_PORT

adb shell input tap $SERVER_URL_INPUT_X $SERVER_URL_INPUT_Y
adb shell input text $M_SUPPLY_URL
adb shell input keyevent $KEYEVENT_ENTER
adb shell input text $SITE_NAME
adb shell input keyevent $KEYEVENT_ENTER
adb shell input text $SITE_PASS
adb shell input keyevent $KEYEVENT_ENTER
