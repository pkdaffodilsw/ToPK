import chroma from "chroma-js"
import React from "react"
import { Dimensions, View } from "react-native"
import { getInset } from "react-native-safe-area-view"
import { colors } from "../../library"
import { RoundButton } from "../round-button"

const { width: windowWidth } = Dimensions.get("window")

export const Container = props => (
  <View
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      width: windowWidth,
      padding: 10,
      paddingBottom: getInset("bottom") || 10,
      flexDirection: "row",
      justifyContent: "center",
      backgroundColor: chroma(colors.gray900)
        .alpha(0.62)
        .hex(),
    }}
    {...props}
  ></View>
)

const icons = {
  phone: require("../../assets/phone.png"),
  phoneOff: require("../../assets/phone-off.png"),
  microphone: require("../../assets/mic.png"),
  microphoneOff: require("../../assets/mic-off.png"),
  flipCamera: require("../../assets/camera-flip.png"),
}

export const StartCall = props => (
  <RoundButton color={colors.green} imageSource={icons.phone} {...props} />
)

export const EndCall = props => (
  <RoundButton color={colors.red} imageSource={icons.phoneOff} {...props} />
)

export const FlipCamera = props => (
  <RoundButton imageSource={icons.flipCamera} {...props} />
)

export const Mute = ({ muted, ...props }) => (
  <RoundButton
    color={muted ? "#FFF" : colors.gray600}
    tintColor={muted ? colors.gray600 : "#FFF"}
    imageSource={muted ? icons.microphone : icons.microphoneOff}
    {...props}
  />
)
