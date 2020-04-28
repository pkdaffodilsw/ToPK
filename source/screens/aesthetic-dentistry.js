import React from "react"
import {
  ActivityIndicator,
  Image,
  LayoutAnimation,
  Platform,
  StyleSheet,
  TouchableOpacity,
  UIManager,
  Vibration,
  View,
} from "react-native"
import { RNCamera } from "react-native-camera"
import {
  ActionableScrollView,
  Body,
  Button,
  CameraInstructions,
  HeaderBackTitle,
  HeaderTitle,
  Title,
} from "../components"
import { colors, textStyles, analytics } from "../library"
import { Localization, Pictures } from "../providers"

const placeholders = {
  front: require("../assets/teeth-front.png"),
  right: require("../assets/teeth-right.png"),
  left: require("../assets/teeth-left.png"),
  upper: require("../assets/teeth-upper.png"),
  lower: require("../assets/teeth-lower.png"),
}

if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
  }
}

const PhotoContainer = ({
  strings: { title, takePhoto, replacePhoto, androidCameraPermissionOptions },
  placeholder,
  valid,
  style,
  onPicture,
  hasCamera,
  setHasCamera,
  ...props
}) => {
  const [containerWidth, setContainerWidth] = React.useState(0)
  const [cameraEnabled, setCameraEnabled] = React.useState(false)
  const [cameraLoading, setCameraLoading] = React.useState(false)
  const cameraRef = React.useRef()

  React.useEffect(() => {
    !hasCamera && cameraEnabled && setCameraEnabled(false)
  }, [cameraEnabled, hasCamera])

  const onPress = () => {
    if (cameraEnabled) {
      Vibration.vibrate()
      setCameraLoading(true)

      const done = () => {
        LayoutAnimation.easeInEaseOut()
        setCameraEnabled(false)
      }

      cameraRef.current
        .takePictureAsync({ fixOrientation: true })
        .then(picture => {
          onPicture(picture)
          setCameraLoading(false)
          done()
        })
        .catch(error => {
          setCameraLoading(false)
          done()
          analytics.trackEvent("cameraError", error)
        })
    } else {
      setHasCamera()
      setTimeout(() => {
        Platform.OS === "ios" && LayoutAnimation.easeInEaseOut()
        setCameraEnabled(state => !state)
      }, 0)
    }
  }

  return (
    <View
      style={[
        {
          paddingLeft: 20,
          paddingRight: 20,
        },
        style,
      ]}
      onLayout={({
        nativeEvent: {
          layout: { width },
        },
      }) => !containerWidth && setContainerWidth(width - 40)}
      {...props}
    >
      {containerWidth > 0 && (
        <View
          style={{ borderRadius: 5, overflow: "hidden", position: "relative" }}
        >
          <Image
            style={{
              width: containerWidth,
              height: containerWidth,
            }}
            source={placeholder}
          />

          {cameraEnabled && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: containerWidth,
                height: containerWidth,
              }}
            >
              <RNCamera
                ref={cameraRef}
                style={{ flex: 1 }}
                type={RNCamera.Constants.Type.front}
                captureAudio={false}
                androidCameraPermissionOptions={androidCameraPermissionOptions}
                writeExif={false}
              />
            </View>
          )}

          <View
            style={{
              position: "absolute",
              top: cameraEnabled ? -66 : 0,
              left: 0,
              width: containerWidth,
              padding: 15,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                backgroundColor: colors.gray900,
                opacity: 0.62,
                width: containerWidth,
                height: 66,
              }}
            />

            <Body weight="bold" color={colors.gray50}>
              {title}
            </Body>

            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                width: 36,
                height: 36,
                borderRadius: 18,
                marginLeft: 20,
                ...(cameraLoading
                  ? {}
                  : valid
                  ? {
                      backgroundColor: colors.green,
                    }
                  : {
                      borderWidth: 2,
                      borderColor: colors.gray50,
                    }),
              }}
            >
              {cameraLoading ? (
                <ActivityIndicator
                  color={colors.gray50}
                  size={Platform.OS === "android" ? 22 : "small"}
                />
              ) : valid ? (
                <Image
                  style={{
                    width: 22,
                    height: 22,
                    resizeMode: "contain",
                    tintColor: colors.gray50,
                  }}
                  source={require("../assets/check-heavy.png")}
                />
              ) : null}
            </View>
          </View>

          <TouchableOpacity
            disabled={cameraLoading}
            style={{
              position: "absolute",
              bottom: 15,
              right: 15,
            }}
            onPress={onPress}
            hitSlop={
              cameraEnabled
                ? {
                    top: containerWidth - 15,
                    right: 15,
                    bottom: 15,
                    left: containerWidth - 15,
                  }
                : {}
            }
          >
            <View
              style={{
                backgroundColor: cameraEnabled
                  ? colors.gray900
                  : colors.primary,
                borderRadius: cameraEnabled ? 24 : 5,
                opacity: cameraEnabled ? 0.62 : 1,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
                flexDirection: "row",
                minHeight: 48,
                alignItems: "center",
                paddingLeft: 13,
                paddingRight: 13,
              }}
            >
              {!cameraEnabled && (
                <Body style={{ paddingRight: 15 }} color={colors.gray50}>
                  {valid ? replacePhoto : takePhoto}
                </Body>
              )}
              <Image
                style={{
                  width: textStyles.body.lineHeight,
                  height: textStyles.body.lineHeight,
                  resizeMode: "contain",
                  tintColor: colors.gray50,
                }}
                source={require("../assets/camera.png")}
              />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

