import get from "lodash.get"
import React from "react"
import { Dimensions, Image, ScrollView, StyleSheet, View } from "react-native"
import SafeAreaView, { getInset } from "react-native-safe-area-view"
import { Body, Caption, HeaderBackTitle, ListItem, Title } from "../components"
import { DEBUG, DEVELOPMENT } from "../constants"
import { usePolling } from "../hooks"
import { colors, fonts } from "../library"
import {
  Configuration,
  Localization,
  Pictures,
  QuestionTree,
} from "../providers"
import { bankIdStore } from "../resources"

const imageHeight = 263 + getInset("top")

export const Main = ({ navigation }) => {
  const configuration = React.useContext(Configuration.Context)
  const localization = React.useContext(Localization.Context)
  const questionTree = React.useContext(QuestionTree.Context)
  const pictures = React.useContext(Pictures.Context)
  const [bankId, setBankId] = React.useState()

  React.useEffect(() => {
    bankIdStore.read().then(setBankId)
  }, [])

  const { common, start: strings } = localization.getStrings({
    start: {
      greeting: {
        name: bankId && bankId.givenName,
      },
      closing: {
        closeTime: configuration.booking.closeTime,
      },
      closed: {
        nextOpenTime: localization.format(
          configuration.booking.nextOpen,
          "PPp",
        ),
      },
    },
  })

  React.useEffect(() => {
    if (
      !questionTree.state.tree &&
      !questionTree.state.loading &&
      !questionTree.state.error
    ) {
      questionTree.fetch()
    }
  }, [questionTree])

  usePolling(poll => {
    configuration.read().then(() => poll())
  }, 60000)

  return (
    <>
      <HeaderBackTitle>{common.back}</HeaderBackTitle>

      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} alwaysBounceVertical={false}>
          <View style={styles.head}>
            <View style={styles.image}>
              <Image
                style={{
                  height: Math.floor(imageHeight * 0.9),
                  width: Math.floor(imageHeight * 0.9),
                }}
                source={require("../assets/toothie-hero.png")}
              />
            </View>
            <View style={styles.hello}>
              <Body
                style={{
                  color: colors.primary,
                  fontFamily: fonts.openSans.bold,
                }}
              >
                {strings.greeting}
              </Body>

              <Title style={{ paddingRight: 80 }}>{strings.title}</Title>
            </View>
          </View>
          <SafeAreaView style={styles.body} forceInset={{ top: "never" }}>
            <ListItem
              loading={questionTree.state.loading}
              disabled={
                !questionTree.state.tree || !configuration.booking.isAvailable
              }
              onPress={() => {
                pictures.clear()

                navigation.navigate({
                  routeName: "QuestionTree",
                  key: JSON.stringify([]),
                  params: {
                    schemaPath: "",
                  },
                })
              }}
            >
              <View>
                <Body style={{ fontFamily: fonts.openSans.semiBold }}>
                  {get(strings, "menuItems.me")}
                </Body>
                {configuration.booking.closingSoon ? (
                  <Caption color={colors.red}>{strings.closing}</Caption>
                ) : !configuration.booking.isAvailable ? (
                  <Caption color={colors.red}>{strings.closed}</Caption>
                ) : null}
              </View>
            </ListItem>

            <ListItem
              loading={questionTree.state.loading}
              disabled={
                !questionTree.state.tree || !configuration.booking.isAvailable
              }
              onPress={() => {
                pictures.clear()

                navigation.navigate("OnBehalfOf")
              }}
            >
              <View>
                <Body style={{ fontFamily: fonts.openSans.semiBold }}>
                  {get(strings, "menuItems.child")}
                </Body>
                {configuration.booking.closingSoon ? (
                  <Caption color={colors.red}>{strings.closing}</Caption>
                ) : !configuration.booking.isAvailable ? (
                  <Caption color={colors.red}>{strings.closed}</Caption>
                ) : null}
              </View>
            </ListItem>

            {(DEBUG || DEVELOPMENT) && (
              <ListItem
                title={get(strings, "menuItems.faq")}
                icon={require("../assets/help.png")}
                onPress={() => navigation.navigate("FAQ")}
              />
            )}

            {(DEBUG || DEVELOPMENT) && (
              <ListItem
                title={get(strings, "menuItems.guide")}
                icon={require("../assets/info.png")}
                onPress={() => navigation.navigate("Guide")}
              />
            )}
          </SafeAreaView>
        </ScrollView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  head: {
    position: "absolute",
    flex: 1,
    backgroundColor: colors.gray200,
    height: imageHeight,
    width: Dimensions.get("window").width,
  },
  image: {
    height: imageHeight,
    width: Dimensions.get("window").width,
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden",
    alignItems: "flex-end",
    backgroundColor: "#CD8E9F",
    justifyContent: "flex-end",
  },
  logo: { marginTop: 20, marginLeft: 26, tintColor: colors.primary },
  hello: {
    flex: 1,
    paddingTop: Math.max(getInset("top"), 20) - 20 + 30,
    paddingLeft: 20,
    paddingRight: 48,
  },
  body: {
    flex: 1,
    marginTop: imageHeight,
  },
  text: {
    fontSize: 17,
    lineHeight: 22,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
