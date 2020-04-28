import React from "react"
import { StyleSheet, View } from "react-native"
import { colors } from "../library"

export const Dot = ({ active, style = {}, ...props }) => (
  <View
    style={[
      styles.dot,
      { backgroundColor: active ? colors.secondary : colors.gray700 },
      style,
    ]}
    {...props}
  />
)

export const Dots = ({ count = 0, activeIndex = 0, style = {}, ...props }) => (
  <View style={[styles.dots, style]} {...props}>
    {Array(count)
      .fill(null)
      .map((_, index) => (
        <Dot
          key={index}
          active={index === activeIndex}
          style={{
            ...(index === 0 ? { marginLeft: 0 } : {}),
            ...(index === count - 1 ? { marginRight: 0 } : {}),
          }}
        />
      ))}
  </View>
)

const styles = StyleSheet.create({
  dot: {
    width: 9.4,
    height: 9.4,
    borderRadius: 4.7,
    marginLeft: 6,
    marginRight: 6,
  },
  dots: {
    flexDirection: "row",
  },
})
