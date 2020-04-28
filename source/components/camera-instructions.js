import React from "react"
import { Image, ScrollView, View } from "react-native"
import Modal from "react-native-modal"
import { getInset } from "react-native-safe-area-view"
import { Body, Button, Title } from "../components"
import { colors, fonts, textStyles } from "../library"
import { Localization } from "../providers"

const HorizontalPadding = ({ children }) => (
  <View style={{ paddingLeft: 20, paddingRight: 20 }}>{children}</View>
)

export const CameraInstructions = ({
  isVisible,
  actionTitle,
  onActionPress,
}) => {
  const strings = React.useContext(Localization.Context).getStrings()
  const [modalWidth, setModalWidth] = React.useState()

  return (
    <Modal isVisible={isVisible}>
      <View
        style={{
          flex: 1,
          marginTop: getInset("top"),
          marginBottom: getInset("bottom"),
          overflow: "hidden",
        }}
      >
        <ScrollView
          style={{
            flex: 1,
            backgroundColor: "#FFF",
            borderTopLeftRadius: 13,
            borderTopRightRadius: 13,
          }}
          contentContainerStyle={{ paddingTop: 20 }}
        >
          <View
            onLayout={({
              nativeEvent: {
                layout: { width },
              },
            }) => setModalWidth(width)}
          >
            {modalWidth && (
              <>
                <HorizontalPadding>
                  <Title
                    style={{
                      marginBottom:
                        textStyles.body.lineHeight -
                        (textStyles.title.lineHeight -
                          textStyles.title.fontSize) /
                          2,
                    }}
                  >
                    {strings.cameraInstructions.title}
                  </Title>

                  <Body style={{ marginBottom: textStyles.body.lineHeight }}>
                    {strings.cameraInstructions.intro}
                  </Body>

                  <Body style={{ marginBottom: textStyles.body.lineHeight }}>
                    <Body style={{ fontFamily: fonts.openSans.bold }}>
                      {strings.cameraInstructions.cameraSwitchTitle}
                    </Body>{" "}
                    {strings.cameraInstructions.cameraSwitchIntro}
                  </Body>
                </HorizontalPadding>

                <Image
                  style={{
                    resizeMode: "cover",
                    width: modalWidth,
                    marginBottom: 20,
                  }}
                  source={require("../assets/take-picture-1.png")}
                />

                <HorizontalPadding>
                  <Body style={{ marginBottom: textStyles.body.lineHeight }}>
                    {strings.cameraInstructions.cameraSwitchAdditional}
                  </Body>
                </HorizontalPadding>

                <Image
                  style={{ resizeMode: "cover", width: modalWidth }}
                  source={require("../assets/take-picture-2.png")}
                />
              </>
            )}
          </View>
        </ScrollView>

        <View
          style={{
            padding: 20,
            backgroundColor: colors.gray50,
            borderBottomRightRadius: 13,
            borderBottomLeftRadius: 13,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 7,
            },
            shadowOpacity: 0.43,
            shadowRadius: 9.51,
            elevation: 15,
          }}
        >
          <Button
            primary
            title={actionTitle || strings.common.back}
            onPress={onActionPress}
          />
        </View>
      </View>
    </Modal>
  )
}
