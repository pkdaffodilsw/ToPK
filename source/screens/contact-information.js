import { Formik } from "formik"
import isEqual from "lodash.isequal"
import React from "react"
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native"
import { getInset, getStatusBarHeight } from "react-native-safe-area-view"
import { Header } from "react-navigation-stack"
import * as Yup from "yup"
import {
  Body,
  Button,
  Caption,
  ErrorMessage,
  HeaderBackTitle,
  HeaderTitle,
  TextInput,
} from "../components"
import { colors, formatPhoneNumber } from "../library"
import { Localization, User } from "../providers"

const { width: windowWidth } = Dimensions.get("window")

export const ContactInformation = ({ navigation }) => {
  const localization = React.useContext(Localization.Context)
  const [initialValues, setInitialValues] = React.useState()
  const user = React.useContext(User.Context)

  React.useEffect(() => {
    if (!isEqual(user.data, initialValues)) {
      setInitialValues(user.data)
    }
  }, [initialValues, user.data])

  const strings = localization.getStrings()

  return (
    <>
      <HeaderTitle>{strings.contactInformation.title}</HeaderTitle>

      <HeaderBackTitle>{strings.common.back}</HeaderBackTitle>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={Math.max(
          getStatusBarHeight() + getInset("top"),
          Header.HEIGHT,
        )}
      >
        {!user.loading && user.error && (
          <ErrorMessage
            title={strings.common.generalError}
            message={
              typeof user.error === "string"
                ? user.error
                : user.error.body || user.error.message
            }
            onClose={() => navigation.goBack()}
          />
        )}

        {initialValues && (
          <Formik
            initialValues={initialValues}
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
            onSubmit={data => user.update(data).then(() => navigation.goBack())}
          >
            {({ errors, touched, dirty, ...props }) => (
              <ScrollView
                style={{
                  flex: 1,
                  marginLeft: "auto",
                  marginRight: "auto",
                  maxWidth: windowWidth > 500 ? 500 : undefined,
                  minWidth: windowWidth > 500 ? 500 : windowWidth,
                }}
                contentContainerStyle={styles.inner}
                alwaysBounceVertical={false}
                keyboardDismissMode="none"
                keyboardShouldPersistTaps="handled"
              >
                <View>
                  <Body style={styles.body}>
                    {strings.contactInformation.description}
                  </Body>

                  <View style={styles.textInputContainer}>
                    <TextInput
                      textContentType="emailAddress"
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      style={styles.textInput}
                      value={props.values.email}
                      onChangeText={props.handleChange("email")}
                      onBlur={(...args) => {
                        props.handleChange("email")(props.values.email.trim())
                        props.handleBlur("email")(...args)
                      }}
                      placeholder={strings.common.emailAddress}
                      disabled={user.loading}
                    ></TextInput>
                  </View>

                  <View style={styles.textInputContainer}>
                    <TextInput
                      textContentType="telephoneNumber"
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="phone-pad"
                      style={styles.textInput}
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
                      disabled={user.loading}
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
                  </View>

                  <View style={styles.errors}>
                    {errors.email && touched.email && (
                      <Caption style={styles.error}>{errors.email}</Caption>
                    )}

                    {errors.phoneNumber && touched.phoneNumber && (
                      <Caption style={styles.error}>
                        {errors.phoneNumber}
                      </Caption>
                    )}
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <Button
                    style={styles.button}
                    title={strings.common.save}
                    onPress={props.handleSubmit}
                    disabled={
                      user.loading ||
                      Boolean(errors.email) ||
                      Boolean(errors.phoneNumber) ||
                      !dirty
                    }
                  ></Button>
                </View>
              </ScrollView>
            )}
          </Formik>
        )}
      </KeyboardAvoidingView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flexGrow: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  textInputContainer: {
    padding: 15,
  },
  errors: {
    padding: 15,
  },
  buttonContainer: {
    padding: 10,
  },
  body: {
    padding: 10,
  },
  error: {
    paddingTop: 10,
    paddingBottom: 10,
    color: colors.red,
  },
})
