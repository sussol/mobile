package com.msupplymobile;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableArray;

public abstract class BleParser{
 
    public static final String BATTERY_LEVEL = "batteryLevel";
    public static final String LOGGING_INTERVAL = "loggingInterval";
    public static final String NUMBER_OF_LOGS = "numberOfLogs";
    public static final String VERSION_NUMBER = "versionNumber";
    
    public static final String AVERAGE_TEMP_DAY = "averageTempDay";
    public static final String AVERAGE_HUMIDTY_DAY = "averageHumidityDay";
    public static final String AVERAGE_DEW_POINT_DAY = "averageDewPointDay";
    
    public static final String CURRENT_TEMPERATURE = "currentTemperature";
    public static final String CURRENT_HUMIDITY = "currentHumidity";
    public static final String CURRENT_DEW_POINT = "currentDewPoint";

    public static final String HIGHEST_TEMP_DAY = "highestTempDay";
    public static final String HIGHEST_HUMIDITY_DAY = "highestHumidityDay";
    public static final String HIGHEST_DEW_POINT_DAY = "highestDewPointDay";
    
    public static final String HIGHEST_HUMIDITY = "highestHumidity";
    public static final String HIGHEST_TEMPERATURE = "highestTemperature";
    
    public static final String LOWEST_TEMPERATURE = "lowestTemperature";
    public static final String LOWEST_HUMIDITY = "lowestHumidity";
    public static final String LOWEST_DEW_POINT = "lowestDewPoint";
    
    public static final String LOWEST_TEMP_DAY = "lowestTempDay";
    public static final String LOWEST_HUMIDITY_DAY = "lowestHumidityDay";
    public static final String LOWEST_DEW_POINT_DAY = "lowestDewPointDay";
    
    abstract WritableMap parseAdvertisement(byte[] advertisementBytes);
    abstract WritableArray parseLogs(byte[] logData);
    abstract boolean parseCommandResult(byte[] data);
}