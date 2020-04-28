import React from "react"
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  // TouchableOpacity,
  View,
} from "react-native"
import { colors, textStyles } from "../library"
import { Body } from "./text"
import { TouchableOpacity } from "./touchable-debounce"

export const ListItem = ({
  icon,
  image,
  title,
  onPress,
  style,
  hideArrow,
  loading,
  disabled,
  multiline,
  children,
  ...props
}) => (
  <View
    style={[styles.container, ...[disabled ? { opacity: 0.6 } : {}]]}
    {...props}
  >
    <TouchableOpacity
      style={styles.touchable}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.content}>
        {icon && <Image source={icon} style={styles.icon} />}
        {image && <Image source={image} style={styles.image} />}
        {title ? (
          <Body
            color={colors.gray900}
            style={[styles.text, style]}
            {...(multiline
              ? {}
              : {
                  ellipsizeMode: "tail",
                  numberOfLines: 1,
                })}
          >
            {title}
          </Body>
        ) : (
          <View style={{ flex: 1 }}>{children}</View>
        )}
      </View>
      {!hideArrow && !loading && (
        <Image
          source={require("../assets/chevron-right.png")}
          style={styles.chevron}
        />
      )}
      {loading && (
        <ActivityIndicator style={styles.chevron} color={colors.secondary} />
      )}
    </TouchableOpacity>
  </View>
)

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray400,
  },
  touchable: {
    minHeight: textStyles.body.lineHeight * 3,
    paddingLeft: 20,
    paddingRight: 20,
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 66,
    paddingTop: Math.round(textStyles.body.lineHeight / 1.618),
    paddingBottom: Math.round(textStyles.body.lineHeight / 1.618),
  },
  icon: {
    height: textStyles.body.lineHeight,
    width: textStyles.body.lineHeight,
    resizeMode: "contain",
    tintColor: colors.primary,
    marginRight: 10,
  },
  image: {
    height: textStyles.body.lineHeight,
    width: textStyles.body.lineHeight,
    marginRight: 10,
    resizeMode: "contain",
    backgroundColor: colors.gray700,
  },
  chevron: {
    tintColor: colors.secondary,
    marginLeft: 15,
    resizeMode: "contain",
    height: textStyles.body.lineHeight,
  },
  text: {
    flex: 1,
    flexWrap: "wrap",
  },
})
