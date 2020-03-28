package com.msupplymobile;

public enum ErrorCode{
    E_PARSING_FAILED("Problem parsing, decode failed"),
    E_GATT_CONNECTION("Problem fetching the GATT connection"),
    E_DOWNLOADING_LOGS("Problem downloading logs from sensor"),
    E_COMMAND_FAILED("Problem executing the supplied command"),
    E_UNFOUND_DEVICE("Problem finding the specified device"),
    E_IN_DESC_WRITE("Problem writing an incoming descriptor"),
    E_OUT_CHAR_WRITE("Problem writing an outgoing characteristic"),
    E_INVALID_ADDRESS("Problem setting the address filter"),
    E_SCAN_FAILED("Problem occurred while scanning"),
    E_NULL_SCAN_RESULT("A scan resulted in a null value"),
    E_UNKOWN_SCAN_RESULT("An unkown scan result was retrieved"),
    E_CANT_SCAN("Problem when iniating a BLE scan"),
    E_BLUETOOTH_DISABLED("Problem enabling the bluetooth adapter"),
    E_BLUETOOTH_ADAPTER("Problem accessing the bluetooth adapter"),
    E_BLUETOOTH_DENIED("Denied access to the bluetooth adapter");

    private final String message;

    private ErrorCode(String message){
        this.message = message;
    }

    public String getName(){
        return this.name();
    }

    public String getMessage(){
        return this.message;
    }
}