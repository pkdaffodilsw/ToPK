import { Audio } from "expo-av"
import get from "lodash.get"
import React from "react"
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  Vibration,
  View,
} from "react-native"
import { getInset } from "react-native-safe-area-view"
import { Permissions } from "react-native-unimodules"
import { endCall } from "../api"
import { Body, Call, RoundButton, Title } from "../components"
import { useKeyboard } from "../hooks"
import { colors, fonts } from "../library"
import { Localization, Visits } from "../providers"

const { width: windowWidth } = Dimensions.get("window")

const profilePictureSize = windowWidth * 0.6

export const IncomingCall = ({ navigation }) => {
  const localization = React.useContext(Localization.Context)

  const {
    state: { clinicianProfilePicture, ...state },
    read,
  } = React.useContext(Visits.Context)

  const active = navigation.getParam("visit") || state.active

  const [controlsHeight, setControlsHeight] = React.useState(0)
  const [loading, setLoading] = React.useState(false)

  const keyboard = useKeyboard()

  const strings = localization.getStrings()

  const mounted = React.useRef(false)

  React.useEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  }, [])

  React.useEffect(() => {
    if (get(active, "call.status") !== "OnGoing") {
      mounted.current && navigation.navigate("Initialize")
    }
  }, [active, navigation])

  const soundRef = React.useRef()

  const onGoing = get(active, "call.status") === "OnGoing"

  React.useEffect(() => {
    if (onGoing) {
      Audio.Sound.createAsync(require("../assets/foofaraw.wav"), {
        shouldPlay: true,
        isLooping: true,
      })
        .then(({ sound: _sound }) => {
          soundRef.current = _sound
        })
        .catch(console.log)

      return () => {
        if (soundRef.current) {
          soundRef.current
            .stopAsync()
            .then(() => soundRef.current.unloadAsync())
            .catch(console.log)
        }
      }
    }
  }, [onGoing])

  const routeName = get(navigation, "state.routeName")

  React.useEffect(() => {
    if (onGoing && routeName === "IncomingCall") {
      Vibration.vibrate([1000, 500], true)
      return Vibration.cancel
    }
  }, [onGoing, routeName])

  React.useEffect(() => {
    Permissions.askAsync(Permissions.CAMERA, Permissions.AUDIO_RECORDING)
      .then(console.log)
      .catch(console.log)
  }, [])

  return (
    <ScrollView
      style={{
        flex: 1,
      }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "space-between",
        paddingTop: getInset("top") || 20,
        paddingBottom: keyboard.visible ? 0 : getInset("bottom") || 20,
      }}
      alwaysBounceVertical={false}
    >
      {controlsHeight > 0 && (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: controlsHeight,
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: windowWidth > 500 ? 500 : undefined,
            minWidth: windowWidth > 500 ? 500 : windowWidth,
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          <Title style={{ textAlign: "center", marginBottom: 30 }}>
            {strings.incomingCall.title}
          </Title>

          <View
            style={{
              borderRadius:
                profilePictureSize < 300 ? profilePictureSize / 2 : 150,
              backgroundColor: colors.primaryComplementary,
              marginBottom: 30,
              overflow: "hidden",
            }}
          >
            <Image
              style={{
                width: profilePictureSize,
                height: profilePictureSize,
                maxWidth: 300,
                maxHeight: 300,
                resizeMode: "cover",
              }}
              source={
                clinicianProfilePicture && clinicianProfilePicture.picture
                  ? { uri: clinicianProfilePicture.picture }
                  : require("../assets/default-profile-picture.png")
              }
            />
          </View>

          <Body
            style={{ fontFamily: fonts.openSans.bold, textAlign: "center" }}
          >
            {active && active.clinician
              ? active.clinician.name
              : strings.call.caregiver}
          </Body>
          <Body style={{ textAlign: "center" }}>
            {localization.messages.call.licensedPractitioner({
              clinicianType:
                active && active.clinicianType
                  ? active.clinicianType
                  : "Unknown",
            })}
          </Body>
        </View>
      )}

      <Call.Controls.Container
        onLayout={({
          nativeEvent: {
            layout: { height },
          },
        }) => setControlsHeight(height)}
      >
        <Call.Controls.StartCall
          disabled={loading}
          onPress={() => {
            Vibration.cancel()

            soundRef.current
              .stopAsync()
              .then(() => soundRef.current.unloadAsync())
              .then(() => navigation.navigate("Call"))
              .catch(console.log)
          }}
        />

        <Call.Controls.EndCall
          style={{ marginLeft: 20 }}
          disabled={loading}
          onPress={() => {
            Alert.alert(
              strings.incomingCall.alertTitle,
              strings.incomingCall.alertMessage,
              [
                {
                  text: strings.incomingCall.alertNegative,
                },
                {
                  text: strings.incomingCall.alertPositive,
                  onPress: () => {
                    setLoading(true)

                    Promise.all([
                      endCall({ callId: active.call.id }),
                      soundRef.current
                        .stopAsync()
                        .then(() => soundRef.current.unloadAsync()),
                    ])
                      .then(read)
                      .then(() => {
                        navigation.navigate(
                          navigation.getParam("previousScreen") || "History",
                        )
                      })
                      .catch(() => {
                        setLoading(false)
                      })
                  },
                  style: "destructive",
                },
              ],
              { cancelable: true },
            )
          }}
        />

        <RoundButton
          style={{ marginLeft: 20 }}
          onPress={() => {
            navigation.navigate("History")
          }}
          imageSource={require("../assets/x.png")}
        />
      </Call.Controls.Container>
    </ScrollView>
  )
}
