import AsyncStorage from "@react-native-community/async-storage"
import { Formik } from "formik"
import React from "react"
import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  LayoutAnimation,
  Platform,
  StyleSheet,
  View,
} from "react-native"
import { getInset } from "react-native-safe-area-view"
import * as Yup from "yup"
import {
  ActionView,
  Body,
  Button,
  Caption,
  Content,
  HeaderTitle,
  Legal,
  TextInput,
} from "../components"
import { keyboardVerticalOffsetWithTabBar } from "../constants"
import { useKeyboard } from "../hooks"
import { colors, formatPhoneNumber } from "../library"
import {
  Localization,
  Notifications as _Notifications,
  User,
} from "../providers"

const useKeyboardAndInsetAwareBottomDistance = () => {
  const [distance, setDistance] = React.useState(getInset("bottom") || 20)

  const { visible: keyboardVisible } = useKeyboard()

  React.useEffect(() => {
    if (keyboardVisible) {
      if (Platform.OS === "ios") {
        LayoutAnimation.easeInEaseOut()
      }

      setDistance(20)
    } else {
      if (Platform.OS === "ios") {
        LayoutAnimation.easeInEaseOut()
      }

      setDistance(getInset("bottom") || 20)
    }
  }, [keyboardVisible])

  return distance
}

export const Registration = ({ navigation }) => {
  const localization = React.useContext(Localization.Context)
  const strings = localization.getStrings()

  const buttonPadding = useKeyboardAndInsetAwareBottomDistance()

  return (
    <>
      <HeaderTitle>{strings.register.title}</HeaderTitle>

      <ActionView
        keyboardAvoidingViewProps={{
          keyboardVerticalOffset: keyboardVerticalOffsetWithTabBar,
        }}
      >
        <Formik
          initialValues={{ email: "", phoneNumber: "" }}
          validationSchema={() =>
            Yup.object({
              email: Yup.string()
                .ensure()
                .email(strings.contactInformation.emailAddressInvalid)
                .required(strings.contactInformation.emailAddressRequired),
              phoneNumber: Yup.string()
                .ensure()
                .min(5, strings.contactInformation.phoneNumberRequired)
                .required(),
            })
          }
          onSubmit={userData => {
            navigation.navigate({
              routeName: "TermsOfService",
              params: { userData },
            })
          }}
        >
          {({ isValid, errors, touched, handleSubmit, ...props }) => (
            <>
              <Content
                style={{
                  paddingTop: 20,
                  paddingLeft: 20,
                  paddingRight: 20,
                }}
              >
                <View style={{ paddingBottom: 20 }}>
                  <Body>{strings.register.instructions}</Body>
                </View>

                <View style={{ paddingBottom: 20 }}>
                  <TextInput
                    textContentType="emailAddress"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    value={props.values.email}
                    onChangeText={props.handleChange("email")}
                    onBlur={(...args) => {
                      props.handleChange("email")(props.values.email.trim())
                      props.handleBlur("email")(...args)
                    }}
                    placeholder={strings.common.emailAddress}
                  />

                  {errors.email && touched.email && (
                    <Caption style={{ paddingTop: 3 }}>{errors.email}</Caption>
                  )}
                </View>

                <View style={{ paddingBottom: 20 }}>
                  <TextInput
                    textContentType="telephoneNumber"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="phone-pad"
                    value={props.values.phoneNumber}
                    onChangeText={text =>
                      props.handleChange("phoneNumber")(
                        text.length
                          ? text
                              .split("")
                              .filter(c => /[\d\s+\-()]/.test(c))
                              .join("")
                              .split(/\s{2,}/)
                              .map(x => (x.length ? x : " "))
                              .join("")
                          : text,
                      )
                    }
                    placeholder={strings.common.telephoneNumber}
                    onBlur={event => {
                      props.handleChange("phoneNumber")(
                        formatPhoneNumber(
                          props.values.phoneNumber,
                          localization.country,
                        ),
                      )

                      props.handleBlur("phoneNumber")(event)
                    }}
                  />

                  {errors.phoneNumber && touched.phoneNumber && (
                    <Caption style={{ paddingTop: 3 }}>
                      {errors.phoneNumber}
                    </Caption>
                  )}
                </View>
              </Content>

              <Content
                style={{
                  paddingBottom: buttonPadding,
                  paddingLeft: 20,
                  paddingRight: 20,
                }}
              >
                <View>
                  <Button
                    primary
                    title={strings.register.createAccount}
                    disabled={!isValid}
                    onPress={handleSubmit}
                  />
                </View>
                <Button
                  basic
                  title="Avbryt"
                  onPress={() =>
                    Alert.alert(
                      strings.register.abortRegistrationTitle,
                      strings.register.abortRegistrationMessage,
                      [
                        {
                          text: strings.common.no,
                        },
                        {
                          text: strings.common.yes,
                          onPress: () => {
                            AsyncStorage.clear()
                              .then(() => navigation.navigate("Initialize"))
                              .catch(() => navigation.navigate("Initialize"))
                          },
                          style: "destructive",
                        },
                      ],
                      { cancelable: true },
                    )
                  }
                />
              </Content>
            </>
          )}
        </Formik>
      </ActionView>
    </>
  )
}

