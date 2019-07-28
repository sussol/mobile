package com.msupplymobile;

import android.bluetooth.le.ScanResult;

/**
 * Simple factory for initializing the correct BleDevice
 * given the manufacturer ID.
 */
public class BleDeviceFactory{

    private static final int BLUE_MAESTRO = 307;

    public static BleDevice getDevice(int manufacturerID, ScanResult scanResult){
        switch(manufacturerID){
            default:
            case (BLUE_MAESTRO):
                return new BlueMaestroDevice(scanResult);
        }
    }
}