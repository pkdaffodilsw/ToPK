import React from "react"
import { Image, Platform, ScrollView, StyleSheet, View } from "react-native"
import { getInset } from "react-native-safe-area-view"
import { Body, Button, Caption, Headline } from "../components"
import { colors, fonts, Linking } from "../library"
import { Localization } from "../providers"

export const Upgrade = ({ navigation }) => {
  const strings = React.useContext(Localization.Context).getStrings()

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.gray50,
      }}
    >
      <ScrollView
        style={{
          flex: 1,
        }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "space-between",
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: getInset("top") + 40,
        }}
        alwaysBounceVertical={false}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Image
            style={styles.logo}
            source={require("../assets/toothie-text.png")}
          ></Image>
          <Headline style={[styles.text, { fontFamily: fonts.openSans.bold }]}>
            {strings.upgrade.title}
          </Headline>
          <Body style={styles.text}>{strings.upgrade.explanation}</Body>
          <Caption style={{ fontFamily: fonts.openSans.bold }}>
            {strings.upgrade.currentVersion}
          </Caption>
          <Caption style={styles.text}>
            {navigation.getParam("installedVersion")}
          </Caption>
          <Caption style={{ fontFamily: fonts.openSans.bold }}>
            {strings.upgrade.minimumVersion}
          </Caption>
          <Caption style={styles.text}>
            {navigation.getParam("configuration").minUsableVersion}
          </Caption>
        </View>
        <View
          style={{
            paddingTop: 30,
            alignItems: "stretch",
            paddingBottom: Math.max(getInset("bottom"), 20),
          }}
        >
          <Button
            primary
            title={`${strings.upgrade.open} ${Platform.select({
              android: strings.common.androidStore,
              ios: strings.common.iosStore,
            })}`}
            onPress={() => {
              Linking.openURL(
                Platform.select({
                  android: "market://",
                  ios: "itms-apps://",
                }),
              )
            }}
          ></Button>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  logo: { marginBottom: 30, tintColor: colors.primary },
  text: {
    marginBottom: 20,
    textAlign: "center",
  },
})
