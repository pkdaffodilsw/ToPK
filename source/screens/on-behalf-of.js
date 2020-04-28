import { Formik } from "formik"
import { normalise as normalizePersonalNumber, validate } from "personnummer.js"
import React from "react"
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { getInset, getStatusBarHeight } from "react-native-safe-area-view"
import { NavigationActions, StackActions } from "react-navigation"
import { Header as RNNHeader } from "react-navigation-stack"
import * as Yup from "yup"
import { Body, Button, Caption, Header, TextInput } from "../components"
import { colors, fonts, formatPersonalNumber, textStyles } from "../library"
import { HealthDeclaration, Localization } from "../providers"
import { bankIdStore } from "../resources"

const { width: windowWidth } = Dimensions.get("window")

export const OnBehalfOf = ({ navigation }) => {
  const strings = React.useContext(Localization.Context).getStrings()
  const healthDeclaration = React.useContext(HealthDeclaration.Context)
  const [
    loggedInUserPersonalNumber,
    setLoggedInUserPersonalNumber,
  ] = React.useState()

  React.useEffect(() => {
    bankIdStore
      .read()
      .then(({ personalNumber }) =>
        setLoggedInUserPersonalNumber(personalNumber),
      )
      .catch(console.log)
  }, [])

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={Math.max(
          getStatusBarHeight() + getInset("top"),
          RNNHeader.HEIGHT,
        )}
      >
        <Formik
          validationSchema={() =>
            Yup.object({
              personalNumber: Yup.string()
                .required(strings.onBehalfOf.personalNumberRequired)
                .matches(
                  /^[0-9]{2,4}[-]*[0-9]{1,2}[-]*[0-9]{1,2}[-+]*[0-9]{4,}$/,
                  strings.onBehalfOf.personalNumberWrongFormat,
                )
                .test(
                  "ssn-validation",
                  strings.onBehalfOf.personalNumberWrongFormat,
                  validate,
                ),
              firstName: Yup.string().required(
                strings.onBehalfOf.firstNameRequired,
              ),
              lastName: Yup.string().required(
                strings.onBehalfOf.lastNameRequired,
              ),
            })
          }
          onSubmit={onBehalfOf => {
            healthDeclaration.setInitial()

            navigation.navigate({
              routeName: "QuestionTree",
              key: JSON.stringify([]),
              params: {
                schemaPath: "",
                onBehalfOf: onBehalfOf,
              },
            })
          }}
        >
          {({ errors, touched, dirty, ...props }) => (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.inner}
              alwaysBounceVertical={false}
              keyboardDismissMode="none"
              keyboardShouldPersistTaps="handled"
            >
              <View>
                <Header
                  title={strings.onBehalfOf.title}
                  style={styles.header}
                ></Header>
                <View style={styles.textInputContainer}>
                  <TextInput
                    placeholder={strings.common.personalNumber}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="number-pad"
                    value={props.values.personalNumber}
                    onChangeText={text =>
                      props.handleChange("personalNumber")(
                        formatPersonalNumber(text),
                      )
                    }
                    onBlur={props.handleBlur("personalNumber")}
                    maxLength={13}
                  />
                </View>

                <View style={styles.textInputContainer}>
                  <TextInput
                    placeholder={strings.onBehalfOf.firstName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    value={props.values.firstName}
                    onChangeText={props.handleChange("firstName")}
                    onBlur={props.handleBlur("firstName")}
                  />
                </View>

                <View style={styles.textInputContainer}>
                  <TextInput
                    placeholder={strings.onBehalfOf.lastName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    value={props.values.lastName}
                    onChangeText={props.handleChange("lastName")}
                    onBlur={props.handleBlur("lastName")}
                  />
                </View>

                <View style={styles.errors}>
                  {errors.personalNumber && touched.personalNumber && (
                    <Caption style={styles.error}>
                      {errors.personalNumber}
                    </Caption>
                  )}

                  {errors.firstName && touched.firstName && (
                    <Caption style={styles.error}>{errors.firstName}</Caption>
                  )}

                  {errors.lastName && touched.lastName && (
                    <Caption style={styles.error}>{errors.lastName}</Caption>
                  )}
                </View>

                {loggedInUserPersonalNumber &&
                  normalizePersonalNumber(props.values.personalNumber) ===
                    normalizePersonalNumber(loggedInUserPersonalNumber) && (
                    <View
                      style={{
                        marginLeft: 10,
                        marginRight: 10,
                        marginBottom: 20,
                        padding: 20,
                        backgroundColor: colors.secondaryComplementary,
                        borderRadius: 5,
                        borderColor: colors.secondary,
                      }}
                    >
                      <Body style={{ marginBottom: 10 }}>
                        {strings.onBehalfOf.samePersonalNumberAsLoggedIn}
                      </Body>

                      <Body
                        style={{
                          fontFamily: fonts.openSans.semiBold,
                          marginBottom: Math.floor(
                            (textStyles.body.lineHeight -
                              textStyles.body.fontSize) /
                              2,
                          ),
                        }}
                      >
                        {strings.onBehalfOf.bookForMe}
                      </Body>

                      <TouchableOpacity
                        onPress={() => {
                          navigation.dispatch(
                            StackActions.reset({
                              index: 0,
                              actions: [
                                NavigationActions.navigate({
                                  routeName: "RegisteredHome",
                                  action: NavigationActions.navigate({
                                    routeName: "QuestionTree",
                                  }),
                                }),
                              ],
                            }),
                          )
                        }}
                      >
                        <Body
                          style={{
                            color: colors.secondary,
                            fontFamily: fonts.openSans.bold,
                            marginBottom: 1,
                          }}
                        >
                          {strings.start.menuItems.me}
                        </Body>
                      </TouchableOpacity>
                    </View>
                  )}
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  style={styles.button}
                  title={strings.common.next}
                  onPress={props.handleSubmit}
                  disabled={
                    (loggedInUserPersonalNumber &&
                      normalizePersonalNumber(props.values.personalNumber) ===
                        normalizePersonalNumber(loggedInUserPersonalNumber)) ||
                    Boolean(errors.personalNumber) ||
                    Boolean(errors.firstName) ||
                    Boolean(errors.lastName) ||
                    !dirty
                  }
                ></Button>
              </View>
            </ScrollView>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: windowWidth > 500 ? 500 : undefined,
    minWidth: windowWidth > 500 ? 500 : windowWidth,
  },
  inner: {
    flexGrow: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  header: {
    padding: 10,
  },
  textInputContainer: {
    padding: 10,
  },
  errors: {
    padding: 10,
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
