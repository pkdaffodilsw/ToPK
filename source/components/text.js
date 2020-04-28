import React from "react"
import { StyleSheet, Text } from "react-native"
import { fonts, textStyles } from "../library"

const Base = ({ type, weight, style, color, ...props }) => (
  <Text
    style={[
      styles[type],
      color ? { color } : {},
      weight
        ? {
            fontFamily:
              type === "body" ? fonts.openSans[weight] : fonts.openSans.regular,
          }
        : {},
      ...(Array.isArray(style) ? style : [style]),
    ]}
    {...props}
  ></Text>
)

export const Title = props => <Base type="title" {...props}></Base>

export const Headline = props => <Base type="headline" {...props}></Base>

export const Body = props => (
  <Base type="body" weight="regular" {...props}></Base>
)

export const Caption = props => <Base type="caption" {...props}></Base>

const styles = StyleSheet.create(textStyles)
