package com.msupplymobile;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReactContext;

import android.annotation.TargetApi;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanResult;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import java.util.Map;
import java.util.Hashtable;
import java.util.TimerTask;
import java.util.Timer;

@TargetApi(Build.VERSION_CODES.LOLLIPOP)
public class bleDeviceScanner {

    public static final String TAG = "bleDeviceScanner";
    private static final int MANUFACTURER_LOCATION = 5;
    private static final int REQUEST_ENABLE_BT = 2;
    private Promise promise;
    private int timeout;
    private int manufacturerID;
    private boolean isScanEnabled;
    private WritableMap scanResultAdvertismentInfoMap;
    private Map scanResultDeviceMap;
    private ReactContext reactContext;
    private BluetoothLeScanner leScanner;
    private String deviceAddress;

    public bleDeviceScanner(ReactContext reactContext, int timeout) {
        this.timeout = timeout;
        this.reactContext = reactContext;
        leScanner = null;
        isScanEnabled = false;
        deviceAddress = "";
        reactContext.addActivityEventListener(activityEventListener);
    }

    public BluetoothDevice getScannedDevice(String deviceAddress) throws Exception{
        return (BluetoothDevice) scanResultDeviceMap.get(deviceAddress);
    }

    public void startScanning(int manufacturerID, String deviceAddress, Promise promiseParam) {
        this.deviceAddress = deviceAddress;
        this.manufacturerID = manufacturerID;
        this.promise = promiseParam;
        scanResultAdvertismentInfoMap = Arguments.createMap();
        scanResultDeviceMap = new Hashtable();

        restartScan();
    }

    private void restartScan() {

        BluetoothAdapter btAdapter = null;
        try {
            btAdapter = ((BluetoothManager) reactContext.getSystemService(Context.BLUETOOTH_SERVICE))
                    .getAdapter();
        } catch (Exception e) {
            reject("error", "Issues while getting bluetooth adapter", e.toString());
            return;
        }
        if (btAdapter == null || !btAdapter.isEnabled()) {
            try {
                Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
                reactContext.getCurrentActivity()
                        .startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);
                return;
            } catch (Exception e) {
                reject("error", "Issues while initiating bluetooth enable intent", e.toString());
                return;
            }
        }

        try {
            leScanner = btAdapter.getBluetoothLeScanner();
            isScanEnabled = true;

            leScanner.stopScan(mScanCallback);
            leScanner.startScan(mScanCallback);
        } catch (Exception e) {
            reject("error", "Issues while initiating ble scan", e.toString());
        }
        TimerTask scanTimeout = new TimerTask() {
            @Override
            public void run() {
                Log.e(TAG, "resolving promise in Timer");
                resolve(scanResultAdvertismentInfoMap);
            }
        };

        (new Timer()).schedule(scanTimeout, timeout);
    }

    private void resolve(WritableMap resolve) {
        Log.e(TAG, "resolving promise");
        if(leScanner != null) {
            leScanner.stopScan(mScanCallback);
            leScanner = null;
        }
        isScanEnabled = false;
        if (promise == null) return;
        promise.resolve(resolve);
        promise = null;
    }

    private void reject(String error, String message) {
        reject(error, message, "");
    }

    private void reject(String error, String message, String e) {
        Log.e(TAG, "rejection promise " + error + " " + message + " " + e);
        if(leScanner != null) {
            leScanner.stopScan(mScanCallback);
            leScanner = null;
        }
        isScanEnabled = false;
        if (promise == null) return;
        promise.reject(error, ("{'details': '" + message + "', 'e':'" + e + "'}").replaceAll("'", "\""));
        promise = null;
    }

    private ScanCallback mScanCallback = new ScanCallback() {
        @Override
        public void onScanResult(int callbackType, ScanResult scanResult) {
            Log.e(TAG, "discovered device");
            if (!isScanEnabled) return;
            try {
                byte advertismentInfo[] = scanResult.getScanRecord().getBytes();

                if (bleUtil.toInt(advertismentInfo[MANUFACTURER_LOCATION]) != manufacturerID)
                    return;
                Log.e(TAG, "found device: " + scanResult.getDevice().getAddress() + " match to: " + deviceAddress);
                if (!deviceAddress.equals("") && !scanResult.getDevice().getAddress().equals(deviceAddress))
                    return;
                Log.e(TAG, "device matched");
                addDeviceToResults(advertismentInfo, scanResult);
                if (!deviceAddress.equals("")) {
                    Log.e(TAG, "resolving promise in Scan");
                    resolve(scanResultAdvertismentInfoMap);
                    return;
                }

            } catch (Exception e) {
                reject("error", "Something went wrong while reading device advertisement", e.toString());
            }
        }
    };

    private final ActivityEventListener activityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent) {
            if (requestCode == REQUEST_ENABLE_BT) {
                reactContext.removeActivityEventListener(this);
                Log.e(TAG, "result code = " + resultCode + " " + (intent != null));
                if (resultCode == -1) {
                    restartScan();
                } else {
                    reject("info", "Bluetooth is disabled");
                }
            }
        }
    };

    private void addDeviceToResults(byte advertismentInfo[], ScanResult scanResult) throws Exception {
        WritableMap advertismentInfoObject = Arguments.createMap();
        BluetoothDevice bluetoothDevice = scanResult.getDevice();
        String deviceAddress = bluetoothDevice.getAddress();

        if (scanResultDeviceMap.get(deviceAddress) != null) return;
        scanResultDeviceMap.put(deviceAddress, bluetoothDevice);

        advertismentInfoObject.putString("name", bluetoothDevice.getName());
        advertismentInfoObject.putInt("signalStrength", scanResult.getRssi());
        advertismentInfoObject.putArray("advertismentData", bleUtil.toWritableIntArray(advertismentInfo));

        scanResultAdvertismentInfoMap.putMap(bluetoothDevice.getAddress(), advertismentInfoObject);
    }
}