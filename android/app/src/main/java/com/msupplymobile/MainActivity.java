package com.msupplymobile;

import com.facebook.react.ReactActivity;
import com.babisoft.ReactNativeLocalization.ReactNativeLocalizationPackage;
import io.realm.react.RealmReactPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.bugsnag.BugsnagReactNative;
import android.os.Bundle;

public class MainActivity extends ReactActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
      super.onCreate(savedInstanceState);
      BugsnagReactNative.start(this);
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "mSupplyMobile";
    }
}
