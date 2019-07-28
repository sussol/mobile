package com.msupplymobile;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import android.util.Log;

public class MsupplyException extends Exception{

    ErrorCode errorCode;

    public MsupplyException(ErrorCode errorCode){
        super(errorCode.toString());
        this.errorCode = errorCode;
    }

    public MsupplyException(ErrorCode errorCode, Exception cause){
        super(errorCode.toString(), cause);
        this.errorCode = errorCode;
    }

    public String getStack(){
        return Log.getStackTraceString(this);
    }

    public WritableMap toObject(){
        WritableMap asObject = Arguments.createMap();
        asObject.putString("code",this.errorCode.getName());
        asObject.putString("message",this.errorCode.getMessage());
        asObject.putString("extra",this.getStack());
        return asObject;
    }
}

