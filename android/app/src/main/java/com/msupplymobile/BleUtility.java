package com.msupplymobile;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;

public class BleUtility {
    public static int toInt(byte b) {
        return (b & 0xff);
    }
    
    public static char toChar(byte singleByte) {
        return (char)(singleByte & 0xff);
    }

    public static int toInt(byte []byteArray, int start) {
        return ((byteArray[start] & 0xff) << 8) | (byteArray[start+1] & 0xff);
    }

    public static int toUInt(byte []byteArray, int start) {
        int result = (byteArray[start] & 0xff) * 256;
        return result + (byteArray[start+1] & 0xff);
    }

    public static WritableArray toWritableIntArray(byte []byteArray){
        WritableArray returnArray = Arguments.createArray();
        for(int i=0;i<byteArray.length;i++) returnArray.pushInt(toInt(byteArray[i]));
        return returnArray;
    } 

    public static String toString(byte []byteArray) {
        String s = new String();
        for(int i =0;i<byteArray.length;i++) s+= toChar(byteArray[i]);
        return s;
    }

}
