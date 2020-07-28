package com.msupplymobile;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReactContext;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.util.Hashtable;
import java.util.TimerTask;
import java.util.Timer;

/**
 * Interface for the native Bluetooth scanner. Executes a scan creating
 * a BleDevice for devices found. Can use a manufacturer ID and MAC address
 * for filtering.
 */
public class BleDeviceScanner {

    private static final int REQUEST_ENABLE_BT = 2;
    private static final int ALLOW_BLUETOOTH = -1;
    private static final int DENY_BLUETOOTH = 0;
    private static final int SCAN_TIMEOUT = 10000;
    private int manufacturerID;
    private boolean isScanEnabled;
    private String deviceAddress;
    private Map<String, BleDevice> scannedDevices;
    private ReactContext reactContext;
    private BluetoothLeScanner leScanner;
    BluetoothAdapter btAdapter;
    private ScanSettings scanSettings;
    private List<ScanFilter> scanFilters;
    private List<BleScanListener> listeners;
    private TimerTask scanTimeout;
    
    /**
     * Interface to the native bluetooth device. 
     */
    public BleDeviceScanner(ReactContext reactContext) {
        this.reactContext = reactContext;
        reactContext.addActivityEventListener(activityEventListener);
        isScanEnabled = false;
        
        scannedDevices = new Hashtable();
        listeners = new ArrayList<BleScanListener>();

        // Default scan settings
        this.deviceAddress = "";
    }


    public void setFilters(int manufacturerID, String deviceAddress){
        this.deviceAddress = deviceAddress;
        this.manufacturerID = manufacturerID;
    }

    /** Setter for the lookup table of scanned devices */
    private void addScannedDevice(BleDevice bleDevice){
        if (Debug.LOG) Log.i(Debug.TAG,"Adding device:" + bleDevice.getAddress());
        this.scannedDevices.put(bleDevice.getAddress(),bleDevice);
    }

    /** Check if a device has already been scanned previously */
    private boolean hasBeenScanned(BleDevice bleDevice){
        if (Debug.LOG) Log.i(Debug.TAG,"Checking if " + bleDevice.getAddress() + " has been scanned");
        return this.scannedDevices.containsKey(bleDevice.getAddress());
    }

    /** Register a listener which will be notified when receiving a result. */
    public void registerListener(BleScanListener listener){
        if (Debug.LOG) Log.i(Debug.TAG,"Registered listener");
        this.listeners.add(listener);
    }

    /** 
     * Notify listeners of this subject that a scan has finished
     * providing a WritableMap with the shape:
     * {
     *     macAddress: BleDevice.toObject()
     *     ...
     * }
     */
    public void notifyListeners(){
        if (Debug.LOG) Log.i(Debug.TAG, "Device Scanner: Notifying listeners with WritableMap");
        stopScan();
        for (BleScanListener listener : listeners) listener.BleCallback(this.scannedDevices);
    }

    /** Notify listeners of an exception that has occurred. */
    public void notifyListeners(MsupplyException exception){
        if (Debug.LOG) Log.i(Debug.TAG, "Device Scanner: Notifying listeners with Exception");
        stopScan();
        for (BleScanListener listener : listeners) listener.BleCallback(exception);
    }