export const TermsOfService = ({ navigation }) => {
  const localization = React.useContext(Localization.Context)
  const strings = localization.getStrings()
  const buttonPadding = useKeyboardAndInsetAwareBottomDistance()
  const user = React.useContext(User.Context)

  return (
    <>
      <HeaderTitle>{strings.legal.title}</HeaderTitle>

      <Legal>{strings.legal.content}</Legal>

      <View
        style={{
          paddingTop: 20,
          paddingBottom: buttonPadding,
          backgroundColor: colors.gray50,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.gray400,
          shadowColor: colors.gray400,
          shadowOffset: {
            width: 0,
            height: -1,
          },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,
        }}
      >
        <Content style={{ paddingLeft: 20, paddingRight: 20 }}>
          <Button
            primary
            disabled={user.loading}
            loading={user.loading}
            title={strings.register.acceptTerms}
            onPress={() => {
              const userData = navigation.getParam("userData")

              Promise.resolve(userData ? user.create(userData) : null)
                .then(() => {
                  if (Platform.OS === "android") {
                    return "Registered"
                  } else {
                    return "Notifications"
                  }
                })
                .then(routeName => navigation.navigate({ routeName }))
                .catch(console.log)
            }}
          />
        </Content>
      </View>
    </>
  )
}

const { width: windowWidth } = Dimensions.get("window")

export const Notifications = ({ navigation }) => {
  const notifications = React.useContext(_Notifications.Context)
  const localization = React.useContext(Localization.Context)
  const strings = localization.getStrings()

  React.useEffect(() => {
    const handler = () => true

    BackHandler.addEventListener("hardwareBackPress", handler)

    return () => BackHandler.removeEventListener("hardwareBackPress", handler)
  }, [])

  const buttonPadding = useKeyboardAndInsetAwareBottomDistance()

  return (
    <>
      <HeaderTitle>{strings.notifications.title}</HeaderTitle>

      <ActionView>
        <View
          style={{ marginTop: "auto", marginBottom: "auto", paddingBottom: 60 }}
        >
          <Image
            style={{
              maxWidth: windowWidth > 500 ? 500 : Math.floor(windowWidth * 0.8),
              minWidth: windowWidth > 500 ? 500 : Math.floor(windowWidth * 0.8),
              marginLeft: "auto",
              marginRight: "auto",
              marginBottom: 30,
              resizeMode: "contain",
              height: windowWidth > 500 ? 500 : Math.floor(windowWidth * 0.8),
            }}
            source={require("../assets/toothie-notifications.png")}
          />

          <Content
            style={{
              paddingRight: 20,
              paddingLeft: 20,
              justifyContent: "center",
            }}
          >
            <Body style={{ textAlign: "center" }}>
              {strings.notifications.description}
            </Body>
          </Content>
        </View>

        <Content
          style={{
            paddingRight: 20,
            paddingBottom: buttonPadding,
            paddingLeft: 20,
          }}
        >
          <Button
            primary
            title={strings.notifications.activate}
            onPress={() =>
              notifications
                .requestPermissions()
                .then(() =>
                  Promise.all([
                    AsyncStorage.setItem(
                      "notification_permissions_requested",
                      JSON.stringify(true),
                    ),
                    notifications.register(),
                  ]),
                )
                .then(() => navigation.navigate("Registered"))
            }
          />
        </Content>
      </ActionView>
    </>
  )
}
