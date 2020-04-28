import React from "react"
import { Image, Platform, StyleSheet, View } from "react-native"
import { colors } from "../library"

export const Splash = () => (
  <View
    style={{
      ...StyleSheet.absoluteFill,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.primary,
    }}
  >
    {Platform.OS === "ios" && (
      <Image
        source={require("../assets/toothie-text.png")}
        resizeMode="contain"
        style={{
          width: 160,
          height: 46,
          tintColor: colors.gray50,
        }}
      />
    )}
  </View>
)
