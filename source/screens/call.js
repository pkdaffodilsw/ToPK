import { useKeepAwake } from "expo-keep-awake"
import get from "lodash.get"
import React from "react"
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  View,
} from "react-native"
import { getInset } from "react-native-safe-area-view"
import {
  TwilioVideo,
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
} from "react-native-twilio-video-webrtc"
import { endCall } from "../api"
import { Body, Call as CallComponents } from "../components"
import {
  useAccessToken,
  useHiddenStatusBar,
  useLocalization,
  useTwilioVideo,
  useVisits,
} from "../hooks"
import { analytics, appState, colors } from "../library"

const { twilioStatus } = useTwilioVideo

const { height: windowHeight, width: windowWidth } = Dimensions.get("window")

const localViewTargetWidth = Math.floor(windowWidth * 0.35)
// Aiming for a 4:3 aspect ratio, need a number which is divisible by 3
const localViewWidth = localViewTargetWidth - (localViewTargetWidth % 3)
const localViewHeight = (localViewWidth / 3) * 4

export const Call = ({ navigation }) => {
  useHiddenStatusBar()
  useKeepAwake()

  const { current: accessToken } = useAccessToken()

  const {
    state: { active: visit },
  } = useVisits()

  const { call = {} } = visit || {}

  const twilioVideo = useTwilioVideo({
    accessToken,
    roomName: call.roomName,
  })

  React.useEffect(() => {
    const navigationListener = navigation.addListener("willBlur", () => {
      twilioVideo.disconnect()
    })

    return navigationListener.remove
  }, [navigation, twilioVideo])

  const [callEnded, setCallEnded] = React.useState(false)

  const ready =
    !callEnded &&
    !twilioVideo.state.roomCompleted &&
    twilioVideo.state.status === twilioStatus.disconnected &&
    call.roomName &&
    accessToken

  React.useEffect(() => {
    if (ready) {
      twilioVideo.connect()
    }
  }, [ready, twilioVideo])

  const onEnd = React.useCallback(() => {
    if (!callEnded) {
      setCallEnded(true)
      twilioVideo.disconnect()

      return (call.id ? endCall({ callId: call.id }) : Promise.resolve())
        .then(() => {})
        .catch(error => {
          console.log(error)
          setCallEnded(false)
          analytics.trackEvent("callError", error)
          navigation.navigate({ routeName: "Initialize" })

          return Promise.reject(error)
        })
    }
  }, [call.id, callEnded, navigation, twilioVideo])

  React.useEffect(() => {
    if (
      !callEnded &&
      call.status !== "OnGoing" &&
      twilioVideo.state.status === twilioStatus.connected
    ) {
      onEnd()
    }
  }, [call.status, callEnded, onEnd, twilioVideo.state.status])

  const params = React.useRef({})

  React.useEffect(() => {
    if (visit) {
      params.current = {
        visitId: visit.id,
        clinicianId: visit.clinician && visit.clinician.id,
      }
    }
  }, [visit])

  React.useEffect(() => {
    if (twilioVideo.state.roomCompleted || !visit) {
      get(navigation, "state.routeName") !== "Feedback" &&
        navigation.navigate({
          routeName: "Feedback",
          params: params.current,
        })
    }
  }, [visit, navigation, twilioVideo.state.roomCompleted])

  // Solves issue with dropped audio after app loses focus on iOS (#8941)
  React.useEffect(() => {
    if (Platform.OS === "ios") {
      if (!callEnded) {
        const activeListener = appState.onActive(() => {
          twilioVideo.connect()
        })

        const inactiveListener = appState.onInActive(() => {
          twilioVideo.disconnect()
        })

        return () =>
          [activeListener, inactiveListener].forEach(unsubscribe =>
            unsubscribe(),
          )
      }
    }
  }, [callEnded, twilioVideo])

  const localization = useLocalization()
  const strings = localization.getStrings()

  return (
    <>
      {(twilioVideo.state.roomCompleted ||
        twilioVideo.state.status === twilioStatus.connecting ||
        twilioVideo.state.status === twilioStatus.disconnecting) && (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator
            style={{ marginBottom: 30 }}
            color={colors.primary}
          />
          <Body style={{ textAlign: "center" }}>
            {twilioVideo.state.status === twilioStatus.connecting &&
              strings.call.connecting}
          </Body>
        </View>
      )}

      {twilioVideo.state.status === twilioStatus.connected && (
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, width: windowWidth, height: windowHeight }}>
            {twilioVideo.twilioParticipantViewProps && (
              <TwilioVideoParticipantView
                style={{ width: windowWidth, height: windowHeight }}
                {...twilioVideo.twilioParticipantViewProps}
              />
            )}
          </View>

          <View
            style={{
              position: "absolute",
              right: 10,
              top: Math.max(getInset("top"), 20) - 20 + 10,
              shadowColor: colors.gray900,
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowOpacity: 0.4,
              shadowRadius: 6,
              zIndex: 10,
              backgroundColor: colors.gray900,
              borderRadius: 5,
              elevation: 7,
            }}
          >
            <View
              style={{
                flex: 1,
                overflow: "hidden",
                borderRadius: 5,
                backgroundColor: "#000",
                width: localViewWidth,
                height: localViewHeight,
              }}
            >
              <TwilioVideoLocalView
                style={{
                  flex: 1,
                }}
                {...twilioVideo.twilioVideoLocalViewProps}
              ></TwilioVideoLocalView>
            </View>
          </View>

          <CallComponents.Header
            localViewWidth={localViewWidth}
            name={
              visit && visit.clinician
                ? visit.clinician.name
                : strings.call.caregiver
            }
            title={localization.messages.call.licensedPractitioner({
              clinicianType:
                visit && visit.clinicianType ? visit.clinicianType : "Unknown",
            })}
          />

          <CallComponents.Controls.Container>
            <CallComponents.Controls.FlipCamera
              onPress={twilioVideo.flipCamera}
            />

            <CallComponents.Controls.Mute
              onPress={() => {
                twilioVideo.toggleLocalAudio()
              }}
              muted={!twilioVideo.state.localAudioEnabled}
              disabled={
                (twilioVideo.state.status !== twilioStatus.connected &&
                  twilioVideo.state.status !== twilioStatus.connecting) ||
                twilioVideo.state.togglingLocalAudio
              }
              style={{ marginLeft: 20 }}
            />

            <CallComponents.Controls.EndCall
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
                        onEnd()
                      },
                      style: "destructive",
                    },
                  ],
                  { cancelable: true },
                )
              }}
              disabled={twilioVideo.state.status !== twilioStatus.connected}
              style={{ marginLeft: 20 }}
            />
          </CallComponents.Controls.Container>
        </View>
      )}

      <TwilioVideo {...twilioVideo.twilioVideoProps} />
    </>
  )
}
