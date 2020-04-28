import React from "react"
import {
  Platform,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from "react-native"
import { colors, textStyles } from "../library"

export const TextInput = ({ style, disabled, inputStyles, ...props }) => (
  <View
    style={[
      styles.container,
      { borderBottomColor: disabled ? colors.disabled : colors.secondary },
      style,
    ]}
  >
    <RNTextInput
      style={[styles.textInput, inputStyles]}
      editable={!disabled}
      underlineColorAndroid={colors.secondary}
      {...props}
    />
  </View>
)

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    borderBottomWidth: Platform.OS === "ios" ? 2 : 0,
  },
  textInput: {
    minHeight: 31,
    ...textStyles.body,
    ...(Platform.OS === "ios" ? { paddingBottom: 2 } : { marginLeft: -3 }),
    alignSelf: "stretch",
  },
})
