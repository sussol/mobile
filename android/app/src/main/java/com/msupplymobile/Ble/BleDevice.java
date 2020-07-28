package com.msupplymobile;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.le.ScanResult;
import java.util.UUID;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReactContext;
import android.util.Log;

/**
 * Simple abstract class for a BleDevice which acts as a subject for
 * an observer. Implementers are initialized using a ScanResult, containing
 * details of the device and the latest advertisement info.
 */
public abstract class BleDevice{

    public static final UUID GATT_SERVICE = UUID.fromString("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
    public static final UUID OUT_CHARASTERISTIC = UUID.fromString("6e400002-b5a3-f393-e0a9-e50e24dcca9e");
    public static final UUID IN_CHARASTERISTIC = UUID.fromString("6e400003-b5a3-f393-e0a9-e50e24dcca9e");
    public static final UUID IN_DESCRIPTOR = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");
    
    protected BleDeviceListener bleDeviceListener;
    protected ScanResult scanResult;

    public BleDevice(ScanResult scanResult, ReactContext reactContext){
        this.scanResult = scanResult;
    }

    /**  Registers a listener. Currently supports just one listener */
    public void registerListener(BleDeviceListener bleLDeviceistener){
        this.bleDeviceListener = bleLDeviceistener;
    }

    /**  Notifies the listener after a command is complete */
    public void notifyListener(boolean commandResult){
        this.bleDeviceListener.BleCallback(commandResult);
    }

    /**  Notifies the listener of handled exceptions occuring */
    public void notifyListener(MsupplyException exception){
        this.bleDeviceListener.BleCallback(exception);
    }

    /**  Gets the BluetoothDevice assosciated with this object */
    public BluetoothDevice getDevice(){
        return this.scanResult.getDevice();
    }

    /**  Gets the MAC address of this device */
    public String getAddress(){
        return this.getDevice().getAddress();
    }
    
    /**  Gets the name of the physical device */
    public String getName(){
        return this.getDevice().getName();
    }

    /**  Gets the latest rssi for this device */
    public int getRssi(){
        return this.scanResult.getRssi();
    }

    /**  Returns the last advertisement data for this device */
    public byte[] getAdvertisementBytes(){
        return this.scanResult.getScanRecord().getBytes();
    }

    /**  
     * Abstract methods for implementers to implement. 
     * Sending a command to the physical device.
     * Converting the object to a JS object.
    */
    abstract void sendCommand(String command);
    abstract WritableMap toObject();

}