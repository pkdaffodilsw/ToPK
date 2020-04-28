#!/usr/bin/env bash
#
# For App Center specific configuration see examples:
# https://github.com/microsoft/appcenter/tree/master/sample-build-scripts/react-native

# TODO:
# if in app center and $APP_CENTER_CURRENT_PLATFORM" == "ios", check that we are running in release mode

# Prefer variable PROJECT_NAME as value for IOS_PROJECT_NAME,
# otherwise use Xcode workspace filename excluding the file extension
IOS_PROJECT_FILENAME=$(basename $(find ios -name '*.xcworkspace' -exec echo {} \;))
IOS_PROJECT_NAME=${PROJECT_NAME="${IOS_PROJECT_FILENAME%.*}"}

verifyAppCenterAppSecret() {
  if [ -z "$APP_CENTER_APP_SECRET" ]; then
    echo "You need to define the APP_CENTER_APP_SECRET variable in App Center"
    exit 1
  fi
}

if [ "$APP_CENTER_CURRENT_PLATFORM" == "android" ]; then
  verifyAppCenterAppSecret
  APP_CENTER_ANDROID_APP_SECRET="$APP_CENTER_APP_SECRET"
elif [ "$APP_CENTER_CURRENT_PLATFORM" == "ios" ]; then
  verifyAppCenterAppSecret
  APP_CENTER_IOS_APP_SECRET="$APP_CENTER_APP_SECRET"
fi

echo "Android: Adding appcenter-config.json ($APP_CENTER_ANDROID_APP_SECRET)"

mkdir -p android/app/src/main/assets

cat >./android/app/src/main/assets/appcenter-config.json <<-EOF
{
  "app_secret": "$APP_CENTER_ANDROID_APP_SECRET"
}
EOF

echo "iOS: Adding AppCenter-Config.plist ($APP_CENTER_IOS_APP_SECRET)"

cat >./ios/$IOS_PROJECT_NAME/AppCenter-Config.plist <<-EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>AppSecret</key>
    <string>$APP_CENTER_IOS_APP_SECRET</string>
  </dict>
</plist>
EOF

RNRN_CLI="node_modules/react-native-rename/build/bin/rnrn-cli.js"

if [ -n "$MED_BUNDLE_IDENTIFIER" ]; then
  echo "Changing bundle identifier to $MED_BUNDLE_IDENTIFIER"
  node $RNRN_CLI bundle-identifier "$MED_BUNDLE_IDENTIFIER"
fi

if [ -z "$GOOGLESERVICE_INFO_PLIST" ]; then
  echo "iOS: Missing environment variable GOOGLESERVICE_INFO_PLIST, the app will fail to start"
else
  echo "iOS: Adding GoogleService-Info.plist"
  echo "$GOOGLESERVICE_INFO_PLIST" >./ios/GoogleService-Info.plist
  cat ./ios/GoogleService-Info.plist
fi

if [ -n "$GOOGLE_SERVICES_JSON" ]; then
  echo "Android: Adding google-services.json"

  # The JSON data in the GOOGLE_SERVICES_JSON environment variable is reescaped when used in App Center.
  node -e 'fs.writeFileSync("./android/app/google-services.json", JSON.stringify(JSON.parse(process.env.GOOGLE_SERVICES_JSON.replace(/\\/g, "")), null, 2))'

  echo "Wrote google-services.json:"
  cat ./android/app/google-services.json
  echo ""
else
  if [ "$APP_CENTER_CURRENT_PLATFORM" == "android" ]; then
    echo "Missing environment variable GOOGLE_SERVICES_JSON"
    exit 1
  else
    echo "Missing environment variable GOOGLE_SERVICES_JSON, Android project will fail to build"
  fi
fi

if [ "$FIREBASE_ANALYTICS_COLLECTION_ENABLED" == "true" ]; then
  echo "Enabling Firebase Analytics"
  plutil -replace FIREBASE_ANALYTICS_COLLECTION_ENABLED -bool YES ios/Toothie/Info.plist
  node ./scripts/android-firebase-analytics.js "true"
else
  echo "Disabling Firebase Analytics"
  plutil -replace FIREBASE_ANALYTICS_COLLECTION_ENABLED -bool NO ios/Toothie/Info.plist
  node ./scripts/android-firebase-analytics.js "false"
fi

if [ -n "$FACEBOOK_APP_ID" ]; then
  echo "Enabling Facebook SDK"
  plutil -replace FacebookAppID -string "$FACEBOOK_APP_ID" ios/Toothie/Info.plist
  plutil -replace FacebookAutoLogAppEventsEnabled -bool YES ios/Toothie/Info.plist
  node ./scripts/android-facebook-sdk.js "$FACEBOOK_APP_ID"

  if [ -z "$FACEBOOK_DISPLAY_NAME" ]; then
    echo "Missing environment variable FACEBOOK_DISPLAY_NAME"
    exit 1
  else
    plutil -replace FacebookDisplayName -string "$FACEBOOK_DISPLAY_NAME" ios/Toothie/Info.plist
  fi
else
  echo "Disabling Facebook SDK"
  plutil -replace FacebookAppID -string "{facebook-app-id}" ios/Toothie/Info.plist
  plutil -replace FacebookAutoLogAppEventsEnabled -bool NO ios/Toothie/Info.plist
  node ./scripts/android-facebook-sdk.js

  plutil -replace FacebookDisplayName -string "{facebook-app-name}" ios/Toothie/Info.plist
fi

if [ -n "$MED_URL_SCHEMES" ]; then
  echo "iOS: Updating CFBundleURLSchemes ($MED_URL_SCHEMES)"
  node ./scripts/ios-cf-bundle-url-schemes.js "$MED_URL_SCHEMES"

  set -- $MED_URL_SCHEMES
  echo "Android: Updating android:scheme ($1)"
  node ./scripts/android-scheme.js "$1"
fi

echo "Android: Formatting AndroidManifest.xml"
node -e 'fs.writeFileSync(path.join(process.cwd(), "android/app/src/main/AndroidManifest.xml"), require("prettier").format(fs.readFileSync(path.join(process.cwd(), "android/app/src/main/AndroidManifest.xml"),{ encoding: "utf8" }),{ parser: "xml" }),{ encoding: "utf8" })'
