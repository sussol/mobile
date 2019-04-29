package com.msupplymobile;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class bleTempoDisc extends ReactContextBaseJavaModule {
    private ReactContext reactContext;
    private bleDeviceScanner deviceScanner;

    @Override
    public String getName() {
        return "bleTempoDisc";
    }

    public bleTempoDisc(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @ReactMethod
    public void getDevices(int manufacturerID, int timeout, String deviceAddress, Promise promise) {
        deviceScanner = new bleDeviceScanner(reactContext, timeout);
        deviceScanner.startScanning(manufacturerID, deviceAddress, promise);
    }

    @ReactMethod
    public void getDeviceName(String deviceAddress, Promise promise) {
        try {
            promise.resolve(deviceScanner.getScannedDevice(deviceAddress).getName());
        } catch (Exception e) {
            promise.resolve("");
        }
    }

    @ReactMethod
    public void getUARTCommandResults(String deviceAddress, String command, Promise promise) {
        (new bleUART(reactContext, deviceScanner, deviceAddress, command, promise)).getCommandResult();
    }

//   private WritableMap decodeAdvertisment(byte advertismentInfo[]) {
//         WritableMap returnMap = Arguments.createMap();
//         returnMap.putInt("versionNumber", toInt(advertismentInfo[7]));
//         returnMap.putInt("batteryPercentage", toInt(advertismentInfo[8]));
//         returnMap.putInt("timeIntervalCounter", toUInt(advertismentInfo,9));
//         returnMap.putInt("numberOfLogRecords", toUInt(advertismentInfo,11));
//         returnMap.putInt("currenTemperature", toInt(advertismentInfo, 13));
//         returnMap.putInt("currentHumidity", toInt(advertismentInfo,15));
//         returnMap.putInt("currentDewPoint", toInt(advertismentInfo,17));
//         returnMap.putInt("breachCount", toInt(advertismentInfo[20]));
//         returnMap.putInt("highestTemperature", toInt(advertismentInfo, 37));
//         returnMap.putInt("highestHumidity", toInt(advertismentInfo, 35));
//         returnMap.putInt("lowestTemperature", toInt(advertismentInfo,41));
//         returnMap.putInt("lowestHumidity", toInt(advertismentInfo,43));
//         returnMap.putInt("highestTemperature24H", toInt(advertismentInfo, 45));
//         returnMap.putInt("highestHumidity24H", toInt(advertismentInfo, 47));
//         returnMap.putInt("lowestTemperature24H", toInt(advertismentInfo,49));
//         returnMap.putInt("lowestHumidity24H", toInt(advertismentInfo,51));
//         returnMap.putInt("averageTemperature24H", toInt(advertismentInfo,53));
//         returnMap.putInt("averageHumidity24H", toInt(advertismentInfo,55));
//         return returnMap;
//   }

}