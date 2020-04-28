import AsyncStorage from "@react-native-community/async-storage"
import React from "react"
import { Dimensions, Image, ScrollView, StyleSheet, View } from "react-native"
import { getInset } from "react-native-safe-area-view"
import { Body, Caption, Header, HeaderBackTitle, ListItem } from "../components"
import { DEBUG, DEVELOPMENT } from "../constants"
import { useDeviceInfo } from "../hooks"
import { colors, textStyles } from "../library"
import { HealthDeclaration, Localization, User, Visits } from "../providers"
import { bankIdStore } from "../resources"

const { width: windowWidth, height: windowHeight } = Dimensions.get("window")

export const Profile = ({ navigation }) => {
  const [contentInset, setContentInset] = React.useState()
  const strings = React.useContext(Localization.Context).getStrings()
  const healthDeclaration = React.useContext(HealthDeclaration.Context)
  const visits = React.useContext(Visits.Context)
  const user = React.useContext(User.Context)
  const [bankId, setBankId] = React.useState()

  React.useEffect(() => {
    bankIdStore.read().then(setBankId)
  }, [])

  const deviceInfo = useDeviceInfo(
    "applicationName",
    "bundleId",
    "version",
    "buildNumber",
  )

  return (
    <>
      <HeaderBackTitle>{strings.common.back}</HeaderBackTitle>

      <View style={styles.container}>
        <View style={styles.head}>
          <View
            style={styles.headerContainer}
            onLayout={({
              nativeEvent: {
                layout: { height },
              },
            }) => setContentInset(height)}
          >
            <Image
              style={{
                tintColor: colors.primary,
                resizeMode: "contain",
                height: textStyles.body.lineHeight,
                marginBottom: 3,
              }}
              source={require("../assets/user.png")}
            />

            <Header title={bankId && bankId.name} />

            <Body style={{ marginBottom: textStyles.headline.lineHeight / 2 }}>
              {bankId &&
                bankId.personalNumber &&
                bankId.personalNumber.replace(/\d{4}$/, m => `-${m}`)}
            </Body>

            <Body style={{ marginBottom: 3 }}>
              {user.data && user.data.email}
            </Body>

            <Body>{user.data && user.data.phoneNumber}</Body>
          </View>
        </View>

        <ScrollView
          style={[styles.scrollView]}
          contentContainerStyle={[
            styles.contentContainerStyle,
            {
              paddingTop: contentInset,
            },
          ]}
        >
          {contentInset && (
            <>
              <View style={styles.itemContainer}>
                <ListItem
                  title={strings.profile.menuItems.contactInformation}
                  icon={require("../assets/mail.png")}
                  onPress={() => navigation.navigate("ContactInformation")}
                />
                {(DEBUG || DEVELOPMENT) && (
                  <ListItem
                    title={strings.profile.menuItems.settings}
                    icon={require("../assets/settings.png")}
                    onPress={() => navigation.navigate("Settings")}
                  />
                )}
                <ListItem
                  title={strings.profile.menuItems.legal}
                  icon={require("../assets/file-text.png")}
                  onPress={() => navigation.navigate("Legal")}
                />
                <ListItem
                  title={strings.profile.menuItems.logOut}
                  icon={require("../assets/log-out.png")}
                  onPress={() => {
                    AsyncStorage.clear()
                      .then(() =>
                        AsyncStorage.setItem(
                          "notification_permissions_requested",
                          JSON.stringify(true),
                        ),
                      )
                      .then(() => {
                        visits.setInitial()
                        healthDeclaration.setInitial()
                        navigation.navigate("Initialize")
                      })
                  }}
                />
              </View>
              <View
                style={{
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 8,
                  paddingBottom: 8,
                  alignItems: "center",
                }}
              >
                <Caption
                  selectable
                  style={{ color: colors.gray400, textAlign: "center" }}
                >
                  {`${deviceInfo.applicationName} – ${deviceInfo.bundleId} – ${deviceInfo.version}.${deviceInfo.buildNumber}`}
                </Caption>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  head: {
    position: "absolute",
    width: windowWidth,
    height: windowHeight,
    backgroundColor: colors.gray50,
  },
  headerContainer: {
    paddingTop: Math.max(getInset("top"), 20) - 20 + 30,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 60,
  },
  scrollView: {
    flex: 1,
  },
  contentContainerStyle: {
    flexGrow: 1,
  },
  itemContainer: {
    backgroundColor: "#FFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray400,
    marginBottom: "auto",
  },
})
