import React from "react"
import { Image, TouchableOpacity, View } from "react-native"
import { colors } from "../library"

const star = require("../assets/star.png")
const starOutline = require("../assets/star-outline.png")

export const Rating = ({ stars = [], selected, onPress, style }) => {
  const selectedIndex = stars.indexOf(selected)

  return (
    <View style={[{ flexDirection: "row" }, style]}>
      {stars.map((value, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            onPress && onPress(value)
          }}
        >
          <Image
            style={{
              tintColor:
                index <= selectedIndex ? colors.yellow : colors.gray700,
              marginRight: index <= stars.length ? 8 : 0,
            }}
            source={index <= selectedIndex ? star : starOutline}
          />
        </TouchableOpacity>
      ))}
    </View>
  )
}
