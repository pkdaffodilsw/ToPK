import React from "react"
import { Dimensions, StyleSheet, View } from "react-native"

const { width: windowWidth } = Dimensions.get("window")

const styles = StyleSheet.create({
  content: {
    maxWidth: windowWidth > 500 ? 500 : undefined,
    minWidth: windowWidth > 500 ? 500 : windowWidth,
    marginLeft: "auto",
    marginRight: "auto",
  },
})

export const Content = ({ style, ...props }) => (
  <View style={[styles.content, style]} {...props}></View>
)

Content.styles = styles
