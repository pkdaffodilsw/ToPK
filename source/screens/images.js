import * as ImageManipulator from "expo-image-manipulator"
import * as ImagePicker from "expo-image-picker"
import get from "lodash.get"
import React from "react"
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  LayoutAnimation,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native"
import { Permissions } from "react-native-unimodules"
import { createVisit, createVisitImage, health, payments } from "../api"
import {
  ActionableScrollView,
  Body,
  Button,
  CameraInstructions,
  HeaderBackTitle,
  HeaderTitle,
  SmallButton,
  Title,
} from "../components"
import {
  analytics,
  colors,
  textStyles /* facebookAppEvents */,
} from "../library"
import { Localization, Pictures, QuestionTree, Visits } from "../providers"

const useVisit = () => {
  const [data, setData] = React.useState()
  const [error, setError] = React.useState()
  const [loading, setLoading] = React.useState(false)

  const create = ({ questionTreeId, questionTreeAnswer, onBehalfOf }) => {
    setLoading(true)

    return createVisit({ questionTreeId, questionTreeAnswer, onBehalfOf })
      .then(data => {
        setData(data)
        setLoading(false)

        return data
      })
      .catch(error => {
        setError(error)
        setLoading(false)

        return Promise.reject(error)
      })
  }

  return {
    create,
    data,
    error,
    loading,
  }
}

const usePrice = () => {
  const [data, setData] = React.useState()
  const [error, setError] = React.useState()
  const [loading, setLoading] = React.useState(false)

  const read = ({ visitId }) => {
    setLoading(true)

    return payments
      .price({ visitId })
      .then(data => {
        setData(data)
        setLoading(false)

        return data
      })
      .catch(error => {
        setError(error)
        setLoading(false)
      })
  }

  return {
    read,
    data,
    error,
    loading,
  }
}