export const AestheticDentistry = ({ navigation }) => {
  const strings = React.useContext(Localization.Context).getStrings()
  const pictures = React.useContext(Pictures.Context)
  const [instructionsVisible, setInstructionsVisible] = React.useState(false)
  const [hasCamera, setHasCamera] = React.useState()

  return (
    <>
      <HeaderBackTitle>{strings.common.back}</HeaderBackTitle>
      <HeaderTitle>{strings.aestheticDentistry.title}</HeaderTitle>

      <CameraInstructions
        isVisible={instructionsVisible}
        actionTitle={strings.common.back}
        onActionPress={() => setInstructionsVisible(false)}
      />

      <ActionableScrollView keyboardShouldPersistTaps="always">
        <View>
          <View style={styles.headerContainer}>
            <View
              style={{
                marginBottom: textStyles.body.lineHeight / 2,
              }}
            >
              <Title>{strings.aestheticDentistry.title}</Title>
            </View>
            <Body>{strings.aestheticDentistry.description}</Body>
          </View>
          <View style={{ flex: 1 }}>
            {["front", "right", "left", "upper", "lower"].map(type => {
              const currentPicture = pictures.state.find(
                ({ med_metadata: { type: _type } = {} }) => _type === type,
              )

              return (
                <PhotoContainer
                  key={type}
                  style={{ marginBottom: 20 }}
                  hasCamera={hasCamera === type}
                  setHasCamera={() => setHasCamera(type)}
                  strings={{
                    title: strings.aestheticDentistry[type],
                    takePhoto: strings.aestheticDentistry.takePhoto,
                    replacePhoto: strings.aestheticDentistry.retakePhoto,
                    androidCameraPermissionOptions:
                      strings.camera.androidCameraPermissionOptions,
                  }}
                  placeholder={currentPicture || placeholders[type]}
                  onPicture={picture => {
                    if (currentPicture) {
                      pictures.remove(currentPicture)
                    }

                    pictures.add(
                      Object.assign(picture, { med_metadata: { type } }),
                    )
                  }}
                  valid={currentPicture}
                />
              )
            })}
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            primary
            title={strings.common.next}
            onPress={() => {
              const onBehalfOf = navigation.getParam("onBehalfOf")

              navigation.navigate({
                routeName: "Images",
                params: {
                  onBehalfOf,
                  title: strings.aestheticDentistry.reviewPhotos,
                  description: strings.aestheticDentistry.reviewDescription,
                  headerTitle: strings.aestheticDentistry.reviewHeaderTitle,
                },
              })
            }}
          />
        </View>
      </ActionableScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
  },
  headerContainer: {
    padding: 20,
  },
})
