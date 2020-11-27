package com.msupplymobile;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import android.util.Log;
import java.util.Map;

/**
 * Singleton react-native class managing native Bluetooth adapter.
 * Acts as a listener to both devices and a Bluetooth scanner.
 * 
 * React methods:
 * getDevices: 
 * Scans for devices using the DeviceScanner. Uses a manufacturerID (required)
 * and a MAC address (optional) to filter results. Each device found is a BleDevice,
 * which can be represented as a WritableMap to send back to JS.
 * 
 * sendCommand:
 * Scans for a particular device using it's MAC address. Once found, the command is sent
 * and calls back with the result - true/false. Downloaded data, if any, is held in the
 * BleDevice.
 */
public class BleManager extends ReactContextBaseJavaModule implements BleScanListener, BleDeviceListener{
    private ReactContext reactContext;
    private Promise promise;
    private String command;
    private String macAddress;
    private Map<String, BleDevice> devices;

    public BleManager(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "BleManager";
    }

    /** 
     * Callback for handling commands sent to devices,
     * whether it was succcesful, or not.
     * Overrides BleDeviceListener
     */
    @Override
    public void BleCallback(boolean result){
        if (Debug.LOG) Log.i(Debug.TAG, "BleManager: Device callback");
        if (result){
            this.handleEvent();    
        } else{
            this.returnException(new MsupplyException(ErrorCode.E_COMMAND_FAILED));
        }
    }

    /** 
     * Callback for handled exceptions occuring which will be resolved.
     * MsupplyExcpetion can be represented as a WritableMap to send
     * to JS.
     * Overrides BleDeviceListener
     */
    @Override
    public void BleCallback(MsupplyException exception){
        if (Debug.LOG) Log.i(Debug.TAG, "BleManager: Exception callback");
        this.returnException(exception);
    }

    /** 
     * Callback for scanning operations 
     * Overrides BleScanListener
     * */
    @Override
    public void BleCallback(Map<String,BleDevice> result){
        if (Debug.LOG) Log.i(Debug.TAG, "BleManager: WritableMap callback");
        this.devices = result;
        handleEvent();
    }

    /**
     * Handler for events received from subjects the manager listens
     * to. Decides after receiving an event, either receiving results
     * of a scan or results of a command if a new command needs to be
     * executed, or if the results should be sent back to JS.
     */
    private void handleEvent(){
        if (Debug.LOG) Log.i(Debug.TAG, "BleManager: Handling event");
        // If there is a command, mac address and devices have been scanned, 
        // a command needs to be executed.
        boolean shouldSendCommand = this.command != null && this.macAddress != null && this.devices != null;
        if (shouldSendCommand){
            try{
                BleDevice device = this.devices.get(this.macAddress);
                if (Debug.LOG) Log.i(Debug.TAG, "BleManager: in should send");
                String commandSub = this.command;
                this.command = this.macAddress = null;
                // Register to events from the BLE device
                device.registerListener(this);
                if (Debug.LOG) Log.i(Debug.TAG, "BleManager: after register");
                device.sendCommand(this.reactContext, commandSub);
                if (Debug.LOG) Log.i(Debug.TAG, "BleManager: after send command");
            }catch(Exception exception){
                returnException(new MsupplyException(ErrorCode.E_UNFOUND_DEVICE, exception));
            }
        } else{
            returnResult();
        }
    }

    /**
     * Exit point for returning an exception to JS
     * Returns all handled, but failed attempts with
     * an object in the shape:
     * {
     *     success: false,
     *     error: {
     *         code,
     *         message,
     *         extra [stack trace],
     *     }
     * }
     */
    private void returnException(MsupplyException exception){
        this.command = this.macAddress = null;
        if (Debug.LOG) Log.i(Debug.TAG, "BleManager: Returning Exception");
        WritableMap jsObject = Arguments.createMap();
        jsObject.putBoolean("success", false);
        jsObject.putMap("error", exception.toObject());
        if (promise != null) promise.resolve(jsObject);
        promise = null;
    }

    /**
     * Exit point for returning a result to JS.
     * Returns all succesful executions to JS with
     * an object in the shape:
     * {
     *     success: true,
     *     data: [ BleDevice.toObject(), .. ] 
     * }
     */
    private void returnResult(){
        if (Debug.LOG) Log.i(Debug.TAG, "Return Result");
        WritableArray results = Arguments.createArray();
        
        for (String key : this.devices.keySet()){
            try{
                if (Debug.LOG) Log.i(Debug.TAG, key);
                WritableMap bleDeviceAsObject = this.devices.get(key).toObject();
                results.pushMap(bleDeviceAsObject);
            } catch(Exception exception){
                returnException(new MsupplyException(ErrorCode.E_PARSING_FAILED, exception));
                return;
            }
        }
        WritableMap jsObject = Arguments.createMap();
        jsObject.putBoolean("success", true);
        jsObject.putArray("data", results);
        if (promise != null) promise.resolve(jsObject);
        promise = null;
    }
    
    /**
     * Spin up a BLE device scanner and register to it as a listener.
     * If providing a device address, scan for that specific device,
     * otherwise if providing an empty string scan for all devices.
     * On either fetching the advertisement data for one device, all the
     * time expires when scanning for all devices, the scanner will notify
     * of all fetched advertisement data.
     */
    @ReactMethod
    public void getDevices(int manufacturerID, String macAddress, Promise promise) {
        Log.i(Debug.TAG, "getDevices:" + Integer.toString(manufacturerID) + " " + macAddress);
        this.promise = promise;
        BleDeviceScanner deviceScanner = new BleDeviceScanner(reactContext);
        deviceScanner.registerListener(this);
        deviceScanner.setFilters(manufacturerID, macAddress);
        // Full coverage fallback catcher for any uncaught errors occuring.
        try{
            deviceScanner.initiateScan();
        }catch(Throwable e){
            if (promise != null) promise.reject("error", e.toString());
            promise = null;
        }
    }

    /**
     * Find the provided device and send the provided command.
     */
    @ReactMethod
    public void sendCommand(int manufacturerID, String macAddress, String command, Promise promise) {
        if (Debug.LOG) Log.i(Debug.TAG, "sendCommand" + Integer.toString(manufacturerID) + " " + macAddress + " " + command);
        this.promise = promise;
        this.command = command;
        this.macAddress = macAddress;
        getDevices(manufacturerID, macAddress, promise);
    }
}