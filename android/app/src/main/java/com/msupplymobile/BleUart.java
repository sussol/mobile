package com.msupplymobile;

import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothProfile;
import android.bluetooth.BluetoothDevice;

import android.os.Build;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;

import java.util.TimerTask;
import java.util.Timer;
import java.util.UUID;

public class BleUart {

    public static final String TAG = "BleUart";

    private static final UUID GATT_SERVICE = UUID.fromString("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
    private static final UUID OUT_CHARASTERISTIC = UUID.fromString("6e400002-b5a3-f393-e0a9-e50e24dcca9e");
    private static final UUID IN_CHARASTERISTIC = UUID.fromString("6e400003-b5a3-f393-e0a9-e50e24dcca9e");
    private static final UUID IN_DESCRIPTOR = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");

    private String command;
    private String deviceAddress;
    private Promise promise;
    private WritableMap resultMap;
    private WritableArray resultLinesArrayRaw;
    private WritableArray resultLinesArrayString;
    private ReactContext reactContext;
    private BleDeviceScanner deviceScanner;
    private BluetoothDevice bluetoothDevice;
    private int reconnectionCount;
    private int connectionDelay;
    private int numberOConnectionRetries;
    private boolean successfullConnection;

    public BleUart(ReactContext reactContext, BleDeviceScanner deviceScanner, String deviceAddress, String command, int connectionDelay, int numberOConnectionRetries, Promise promise) {
        this.reactContext = reactContext;
        this.deviceAddress = deviceAddress;
        this.deviceScanner = deviceScanner;
        this.command = command;
        this.promise = promise;
        this.connectionDelay = connectionDelay;
        this.numberOConnectionRetries = numberOConnectionRetries;
        successfullConnection=false;
        reconnectionCount = 0;
        resultMap = Arguments.createMap();
        resultLinesArrayRaw = Arguments.createArray();
        resultLinesArrayString = Arguments.createArray();

    }

    public void getCommandResult() {
        bluetoothDevice = null;
        Log.i(TAG, "starting log of BleUart");
        try {
            bluetoothDevice = deviceScanner.getScannedDevice(deviceAddress);
            if (bluetoothDevice == null) throw new Error();
        } catch (Exception e) {
            resultMap.putBoolean("failed", true);
            resultMap.putString("failureReason", "device not scanned");
            resolve(resultMap);
            return;
        }
        connectGattWithTimeout();
    }

    private void connectGattWithTimeout() {
        TimerTask scanTimeout = new TimerTask() {
            @Override
            public void run() {
                connectGatt();
            }
        };

        (new Timer()).schedule(scanTimeout, connectionDelay);
    }

    private void connectGatt() {
        try {
            Log.i(TAG, "end of delay");
            bluetoothDevice.connectGatt(reactContext, false, getCommandResultCallback, BluetoothDevice.TRANSPORT_LE);
        } catch (Exception e) {
            reject("error", "Cannot connect GATT", e.toString());
        }
    }

    private void resolve(WritableMap resolve) {
        if (promise == null) return;
        promise.resolve(resolve);
        promise = null;
    }

    private void reject(String error, String message) {
        reject(error, message, "");
    }

    private void reject(String error, String message, String e) {
        if (promise == null) return;
        promise.reject(error, ("{'details': '" + message + "', 'e':'" + e + "'}").replaceAll("'", "\""));
        promise = null;
    }

    private BluetoothGattCallback getCommandResultCallback = new BluetoothGattCallback() {
        @Override
        public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
            Log.i(TAG, "connection status " + status + " " + newState);
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                gatt.discoverServices();
                successfullConnection =true;
            } else if (!successfullConnection && reconnectionCount<numberOConnectionRetries) {
                Log.i(TAG, "trying to reconnect");
                reconnectionCount++;
                gatt.close();
                connectGattWithTimeout();
            } else {
                gatt.close();
                resultMap.putBoolean("success",successfullConnection);  
                resultMap.putArray("rawResultLines", resultLinesArrayRaw);
                resultMap.putArray("stringResultLines", resultLinesArrayString);
                resolve(resultMap);
            }
        }

        @Override
        public void onServicesDiscovered(BluetoothGatt gatt, int status) {
            try {
                BluetoothGattCharacteristic inCharasteristic = gatt.getService(GATT_SERVICE)
                        .getCharacteristic(IN_CHARASTERISTIC);

                gatt.setCharacteristicNotification(inCharasteristic, true);

                BluetoothGattDescriptor inDescriptior = inCharasteristic.getDescriptor(IN_DESCRIPTOR);
                inDescriptior.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
                gatt.writeDescriptor((inDescriptior));
            } catch (Exception e) {
                reject("error", "Problem during service/charasteristic initialisation", e.toString());
            }

        }

        @Override
        public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
            if (descriptor.getUuid().equals(IN_DESCRIPTOR)) {

                BluetoothGattCharacteristic outCharacteristic = gatt.getService(GATT_SERVICE)
                        .getCharacteristic(OUT_CHARASTERISTIC);
                outCharacteristic.setValue(command);
                boolean writeResult = gatt.writeCharacteristic(outCharacteristic);
                if (!writeResult) {
                    reject("info", "Problem connecting to device, while sending command");
                    gatt.disconnect();
                }
            }
        }

        @Override
        public void onCharacteristicChanged(BluetoothGatt gatt,
                                            BluetoothGattCharacteristic characteristic) {
            byte response[] = characteristic.getValue();
            Log.i(TAG, "receiving data " + response.length + " bytes");
            resultLinesArrayRaw.pushArray(BleUtility.toWritableIntArray(response));
            resultLinesArrayString.pushString(BleUtility.toString(response));
        }

        @Override
        public void onCharacteristicRead(BluetoothGatt gatt,
                                         BluetoothGattCharacteristic characteristic,
                                         int status) {
            // Not Used
        }

    };
}
