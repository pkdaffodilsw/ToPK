package se.medigital.toothie.debug;

// react-native-screens
// import com.facebook.react.ReactActivity;
import com.facebook.react.ReactFragmentActivity;
import android.os.Bundle;
import android.view.WindowManager;

// react-native-gesture-handler
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

// react-native-splash-screen
import org.devio.rn.splashscreen.SplashScreen;

import android.content.Intent;

// react-native-screens replaces ReactActivity with ReactFragmentActivity
// public class MainActivity extends ReactActivity {
public class MainActivity extends ReactFragmentActivity {
    // react-native-screens
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.show(this, R.style.SplashScreenTheme);
        super.onCreate(null);
        // prevent app screen shot in task manager
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        MainApplication.getCallbackManager().onActivityResult(requestCode, resultCode, data);
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "Toothie";
    }

    // react-native-gesture-handler
    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegate(this, getMainComponentName()) {
            @Override
            protected ReactRootView createRootView() {
                return new RNGestureHandlerEnabledRootView(MainActivity.this);
            }
        };
    }
}
