package com.msupplymobile;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableArray;
import android.util.Log;
import java.nio.ByteBuffer;
import java.nio.ShortBuffer;
import java.nio.ByteOrder;
import java.util.Arrays;

/**
 * Simple parser for the BlueMaestro sensor.
 */
public class BlueMaestroParser extends BleParser{

    private static final int DELIMITER_VALUE = 11308;
    private static final int ALTERNATE_DELIMITER_VALUE = 11776;
    private static final int ADVERTISEMENT_OFFSET = 7;
    private static final int LOGS_HEADER_OFFSET = 15;
    private static final String ERROR_COMMAND_RESULT = "error";

    /**
     * Uses a bytebuffer as a view over the byte array to decode bytes of a
     * BlueMaestro sensor advertisement packet and place in a JS useable object.
     * First 7 bytes are mysterious, as are bytes 19-34.
     */
    public WritableMap parseAdvertisement(byte[] advertisementBytes){
        WritableMap advertisement = Arguments.createMap();
        int bufferLength = advertisementBytes.length - ADVERTISEMENT_OFFSET;
        ByteBuffer byteBuffer = ByteBuffer.wrap(advertisementBytes,ADVERTISEMENT_OFFSET,bufferLength).asReadOnlyBuffer();
        // Get Index: 7
        advertisement.putInt(VERSION_NUMBER, (int)byteBuffer.get());
        // Get Index: 8
        advertisement.putInt(BATTERY_LEVEL, (int)byteBuffer.get());
        // Get Index: 9,10
        advertisement.putInt(LOGGING_INTERVAL, byteBuffer.getShort());
        // Get Index: 11,12
        advertisement.putInt(NUMBER_OF_LOGS, byteBuffer.getShort());
        // Get Index: 13,14
        advertisement.putDouble(CURRENT_TEMPERATURE, byteBuffer.getShort()/10.0);
        // Get Index 15,16 
        advertisement.putDouble(CURRENT_HUMIDITY, byteBuffer.getShort()/10.0);
        // Get Index: 17,18
        advertisement.putDouble(CURRENT_DEW_POINT, byteBuffer.getShort()/10.0);
        byteBuffer.position(35);
        // Get Index: 35,36
        advertisement.putDouble(HIGHEST_TEMPERATURE, byteBuffer.getShort()/10.0);
        // Get Index: 37,38
        advertisement.putDouble(HIGHEST_HUMIDITY, byteBuffer.getShort()/10.0);
        // // Get Index: 39,40
        advertisement.putDouble(LOWEST_TEMPERATURE, byteBuffer.getShort()/10.0);
        // // Get Index: 41,42
        advertisement.putDouble(LOWEST_HUMIDITY, byteBuffer.getShort()/10.0);
         // Get Index: 43,44
        advertisement.putDouble(HIGHEST_TEMP_DAY, byteBuffer.getShort()/10.0);
         // Get Index: 45,46
        advertisement.putDouble(HIGHEST_HUMIDITY_DAY, byteBuffer.getShort()/10.0);
         // Get Index: 47,48
        advertisement.putDouble(HIGHEST_DEW_POINT_DAY, byteBuffer.getShort()/10.0);
        // Get index: 49, 50
        advertisement.putDouble(LOWEST_TEMP_DAY, byteBuffer.getShort()/10.0);
        // Get index: 51, 52
        advertisement.putDouble(LOWEST_HUMIDITY_DAY, byteBuffer.getShort()/10.0);
        // Get index: 53, 54
        advertisement.putDouble(LOWEST_DEW_POINT_DAY, byteBuffer.getShort()/10.0);
        // Get index: 55, 56
        advertisement.putDouble(AVERAGE_TEMP_DAY, byteBuffer.getShort()/10.0);
        // Get index: 57, 58
        advertisement.putDouble(AVERAGE_HUMIDTY_DAY, byteBuffer.getShort()/10.0);
        // Get index: 59, 60
        advertisement.putDouble(AVERAGE_DEW_POINT_DAY, byteBuffer.getShort()/10.0);
        return advertisement;
    }


    /**
     * Byte array has 15 bytes of header values, and three sequences
     * delimited by DELIMITER_VALUE and 7-9 0 bytes. Each value is a 
     * short (2 bytes). Parser only decodes the first sequence, temperatures,
     * and returns an array of objects [ {temperature} ]
     */
    public WritableArray parseLogs(byte[] logData){
        int bufferLength = logData.length - LOGS_HEADER_OFFSET;
        ShortBuffer shortBuffer = ByteBuffer.wrap(logData,LOGS_HEADER_OFFSET,bufferLength)
                                            .asShortBuffer()
                                            .asReadOnlyBuffer();
        WritableArray result = Arguments.createArray();
        short shortValue = shortBuffer.get();
        while (shortValue != DELIMITER_VALUE & shortValue != ALTERNATE_DELIMITER_VALUE){
            WritableMap sensorLog = Arguments.createMap();
            sensorLog.putDouble("temperature", shortValue / 10.0 );
            result.pushMap(sensorLog);
            shortValue = shortBuffer.get();
        }
        return result;
    }

    /**
     * Parse the result of a command send to the sensor determining
     * if it was successful or not.
     * Unsuccesful commands always return "error" or "Error",
     * while succesful commands either return a stream of
     * bytes which are downloaded (with a header of at least 15 bytes)
     * or some variation of "Ok" or "ok", with varying filler bytes.
     */
    public boolean parseCommandResult(byte[] data){
        if (data.length == 0) return false;
        if (data.length > LOGS_HEADER_OFFSET) return true;
        
        String result  = new String(data);
        if (!result.equalsIgnoreCase(ERROR_COMMAND_RESULT)) return true;
        return false;
    }
}