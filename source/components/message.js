import React from "react"
import { Image, StyleSheet, TouchableOpacity, View } from "react-native"
import { colors } from "../library"
import { Body } from "./text"

export const Message = ({ type, message, onPress, children }) => {
  const primaryColor =
    type === "primary"
      ? colors.primary
      : type === "secondary"
      ? colors.secondary
      : colors.gray700

  const backgroundColor =
    type === "primary"
      ? colors.primaryComplementary
      : type === "secondary"
      ? colors.secondaryComplementary
      : colors.gray200

  return (
    <TouchableOpacity disabled={!onPress} onPress={onPress}>
      <View
        style={{
          padding: 20,
          backgroundColor,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: primaryColor,
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <View style={{ flex: 1 }}>
          {typeof (message || children) === "string" ? (
            <Body>{message || children}</Body>
          ) : (
            message || children
          )}
        </View>

        {onPress && (
          <View style={{ paddingLeft: 30, justifyContent: "center" }}>
            <Image
              source={require("../assets/chevron-right.png")}
              style={{ tintColor: primaryColor }}
            ></Image>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}
