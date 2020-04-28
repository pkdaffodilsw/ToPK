// Inspired by:
// https://github.com/react-navigation/stack/blob/master/src/views/Header/HeaderBackButton.tsx
import React from "react"
import {
  Platform,
  TouchableOpacity,
  View,
  StyleSheet,
  I18nManager,
  Text,
} from "react-native"

export const HeaderButton = ({
  title = "",
  titleStyle,
  accessibilityLabel = title,
  onPress,
  disabled,
  allowFontScaling,
  pressColorAndroid = "rgba(0, 0, 0, .32)",
  tintColor = Platform.select({
    ios: "#037aff",
    web: "#5f6368",
  }),
}) => {
  const button = (
    <TouchableOpacity
      disabled={disabled}
      accessible
      accessibilityRole="button"
      accessibilityComponentType="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityTraits="button"
      testID="header-back"
      delayPressIn={0}
      onPress={disabled ? undefined : onPress}
      pressColor={pressColorAndroid}
      style={[styles.container, disabled && styles.disabled]}
      borderless
    >
      <View style={styles.container}>
        <Text
          accessible={false}
          style={[
            styles.title,
            !!tintColor && { color: tintColor },
            titleStyle,
          ]}
          numberOfLines={1}
          allowFontScaling={!!allowFontScaling}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return Platform.OS === "ios" ? (
    button
  ) : (
    <View style={styles.androidButtonWrapper}>{button}</View>
  )
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
  androidButtonWrapper: {
    margin: 13,
    backgroundColor: "transparent",
    ...Platform.select({
      web: {
        marginLeft: 21,
      },
      default: {},
    }),
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 17,
    paddingRight: 10,
  },
  icon: Platform.select({
    ios: {
      backgroundColor: "transparent",
      height: 21,
      width: 13,
      marginLeft: 9,
      marginRight: 22,
      marginVertical: 12,
      resizeMode: "contain",
      transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
    },
    default: {
      height: 24,
      width: 24,
      margin: 3,
      resizeMode: "contain",
      backgroundColor: "transparent",
      transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
    },
  }),
  iconWithTitle:
    Platform.OS === "ios"
      ? {
          marginRight: 6,
        }
      : {},
})