    /** Stop the current scan, if scanning. Return the result */
    public boolean stopScan(){
        if (Debug.LOG) Log.i(Debug.TAG, "Device Scanner: Stopping scan");
        if (isScanEnabled){
            scanTimeout.cancel();
            isScanEnabled = false;
            if (leScanner != null) leScanner.stopScan(scanCallback);
            leScanner = null;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Start the scan by setting the scan settings and filters. Starts an
     * acitivity requesting BlueTooth is enabled, if it is, or if the
     * users enables it, start the scan through that activity.
     */
    public void initiateScan(){
        if (Debug.LOG) Log.i(Debug.TAG, "Device Scanner: Starting scan");
        ScanFilter.Builder scanFilterBuilder = new ScanFilter.Builder().setManufacturerData(this.manufacturerID, new byte[0]);
        ScanSettings.Builder scanSettingsBuilder = new ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).setMatchMode(ScanSettings.MATCH_MODE_AGGRESSIVE).setReportDelay(0);
        if(!deviceAddress.equals("")) {
            try{
                scanFilterBuilder.setDeviceAddress(this.deviceAddress);
                scanSettingsBuilder.setNumOfMatches(ScanSettings.MATCH_NUM_ONE_ADVERTISEMENT);
            }catch(Exception e){
                notifyListeners(new MsupplyException(ErrorCode.E_INVALID_ADDRESS));
                return;
            }
        }

        scanFilters = Arrays.asList(new ScanFilter[]{ scanFilterBuilder.build() });
        scanSettings = scanSettingsBuilder.build();
        
        
        Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
        reactContext.getCurrentActivity().startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);   
    }

    /**
     * Start the Bluetooth scan after setting a timer
     * to cancel the scan and return.
     */
    private void startTimedScan(){
        if (Debug.LOG) Log.i(Debug.TAG, "Device Scanner: Setting timer");
        isScanEnabled = true;
        scanTimeout = new TimerTask() { public void run() { notifyListeners(); }};
        new Timer().schedule(scanTimeout, this.SCAN_TIMEOUT);
        scan();
    }

    /**
     * Uses the native Bluetooth adapter to initialize the BLE scan.
     * Should be a call from activityEventListener.onActivityResult
     * to ensure bluetooth is enabled on the device.
     */
    private void scan(){
        if (Debug.LOG) Log.i(Debug.TAG, "Device Scanner: Initializing scan");
        btAdapter = ((BluetoothManager) reactContext.getSystemService(Context.BLUETOOTH_SERVICE)).getAdapter();
        // Null when bluetooth is disabled or not supported on the device.
        if (btAdapter == null){
            notifyListeners(new MsupplyException(ErrorCode.E_BLUETOOTH_ADAPTER));
            return;
        }
        leScanner = btAdapter.getBluetoothLeScanner();
        if (leScanner == null){
            notifyListeners(new MsupplyException(ErrorCode.E_BLUETOOTH_ADAPTER));
            return;
        }
        leScanner.startScan(scanFilters, scanSettings, scanCallback);
    }

    /**
     * Activity event for enabling bluetooth.
     * 
     * Once the intent has executed the user is prompted to enable bluetooth. If allowed,
     * the resultCode = -1 otherwise resultCode = 0.
     */
    private final ActivityEventListener activityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent) {
            if (Debug.LOG) Log.i(Debug.TAG, "Device Scanner: Checking Bluetooth status");
            if (requestCode == REQUEST_ENABLE_BT) {
                reactContext.removeActivityEventListener(this);
                if (resultCode == ALLOW_BLUETOOTH) startTimedScan();
                else notifyListeners(new MsupplyException(ErrorCode.E_BLUETOOTH_DISABLED));
            }
        }
    };

    private ScanCallback scanCallback = new ScanCallback(){
        @Override
        public void onScanResult(int callbackType, ScanResult scanResult) {
            Log.i(Debug.TAG, "Device Scanner: On scan result");
            if (!isScanEnabled) return;
            if (scanResult == null){
                notifyListeners(new MsupplyException(ErrorCode.E_NULL_SCAN_RESULT));
            } else{
                BleDevice bleDevice = BleDeviceFactory.getDevice(manufacturerID, scanResult, reactContext);
                if (!hasBeenScanned(bleDevice)) addScannedDevice(bleDevice);
                if (bleDevice.getAddress().equals(deviceAddress)) notifyListeners();
            }
        }

        @Override
        public void onBatchScanResults(List<ScanResult> results) {
            notifyListeners(new MsupplyException(ErrorCode.E_UNKNOWN_SCAN_RESULT));
        }

        @Override
        public void onScanFailed(int errorCode) {
            notifyListeners(new MsupplyException(ErrorCode.E_SCAN_FAILED));
        } 
    };

 }
