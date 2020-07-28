package com.msupplymobile;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothProfile;
import android.bluetooth.le.ScanResult;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import android.net.Uri;
import android.os.Environment;
import android.util.Log;
import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.nio.ByteBuffer;
import java.util.Timer;
import java.util.TimerTask;
import java.util.UUID;
import java.util.Arrays;

/**
 * BleDevice implementation, interface to a BlueMaestro sensor.
 * Can represent the object as a WritableMap with any downloaded
 * data and it's latest Advertisement data.
 */
public class BlueMaestroDevice extends BleDevice{

    // Delay between retrying GATT connections
    private static final int CONNECTION_DELAY = 200;
    // Number of attempts to retry a GATT connection
    private static final int NUMBER_OF_RETRIES = 20;

    private ReactContext reactContext;
    private byte[] logs;
    BleParser parser;
    private String command;
    private boolean connected;
    private int retryCount;
    
    private byte[] commandResult;
    
    public BlueMaestroDevice(ScanResult scanResult, ReactContext reactContext){
        super(scanResult, reactContext);
        command = "";
        retryCount = 0;
        connected = false;
        commandResult = new byte[0];
        parser = new BlueMaestroParser();
    }

    /**
     * Cleanup after sending a command. Determine if the command
     * was a success or failure and report back to the listener.
     */
    private void completeCommand(){
         notifyListener(parser.parseCommandResult(commandResult));
    }

    /**
     * Parse the devices latest advertisement
     */
    private WritableMap parseAdvertisement(){
        return parser.parseAdvertisement(this.getAdvertisementBytes());
    }

    /**
     * Parses the devices downloaded logs
     */
    private WritableArray parseLogs(){
        return parser.parseLogs(commandResult);
    }

    /**
     * Creates an interoperable object of this devices
     * data to send to JS.
     */
    @Override
    public WritableMap toObject(){
        
        if (Debug.LOG){
            try{
                Uri uri = Uri.parse("file://" + Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).getAbsolutePath() + "/ble");
                OutputStream stream;
                stream = reactContext.getContentResolver().openOutputStream(uri,  "wa");
                byte[] bytes = this.getAdvertisementBytes();
                stream.write(bytes);
                if (this.commandResult != null){
                    stream.write(this.commandResult);
                }
                stream.close();
            }catch(Throwable log){
                if (Debug.LOG) Log.i(Debug.TAG, "Error writing:" + log.toString());
            }
        }

        WritableMap asObject = this.parseAdvertisement();
        asObject.putString("name", getName());
        asObject.putString("macAddress", getAddress());
        asObject.putInt("rssi", getRssi());
        if (command.equals("*logall")){
            asObject.putArray("logs", this.parseLogs());
        }
        return asObject;
    }

    /**
     * Send a command to the physical device through a GATT connection,
     * notifying listeners when complete.
     */
    @Override
    public void sendCommand(String command){
        if (Debug.LOG) Log.i(Debug.TAG, "BleDevice: Sending command");
        this.command = command;
        connectGattWithTimeout();
    }

    /**
     * Wraps the GATT connection with a timeout due to Android Bluetooth
     * having problems with a GATT connection being started soon after a
     * Bluetooth scan/GATT connection stops.
    */
    private void connectGattWithTimeout() {
        TimerTask scanTimeout = new TimerTask() { public void run() { connectGatt(); };};
        new Timer().schedule(scanTimeout, this.CONNECTION_DELAY);
    }

    /**
     * Initiate the GATT connection with the device.
     */
    private void connectGatt() {
        try {
            BluetoothGatt gatt = getDevice().connectGatt(reactContext, false, getCommandResultCallback);
        } catch (Exception exception) {
            notifyListener(new MsupplyException(ErrorCode.E_GATT_CONNECTION, exception));
        }
    }

    /**
     * Callback for the GATT connection.
     */
    private BluetoothGattCallback getCommandResultCallback = new BluetoothGattCallback() {
        /**
         * Entry/Exit for a GATT connection. On initializing, ensure the connection state is
         * connected. On some Android versions GATT connections don't get established
         * quickly, so if a connection isn't established at first, retry with a delay.
         * 
         */
        @Override
        public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
            if (Debug.LOG) Log.i(Debug.TAG, "BleDevice: OnConnectionStateChanged");
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                gatt.discoverServices();
                connected = true;
            } else if (!connected && retryCount < NUMBER_OF_RETRIES) {
                retryCount++;
                gatt.close();
                connectGattWithTimeout();
            } else {
                gatt.close();
                completeCommand();
            }
        }
        /**
         * After connecting and discovering services, using the TX characteristic and descriptor,
         * Write to the descriptor for initiating a UART connection.
         */
        @Override
        public void onServicesDiscovered(BluetoothGatt gatt, int status) {
            try {
                BluetoothGattCharacteristic inCharasteristic = gatt.getService(GATT_SERVICE)
                                                                   .getCharacteristic(IN_CHARASTERISTIC);
                gatt.setCharacteristicNotification(inCharasteristic, true);
                BluetoothGattDescriptor inDescriptor = inCharasteristic.getDescriptor(IN_DESCRIPTOR);
                inDescriptor.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
                gatt.writeDescriptor((inDescriptor));
            } catch (Exception e) {
                notifyListener(new MsupplyException(ErrorCode.E_IN_DESC_WRITE));
            }
        }
        // Write to the RX characteristic, to receive data from the onCharacteristicChanged callback.
        @Override
        public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
            if (descriptor.getUuid().equals(IN_DESCRIPTOR)) {
                BluetoothGattCharacteristic outCharacteristic = gatt.getService(GATT_SERVICE)
                                                                    .getCharacteristic(OUT_CHARASTERISTIC);
                outCharacteristic.setValue(command);
                boolean writeResult = gatt.writeCharacteristic(outCharacteristic);
                if (!writeResult) notifyListener(new MsupplyException(ErrorCode.E_OUT_CHAR_WRITE));
            }
        }

        /**
         * On writing to the RX characteristic, continually receive a stream of data from the device
         * until the connection closes. Store a flattened array of bytes for this stream.
         */
        @Override
        public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
            byte response[] = characteristic.getValue();
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            try{
                output.write(commandResult);
                output.write(response);
            } catch(Exception exception){
                notifyListener(new MsupplyException(ErrorCode.E_DOWNLOADING_LOGS, exception));
                
            }
            commandResult = output.toByteArray();
        }

        @Override
        public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
            // Not Used
        }
    };

}