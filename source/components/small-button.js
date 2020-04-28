import React from "react"
import { Image, TouchableOpacity, View } from "react-native"
import { Caption } from "../components"
import { colors, textStyles } from "../library"

export const SmallButton = ({ title, onPress, image, disabled, ...props }) => {
  const verticalPadding =
    (textStyles.body.lineHeight -
      textStyles.caption.lineHeight -
      ((textStyles.body.lineHeight - textStyles.caption.lineHeight) % 2)) /
    2

  const horizontalPadding = Math.floor(verticalPadding * Math.pow(1.618, 3))

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} {...props}>
      <View
        style={{
          paddingTop: verticalPadding,
          paddingBottom: verticalPadding,
          paddingLeft: image
            ? Math.floor(horizontalPadding / Math.pow(1.618, 1))
            : horizontalPadding,
          paddingRight: image
            ? Math.floor(verticalPadding * Math.pow(1.618, 2.5))
            : horizontalPadding,
          backgroundColor: colors.secondaryComplementary,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          borderRadius: 3,
          opacity: disabled ? 0.62 : 1,
        }}
      >
        {image && (
          <Image
            source={image}
            style={{
              resizeMode: "contain",
              height: textStyles.caption.fontSize,
              width: textStyles.caption.fontSize,
              tintColor: colors.secondary,
              marginRight: Math.floor(verticalPadding * 1.618),
            }}
          />
        )}
        <Caption style={{ color: colors.gray900 }}>{title}</Caption>
      </View>
    </TouchableOpacity>
  )
}
