import chroma from "chroma-js"
import React from "react"
import {
  Image,
  StyleSheet,
  TouchableHighlight,
  View,
  ActivityIndicator,
  Platform,
} from "react-native"
import { colors } from "../library"

export const RoundButton = ({
  color = colors.gray600,
  tintColor = "#FFF",
  onPress,
  imageSource,
  size,
  style,
  disabled,
  loading,
}) => {
  const imageSize = size && Math.floor(size / 2 / 1.618)
  const containerSize = size && size - (size % 2)
  const containerRadius = size && (size - (size % 2)) / 2

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: disabled
            ? chroma(color)
                .desaturate()
                .alpha(0.8)
                .hex()
            : chroma(color)
                .alpha(0.8)
                .hex(),
        },
        size
          ? {
              width: containerSize,
              height: containerSize,
              borderRadius: containerRadius,
            }
          : {},
        style,
      ]}
    >
      <TouchableHighlight
        disabled={disabled}
        onPress={onPress}
        style={styles.touchable}
        underlayColor={chroma(color)
          .brighten()
          .hex()}
      >
        <View style={styles.imageContainer}>
          <Image
            source={imageSource}
            style={[
              styles.image,
              {
                tintColor,
                ...(size ? { width: imageSize, height: imageSize } : {}),
                ...(loading ? { opacity: 0 } : { opacity: 1 }),
              },
            ]}
          />
          {loading && (
            <View
              style={{
                ...StyleSheet.absoluteFill,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator
                color={tintColor}
                size={Platform.OS === "android" ? imageSize : "small"}
              />
            </View>
          )}
        </View>
      </TouchableHighlight>
    </View>
  )
}

const styles = StyleSheet.create({
  image: {
    resizeMode: "contain",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  touchable: {
    flex: 1,
  },
  container: {
    width: 62,
    height: 62,
    borderRadius: 31,
    overflow: "hidden",
  },
})
