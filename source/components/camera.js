import React from "react"
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native"
import { RNCamera } from "react-native-camera"
import { getInset, getStatusBarHeight } from "react-native-safe-area-view"
import { analytics, colors } from "../library"
import { Localization } from "../providers"
import { CameraInstructions } from "./camera-instructions"
import { RoundButton } from "./round-button"
import { Body } from "./text"

const images = {
  camera: require("../assets/camera.png"),
  cameraFlip: require("../assets/camera-flip.png"),
  flashModeOn: require("../assets/zap.png"),
  flashModeOff: require("../assets/zap-off.png"),
  close: require("../assets/x.png"),
  help: require("../assets/help-light.png"),
}

const defaultCameraOptions = {
  quality: 1,
  forceUpOrientation: true,
  fixOrientation: true,
}

export const Camera = ({
  onPicture,
  onError,
  onClose,
  cameraOptions = defaultCameraOptions,
}) => {
  const strings = React.useContext(Localization.Context).getStrings()
  const camera = React.useRef()
  const [cameraStatus, setCameraStatus] = React.useState()
  // const [cameraIds, setCameraIds] = React.useState([])
  // const [front, setFront] = React.useState()
  // const [back, setBack] = React.useState()
  const [type, setType] = React.useState(RNCamera.Constants.Type.front)
  const [flashMode, setFlashMode] = React.useState(
    RNCamera.Constants.FlashMode.off,
  )
  const [instructionsVisible, setInstructionsVisible] = React.useState(false)

  // React.useEffect(() => {
  //   if (cameraStatus === RNCamera.Constants.CameraStatus.READY) {
  //     camera.current && camera.current.getCameraIdsAsync().then(setCameraIds)
  //   }
  // }, [cameraStatus])

  // React.useEffect(() => {
  //   if (!type) {
  //     const front = cameraIds.find(
  //       ({ type }) => type === RNCamera.Constants.Type.front,
  //     )

  //     const back = cameraIds.find(
  //       ({ type }) => type === RNCamera.Constants.Type.back,
  //     )

  //     if (front) {
  //       setFront(front)
  //       setType(front.type)
  //     } else {
  //       back && setType(back.type)
  //     }

  //     back && setBack(back.type)
  //   }
  // }, [cameraIds, type])
  const [loading, setLoading] = React.useState(false)

  const takePicture = () => {
    setLoading(true)

    return camera.current
      .takePictureAsync(cameraOptions)
      .then(picture => {
        setLoading(false)

        const { width, height, pictureOrientation, deviceOrientation } = picture

        analytics.trackEvent("takePicture", {
          width,
          height,
          pictureOrientation,
          deviceOrientation,
        })

        onPicture && onPicture(picture)
      })
      .catch(error => {
        setLoading(false)
        onError && onError(error)
        analytics.trackEvent("cameraError", error)
      })
  }

  return (
    <View style={styles.container}>
      <CameraInstructions
        isVisible={instructionsVisible}
        onActionPress={() => setInstructionsVisible(false)}
        actionTitle={strings.common.back}
      />

      <RNCamera
        ref={ref => {
          camera.current = ref
        }}
        style={styles.preview}
        type={type}
        flashMode={flashMode}
        captureAudio={false}
        androidCameraPermissionOptions={
          strings.camera.androidCameraPermissionOptions
        }
        writeExif={false}
        onStatusChange={({ cameraStatus }) => setCameraStatus(cameraStatus)}
      />
      {cameraStatus !== RNCamera.Constants.CameraStatus.READY ? (
        <View style={styles.loadingContainer}>
          <Body>{strings.camera.loading}</Body>
        </View>
      ) : (
        <View style={styles.controls}>
          <View style={styles.topControls}>
            <TouchableOpacity onPress={() => setInstructionsVisible(true)}>
              <View
                style={{
                  height: 46,
                  paddingRight: 12,
                  paddingLeft: 12,
                  borderRadius: 23,
                  borderWidth: 2,
                  borderColor: colors.secondary,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image source={images.help} style={styles.close} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={event => onClose && onClose(event)}>
              <View style={styles.closeContainer}>
                <Image source={images.close} style={styles.close} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.captureButtonContainer}>
            <RoundButton
              imageSource={
                flashMode === RNCamera.Constants.FlashMode.off
                  ? images.flashModeOff
                  : images.flashModeOn
              }
              onPress={() =>
                setFlashMode(state =>
                  state === RNCamera.Constants.FlashMode.off
                    ? RNCamera.Constants.FlashMode.on
                    : RNCamera.Constants.FlashMode.off,
                )
              }
            />

            <View style={{ paddingLeft: 20, paddingRight: 20 }}>
              <RoundButton
                disabled={loading}
                loading={Platform.OS === "ios" && loading}
                size={78}
                color={colors.secondary}
                imageSource={images.camera}
                onPress={() => takePicture(camera)}
              />
            </View>

            {/* {front && back ? ( */}
            <RoundButton
              imageSource={images.cameraFlip}
              onPress={() =>
                setType(state =>
                  state === RNCamera.Constants.Type.front
                    ? RNCamera.Constants.Type.back
                    : RNCamera.Constants.Type.front,
                )
              }
            />
            {/* ) : (
              <View style={{ width: 62, height: 62 }} />
            )} */}
          </View>
        </View>
      )}
      {Platform.OS === "android" && loading && (
        <View
          style={{
            ...StyleSheet.absoluteFill,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      )}
    </View>
  )
}

Camera.defaultOptions = defaultCameraOptions

const closeButtonMargin =
  getStatusBarHeight() +
  (Math.max(getInset("right"), getInset("right")) || 30 - getStatusBarHeight())

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "black",
  },
  preview: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  controls: {
    ...StyleSheet.absoluteFill,
    justifyContent: "space-between",
  },
  topControls: {
    marginTop: closeButtonMargin,
    marginRight: closeButtonMargin,
    marginBottom: closeButtonMargin,
    marginLeft: closeButtonMargin,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    marginLeft: 20,
  },
  close: {
    tintColor: colors.secondary,
    width: 18,
    height: 18,
  },
  help: {},
  captureButtonContainer: {
    alignSelf: "center",
    marginBottom: getInset("bottom") || 30,
    flexDirection: "row",
    alignItems: "center",
  },
})
