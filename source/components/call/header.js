import chroma from "chroma-js"
import React from "react"
import { Dimensions, View } from "react-native"
import { getInset } from "react-native-safe-area-view"
import { colors, fonts, textStyles } from "../../library"
import { Body, Caption } from "../text"

const { width: windowWidth } = Dimensions.get("window")

export const Header = ({ localViewWidth = 0, name, title }) => (
  <View
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      maxWidth: windowWidth - localViewWidth - 30,
      marginTop: Math.max(getInset("top"), 20) - 20 + 10,
      paddingTop:
        10 -
        Math.floor((textStyles.body.lineHeight - textStyles.body.fontSize) / 2),
      paddingLeft: 15,
      paddingBottom: 10,
      backgroundColor: chroma(colors.primary)
        .alpha(0.8)
        .hex(),
      borderTopRightRadius: 5,
      borderBottomRightRadius: 5,
    }}
  >
    <View
      style={{
        flexDirection: "column",
        paddingRight: 20,
      }}
    >
      <Body style={{ color: "#FFFFFF", fontFamily: fonts.openSans.bold }}>
        {name}
      </Body>
      <Caption style={{ color: "#FFFFFF" }}>{title}</Caption>
    </View>
  </View>
)
