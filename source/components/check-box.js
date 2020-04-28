import React from "react"
import { Image, StyleSheet, TouchableOpacity, View } from "react-native"
import { colors } from "../library"
import { Body } from "./text"

export const CheckBox = ({
  onPress,
  onToggle,
  checked,
  disabled,
  title,
  style,
}) => {
  const [toggled, setToggled] = React.useState(checked)

  return (
    <TouchableOpacity
      onPress={event => {
        if (!disabled) {
          const nextToggleState = !toggled
          setToggled(nextToggleState)
          onToggle && onToggle({ toggled: nextToggleState })
          onPress && onPress(event)
        }
      }}
    >
      <View style={[styles.container, style]}>
        <View
          style={[
            styles.base,
            toggled ? styles.checked : styles.unchecked,
            disabled
              ? {
                  borderColor: colors.disabled,
                }
              : {
                  borderColor: colors.secondary,
                },
          ]}
        >
          {toggled && (
            <Image
              source={require("../assets/check-heavy.png")}
              style={styles.check}
            />
          )}
        </View>
        {typeof title === "string" ? (
          <Body style={styles.title}>{title}</Body>
        ) : (
          <View style={styles.title}>{title}</View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  base: {
    height: 30,
    width: 30,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  unchecked: {
    borderWidth: 2,
  },
  checked: {
    borderWidth: 2,
  },
  title: {
    marginLeft: 11,
  },
  check: {
    width: 18,
    height: 18,
    resizeMode: "contain",
    tintColor: colors.secondary,
  },
})
