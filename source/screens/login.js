import { addSeconds } from "date-fns"
import React from "react"
import {
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import SafeAreaView, { getInset } from "react-native-safe-area-view"
import { ViewPager } from "rn-viewpager"
import { readInfo } from "../api"
import { Body, Button, Content, Dots, TextInput } from "../components"
import { usePolling } from "../hooks"
import {
  colors,
  fonts,
  formatPersonalNumber,
  Linking,
  shuffle,
} from "../library"
import { Configuration, Localization } from "../providers"

const viewPagerData = [
  {
    background: require("../assets/toothie-situation-1.png"),
    body: "1",
  },
  {
    background: require("../assets/toothie-situation-2.png"),
    body: "2",
  },
  {
    background: require("../assets/toothie-situation-3.png"),
    body: "3",
  },
  {
    background: require("../assets/toothie-situation-4.png"),
    body: "4",
  },
  {
    background: require("../assets/toothie-situation-5.png"),
    body: "5",
  },
  {
    background: require("../assets/toothie-situation-6.png"),
    body: "6",
  },
  {
    background: require("../assets/toothie-situation-7.png"),
    body: "7",
  },
]

export const Login = ({ navigation }) => {
  const pages = React.useRef(shuffle(viewPagerData).slice(0, 3))
  const [currentPage, setCurrentPage] = React.useState(0)
  const [staticControlsHeight, setStaticControlsHeight] = React.useState(0)
  const [showModal, setShowModal] = React.useState(false)
  const [personalNumber, setPersonalNumber] = React.useState("")
  const [estimatedQueueTime, setEstimatedQueueTime] = React.useState()
  const [canOpenBankId, setCanOpenBankId] = React.useState(null)
  const localization = React.useContext(Localization.Context)
  const configuration = React.useContext(Configuration.Context)

  const strings = localization.getStrings(
    estimatedQueueTime
      ? {
          login: {
            waitTime: {
              estimate: localization.formatDistanceToNow(
                addSeconds(new Date(Date.now()), estimatedQueueTime),
              ),
            },
          },
        }
      : {},
  )

  usePolling(poll => {
    readInfo().then(({ estimatedQueueTime }) => {
      setEstimatedQueueTime(estimatedQueueTime)
      poll()
    })
  }, 30000)

  React.useEffect(() => {
    if (canOpenBankId === null) {
      Linking.canOpenURL("bankid://")
        .then(canOpen => setCanOpenBankId(canOpen))
        .catch(() => setCanOpenBankId(true))
    }
  }, [canOpenBankId])

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />

      <View style={styles.container}>
        <Modal
          visible={showModal}
          animationType="slide"
          style={{ backgroundColor: colors.gray50 }}
          onRequestClose={() => {
            setShowModal(false)
          }}
        >
          <Content
            style={{
              flex: 1,
              paddingBottom: Math.max(getInset("bottom"), 20) - 20 + 20,
            }}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : null}
              style={styles.container}
              contentContainerStyle={styles.container}
            >
              <View style={styles.innerContainer}>
                <View style={styles.textInputContainer}>
                  <TextInput
                    placeholder={strings.common.personalNumber}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="number-pad"
                    value={personalNumber}
                    onChangeText={text =>
                      setPersonalNumber(formatPersonalNumber(text))
                    }
                    style={styles.textInput}
                    textAlign="center"
                    maxLength={13}
                  />
                </View>
                <View style={styles.buttonContainer}>
                  <Button
                    style={{ marginBottom: 10 }}
                    disabled={personalNumber.length < 10}
                    primary
                    title={strings.login.bankId.startLogin}
                    onPress={() =>
                      navigation.navigate("Authenticate", {
                        personalNumber,
                      })
                    }
                  />
                  <Button
                    basic
                    title={strings.common.back}
                    onPress={() => {
                      setPersonalNumber("")
                      setShowModal(false)
                    }}
                  />
                </View>
              </View>
            </KeyboardAvoidingView>
          </Content>
        </Modal>

        <ViewPager
          style={styles.viewPager}
          initialPage={currentPage}
          onPageSelected={({ position }) => setCurrentPage(position)}
        >
          {pages.current.map((page, index) => (
            <View key={index}>
              <ImageBackground style={styles.image} source={page.background} />
              <View
                style={[
                  styles.pageContent,
                  {
                    paddingBottom:
                      staticControlsHeight + (getInset("bottom") ? 45 : 20),
                  },
                ]}
              >
                <View style={{ alignItems: "center" }}>
                  <Body
                    style={{
                      textAlign: "center",
                      maxWidth: 600,
                    }}
                    color={colors.gray50}
                  >
                    {localization.messages.login.viewPager[page.body].body()}
                  </Body>
                </View>
              </View>
            </View>
          ))}
        </ViewPager>

        <SafeAreaView style={styles.controlsContainer}>
          <View style={styles.logoContainer}>
            <Image source={require("../assets/toothie-logo.png")} />
          </View>

          {canOpenBankId !== null && (
            <View
              style={styles.controls}
              onLayout={({
                nativeEvent: {
                  layout: { height },
                },
              }) => setStaticControlsHeight(height)}
            >
              <Dots
                count={pages.current.length}
                activeIndex={currentPage}
                style={styles.dots}
              />

              <Content style={{ paddingLeft: 20, paddingRight: 20 }}>
                <TouchableOpacity
                  onPress={() =>
                    canOpenBankId
                      ? navigation.navigate("Authenticate")
                      : setShowModal(true)
                  }
                  style={{ marginBottom: 20 }}
                >
                  <View
                    style={{
                      backgroundColor: colors.gray50,
                      flexDirection: "row",
                      paddingTop: 10,
                      paddingBottom: 10,
                      paddingLeft: 18,
                      paddingRight: 28,
                      alignItems: "center",
                      borderRadius: 8,
                      shadowColor: "#000",
                      shadowOffset: {
                        width: 0,
                        height: 2,
                      },
                      shadowOpacity: 0.2,
                      shadowRadius: 1.41,
                      elevation: 2,
                    }}
                  >
                    <Body
                      style={{
                        paddingRight: 20,
                        fontFamily: fonts.openSans.semiBold,
                      }}
                    >
                      {strings.login.bankId.login}
                    </Body>
                    <Image
                      style={{ marginLeft: "auto" }}
                      source={require("../assets/bankid.png")}
                    />
                  </View>
                </TouchableOpacity>

                {canOpenBankId === true && (
                  <TouchableOpacity
                    onPress={() => setShowModal(true)}
                    style={{ marginBottom: 20 }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        paddingTop: 8,
                        paddingBottom: 8,
                        paddingLeft: 18,
                        paddingRight: 28,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 8,
                        borderColor: colors.gray50,
                      }}
                    >
                      <Body
                        style={{
                          fontFamily: fonts.openSans.semiBold,
                          color: colors.gray50,
                          textAlign: "center",
                        }}
                      >
                        {strings.login.bankId.loginOther}
                      </Body>
                    </View>
                  </TouchableOpacity>
                )}
              </Content>

              <Body color={colors.gray50} style={styles.waitTimeText}>
                {configuration.booking.isAvailable && estimatedQueueTime
                  ? strings.login.waitTime
                  : " "}
              </Body>
            </View>
          )}
        </SafeAreaView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewPager: {
    flex: 1,
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    width: Dimensions.get("window").width,
  },
  controlsContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "flex-end",
  },
  controls: {},
  dots: {
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: 18,
  },
  buttonContainer: {
    marginTop: "auto",
    // alignItems: "center",
    paddingLeft: 20,
    paddingRight: 20,
  },
  button: {
    marginBottom: 16,
  },
  waitTimeText: {
    marginBottom: getInset("bottom") ? 0 : 20,
    marginLeft: "auto",
    marginRight: "auto",
  },
  pageContent: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "flex-end",
    marginLeft: 26,
    marginRight: 26,
  },
  headline: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 12,
    fontFamily: "KoHo-Regular",
  },
  logoContainer: {
    marginTop: 20 - Math.min(getInset("top"), 20) + 5,
    marginBottom: "auto",
    marginLeft: 20,
  },
  textInputContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: 250,
    marginLeft: "auto",
    marginRight: "auto",
  },
  textInput: {
    marginBottom: 30,
  },
  innerContainer: {
    flex: 1,
    alignItems: "stretch",
  },
})
