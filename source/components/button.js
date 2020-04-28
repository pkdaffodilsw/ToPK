import chroma from "chroma-js"
import React from "react"
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { colors, textStyles, fonts } from "../library"

export const Button = ({
  title,
  image,
  onPress,
  primary,
  disabled,
  style,
  basic,
  loading,
  children,
  color,
  backgroundColor = colors.secondary,
  ...props
}) => (
  <TouchableOpacity onPress={onPress} disabled={disabled} {...props}>
    <View
      style={[
        styles.container,
        primary
          ? {
              backgroundColor,
              borderWidth: Platform.OS === "ios" ? 1 : 0,
              borderColor: chroma(backgroundColor).desaturate(0.5),
              shadowColor: chroma
                .mix(colors.gray900, backgroundColor, 0.2)
                .hex(),
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.23,
              shadowRadius: 2.2,
              // elevation: 1,
            }
          : basic
          ? {
              backgroundColor: "transparent",
              borderWidth: 0,
            }
          : {
              backgroundColor: "transparent",
              borderWidth: 1,
              borderColor: colors.gray900,
            },
        disabled && !loading
          ? {
              backgroundColor: primary
                ? chroma(backgroundColor)
                    .desaturate(1)
                    .luminance(0.5)
                    .hex()
                : "transparent",
              borderColor: chroma(primary ? backgroundColor : colors.gray900)
                .desaturate(1)
                .luminance(0.5)
                .hex(),
            }
          : {},
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={primary ? colors.gray50 : color || colors.gray900}
        ></ActivityIndicator>
      ) : title ? (
        <Text
          style={[
            styles.title,
            primary
              ? { color: color || colors.gray50 }
              : basic
              ? { color: color || colors.gray700 }
              : { color: color || colors.gray900 },
            disabled
              ? {
                  color: primary
                    ? colors.gray200
                    : chroma(colors.gray900)
                        .desaturate(2)
                        .luminance(0.5)
                        .hex(),
                }
              : {},
            image ? { textAlign: "left" } : {},
          ]}
        >
          {title}
        </Text>
      ) : (
        children
      )}
      {image && (
        <Image
          source={image}
          style={[
            styles.image,
            primary ? { tintColor: colors.gray50 } : { tintColor: color },
            disabled
              ? {
                  tintColor: primary ? colors.gray50 : colors.disabled,
                }
              : {},
          ]}
        />
      )}
    </View>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  container: {
    borderRadius: 5,
    borderColor: colors.secondary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 11,
    paddingBottom: 11,
    paddingLeft: 19,
    paddingRight: 19,
    minHeight: 48,
  },
  title: {
    ...textStyles.body,
    fontFamily: fonts.openSans.semiBold,
    textAlign: "center",
  },
  image: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    marginLeft: 14,
    marginTop: -3,
    marginBottom: -3,
  },
})