export const Images = ({ navigation }) => {
  const strings = React.useContext(Localization.Context).getStrings()

  const {
    state: { id: questionTreeId },
    answers: questionTreeAnswer,
  } = React.useContext(QuestionTree.Context)

  const pictures = React.useContext(Pictures.Context)
  const visits = React.useContext(Visits.Context)
  const visit = useVisit()
  const price = usePrice()
  const [editing, setEditing] = React.useState(false)
  const [instructionsVisible, setInstructionsVisible] = React.useState(false)
  const [takingPicture, setTakingPicture] = React.useState(false)

  const loading = Boolean(
    visits.state.refreshing ||
      visit.loading ||
      price.loading ||
      pictures.state.filter(({ loading }) => loading).length,
  )

  const splitTitle = (
    navigation.getParam("title") || strings.images.title
  ).split(" ")

  return (
    <>
      <HeaderBackTitle>{strings.common.back}</HeaderBackTitle>
      <HeaderTitle>
        {navigation.getParam("headerTitle") || strings.images.title}
      </HeaderTitle>

      <CameraInstructions
        isVisible={instructionsVisible}
        actionTitle={strings.common.back}
        onActionPress={() => setInstructionsVisible(false)}
      />

      <ActionableScrollView>
        <View>
          <View style={styles.headerContainer}>
            <View
              style={{
                flexDirection: "row",
                marginBottom: textStyles.body.lineHeight / 2,
                flexWrap: "wrap",
              }}
            >
              <Title style={{ flexWrap: "wrap" }}>
                {splitTitle.length > 1
                  ? splitTitle
                      .slice(0, -1)
                      .join(" ")
                      .concat(" ")
                  : null}
              </Title>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  flexGrow: 1,
                }}
              >
                <View style={{ marginRight: "auto" }}>
                  <Title>
                    {(navigation.getParam("title") || strings.images.title)
                      .split(" ")
                      .slice(-1)}
                  </Title>
                </View>
                <View
                  style={{
                    height: textStyles.title.lineHeight,
                    flexDirection: "row",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    paddingBottom: Math.floor(
                      ((textStyles.title.lineHeight -
                        textStyles.title.fontSize) /
                        2) *
                        1.618,
                    ),
                    paddingLeft: 20,
                  }}
                >
                  <View style={{ marginRight: 11 }}>
                    <SmallButton
                      disabled={loading}
                      title={strings.images.help}
                      image={require("../assets/help.png")}
                      onPress={() => setInstructionsVisible(true)}
                      hitSlop={{ top: 11, right: 0, bottom: 11, left: 11 }}
                    />
                  </View>
                  <SmallButton
                    disabled={!pictures.state.length || loading}
                    title={editing ? strings.common.abort : strings.images.edit}
                    image={require("../assets/edit.png")}
                    onPress={() => {
                      if (Platform.OS === "ios") {
                        LayoutAnimation.configureNext({
                          duration: 300,
                          create: {
                            property: LayoutAnimation.Properties.opacity,
                            type: LayoutAnimation.Types.easeIn,
                          },
                          delete: {
                            property: LayoutAnimation.Properties.opacity,
                            type: LayoutAnimation.Types.easeOut,
                          },
                        })
                      }

                      setEditing(state => !state)
                    }}
                    hitSlop={{ top: 11, right: 11, bottom: 11, left: 0 }}
                  />
                </View>
              </View>
            </View>

            <Body style={{ flex: 1, flexWrap: "wrap" }}>
              {navigation.getParam("description") || strings.images.description}
            </Body>
          </View>

          <View
            style={{
              marginTop: -10,
              paddingLeft: 10,
              paddingRight: 10,
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            {pictures.state.map(picture => {
              const { width: windowWidth } = Dimensions.get("window")
              const heightWidthRatio = picture.height / picture.width
              const third = Math.floor((Math.min(windowWidth, 500) - 80) / 3)

              const width =
                picture.height < picture.width ? 2 * third + 20 : third

              const height = width * heightWidthRatio

              return (
                <View
                  key={picture.uri}
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  <GridItem
                    loading={picture.loading}
                    tint={
                      picture.loading
                        ? colors.yellow
                        : picture.image
                        ? colors.green
                        : picture.error
                        ? colors.red
                        : null
                    }
                    imageSource={picture}
                    width={width}
                    height={height}
                  />
                  <View
                    style={{
                      position: "absolute",
                      width,
                      height,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {picture.image && (
                      <Image
                        source={require("../assets/check.png")}
                        style={{
                          width: 23,
                          height: 23,
                          tintColor: colors.gray50,
                          resizeMode: "contain",
                        }}
                      />
                    )}
                    {picture.error && !editing && (
                      <Image
                        source={require("../assets/x.png")}
                        style={{
                          width: 23,
                          height: 23,
                          tintColor: colors.gray50,
                          resizeMode: "contain",
                        }}
                      />
                    )}
                    {!picture.image && !picture.loading && editing && (
                      <View
                        style={{
                          top: -Math.floor((height - 24) / 2) + 6,
                          right: -Math.floor((width - 24) / 2) + 6,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            if (Platform.OS === "ios") {
                              LayoutAnimation.configureNext(
                                LayoutAnimation.Presets.easeInEaseOut,
                                () => {
                                  pictures.state.length === 1 &&
                                    setEditing(false)
                                },
                              )
                            } else {
                              pictures.state.length === 1 && setEditing(false)
                            }

                            pictures.remove(picture)
                          }}
                          hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                        >
                          <View
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 12,
                              backgroundColor: picture.error
                                ? colors.gray700
                                : colors.red,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <View
                              style={{
                                backgroundColor: colors.gray50,
                                width: 10,
                                height: 3,
                                borderRadius: 1,
                              }}
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              )
            })}
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            style={{ marginBottom: 20 }}
            disabled={loading || takingPicture}
            loading={takingPicture}
            primary
            title={strings.images.add}
            onPress={() =>
              Promise.resolve(
                Platform.OS === "ios"
                  ? Permissions.askAsync(
                      Permissions.CAMERA,
                      Permissions.CAMERA_ROLL,
                    )
                  : { status: "granted" },
              )
                .then(({ status }) =>
                  status === "granted"
                    ? Promise.resolve(setTakingPicture(true)).then(() =>
                        ImagePicker.launchCameraAsync({
                          mediaTypes: ImagePicker.MediaTypeOptions.Images,
                          exif: true,
                        }),
                      )
                    : Promise.reject({ status }),
                )
                .then(({ cancelled, ...picture }) => {
                  if (!cancelled) {
                    console.log(picture)

                    // EXIF orientation values
                    // There are 8 possible EXIF orientation values, numbered 1 to 8.

                    // 1 -> 0 degrees – the correct orientation, no adjustment is required.
                    // 2 -> 0 degrees, mirrored – image has been flipped back-to-front.
                    // 3 -> 180 degrees – image is upside down.
                    // 4 -> 180 degrees, mirrored – image is upside down and flipped back-to-front.
                    // 5 -> 90 degrees – image is on its side.
                    // 6 -> 90 degrees, mirrored – image is on its side and flipped back-to-front.
                    // 7 -> 270 degrees – image is on its far side.
                    // 8 -> 270 degrees, mirrored – image is on its far side and flipped back-to-front.

                    // https://sirv.com/help/resources/rotate-photos-to-be-upright/

                    switch (picture.exif.Orientation) {
                      case 2:
                        return ImageManipulator.manipulateAsync(picture.uri, [
                          {
                            flip: ImageManipulator.FlipType.Horizontal,
                          },
                        ])
                      case 4:
                        return ImageManipulator.manipulateAsync(picture.uri, [
                          {
                            flip: ImageManipulator.FlipType.Vertical,
                          },
                        ])
                      default:
                        // Why is this here?
                        // Calling manipulateAsync removes exif data and
                        // rotates the image with regard to exif.Orientation
                        return ImageManipulator.manipulateAsync(picture.uri, [])
                    }
                  } else {
                    return void 0
                  }
                })
                .then(picture => {
                  if (picture) {
                    console.log(picture)

                    pictures.add(picture)
                  }

                  setTakingPicture(false)
                })
                .catch(error => {
                  console.log(error)

                  analytics.trackEvent("cameraError", error)

                  setTakingPicture(false)

                  if (error.status && error.status !== "granted") {
                    Alert.alert(
                      strings.images.permissionsRequiredTitle,
                      strings.images.permissionsRequiredMessage,
                    )
                  }
                })
            }
          />
          <Button
            title={strings.common.next}
            disabled={loading}
            loading={loading}
            onPress={() => {
              const onBehalfOf = navigation.getParam("onBehalfOf")

              Promise.resolve(get(visit, "data.id"))
                .then(id =>
                  id
                    ? visit
                    : visit.create({
                        questionTreeId,
                        questionTreeAnswer,
                        onBehalfOf,
                      }),
                )
                .then(visit =>
                  Promise.all([
                    Promise.resolve(visit),
                    price.read({ visitId: visit.id }),
                    health.updateRequired({ visitId: visit.id }),
                    visits.read(),
                    ...pictures.state
                      .filter(picture => !picture.image)
                      .map(picture => {
                        const { resolve, reject } = pictures.upload(picture)

                        return createVisitImage({
                          picture,
                          visitId: visit.id,
                        })
                          .then(resolve)
                          .catch(reject)
                      }),
                  ]),
                )
                .then(([visit, pricing, healthDeclarationUpdateRequired]) => {
                  // pictures.state.length && facebookAppEvents.customizeProduct()

                  // facebookAppEvents.addedToCart(pricing.price, {
                  //   currency: pricing.currency,
                  // })

                  navigation.navigate({
                    routeName: healthDeclarationUpdateRequired
                      ? "IllnessesAilments"
                      : pricing.price > 0
                      ? "PaymentProviders"
                      : "ConfirmFreeVisit",
                    params: { pricing, visit, onBehalfOf },
                  })
                })
                .catch((...errors) => {
                  console.log(errors)
                  alert(strings.common.generalError)
                })
            }}
          />
        </View>
      </ActionableScrollView>
    </>
  )
}

const GridItem = ({
  imageSource,
  imageStyle,
  containerStyle,
  loading,
  tint,
  width,
  height,
}) => (
  <View
    style={[
      {
        width,
        height,
        backgroundColor: "transparent",
        margin: 10,
        justifyContent: "center",
        alignItems: "center",
      },
      containerStyle,
    ]}
  >
    <Image
      source={imageSource}
      style={[
        {
          width,
          height,
          resizeMode: "contain",
        },
        imageStyle,
      ]}
    ></Image>

    {tint && (
      <View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width,
          height,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: tint,
        }}
      >
        {loading && (
          <ActivityIndicator color={colors.gray50}></ActivityIndicator>
        )}
      </View>
    )}
  </View>
)

const styles = StyleSheet.create({
  buttonContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerContainer: {
    padding: 20,
  },
})
