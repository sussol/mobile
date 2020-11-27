package com.msupplymobile;
import com.facebook.react.bridge.WritableArray;
import java.util.Map;
import com.facebook.react.bridge.WritableMap;

interface BleScanListener{
    void BleCallback(MsupplyException exception);
    void BleCallback(Map<String,BleDevice> result);
}

interface BleDeviceListener{
    void BleCallback(boolean result);
    void BleCallback(MsupplyException exception);
}