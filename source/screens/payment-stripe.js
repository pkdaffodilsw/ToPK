import React from "react"
import {
  BackHandler,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native"
import { getInset, getStatusBarHeight } from "react-native-safe-area-view"
import { NavigationActions, StackActions } from "react-navigation"
import { Header } from "react-navigation-stack"
import stripe, { PaymentCardTextField } from "tipsi-stripe"
import { payments, readVisit, readVisits } from "../api"
import {
  Button,
  Caption,
  ErrorMessage,
  HeaderTitle,
  Message,
} from "../components"
import { MED_STRIPE_PUBLISHABLE_KEY } from "../constants"
import { usePolling } from "../hooks"
import {
  analytics,
  colors,
  facebookAppEvents,
  firebaseAnalytics,
  textStyles,
} from "../library"
import { getSku } from "../library/get-sku"
import { Localization, Visits } from "../providers"

const { width: windowWidth } = Dimensions.get("window")

stripe.setOptions({
  publishableKey: MED_STRIPE_PUBLISHABLE_KEY,
})

export const PaymentStripe = ({ navigation }) => {
  const visits = React.useContext(Visits.Context)
  const strings = React.useContext(Localization.Context).getStrings()
  const visitId = navigation.getParam("visit").id

  const [error, setError] = React.useState()
  const [loading, setLoading] = React.useState(false)
  const [cardParams, setCardParams] = React.useState()
  const [cardValid, setCardValid] = React.useState(false)
  const [paymentIntent, setPaymentIntent] = React.useState()
  const [paymentResult, setPaymentResult] = React.useState()
  const [countDown, setCountDown] = React.useState(3)
  const [paymentConfirmed, setPaymentConfirmed] = React.useState(false)

  // React.useEffect(() => {
  //   if (cardValid) {
  //     facebookAppEvents.addedPaymentInfo()
  //   }
  // }, [cardValid])

  React.useEffect(() => {
    if (!error && !paymentIntent && visitId) {
      setLoading(true)

      payments
        .createIntent({ visitId, idempotencyKey: visitId })
        .then(paymentIntent => {
          setPaymentIntent(paymentIntent)
          setLoading(false)
        })
        .catch(error => {
          setError(error)
          setLoading(false)
        })
    }
  }, [error, paymentIntent, visitId])

  const onSuccess = () => {
    navigation.dispatch(
      StackActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({
            routeName: "RegisteredHome",
            action: NavigationActions.navigate({ routeName: "History" }),
          }),
        ],
      }),
    )
  }

  usePolling(
    resume => {
      readVisit({ visitId })
        .then(visit => {
          if (visit.status !== "Draft") {
            setPaymentConfirmed(true)
            setError(undefined)
            setLoading(false)
          } else {
            resume()
          }
        })
        .catch(error => {
          setError(error)
        })
    },
    paymentResult && !error ? 4000 : null,
  )

  usePolling(
    resume => {
      if (countDown > 0) {
        setCountDown(state => state - 1)
        resume()
      } else {
        onSuccess()
      }
    },
    paymentConfirmed ? 1000 : null,
  )

  React.useEffect(() => {
    if (paymentResult) {
      const handler = () => true

      BackHandler.addEventListener("hardwareBackPress", handler)

      return () => BackHandler.removeEventListener("hardwareBackPress", handler)
    }
  }, [paymentResult])

  React.useEffect(() => {
    if (error) {
      console.log(error)
      analytics.trackEvent("paymentStripeError", error)
    }
  }, [error])

  return (
    <>
      <HeaderTitle>{strings.common.cardPayment}</HeaderTitle>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={Math.max(
          getStatusBarHeight() + getInset("top"),
          Header.HEIGHT,
        )}
      >
        {error && (
          <ErrorMessage
            title={error.message || strings.common.generalError}
            onClose={() => {
              paymentResult && setPaymentResult(undefined)
              setError(undefined)
            }}
          />
        )}

        {paymentResult
          ? null
          : visits.state.draft &&
            visits.state.draft.id !== visitId && (
              <Message
                onPress={() => {
                  navigation.dispatch(
                    StackActions.reset({
                      index: 0,
                      actions: [
                        NavigationActions.navigate({
                          routeName: "RegisteredHome",
                          action: NavigationActions.navigate({
                            routeName: "History",
                          }),
                        }),
                      ],
                    }),
                  )
                }}
              >
                {strings.node.draftNotCurrent}
              </Message>
            )}

        <View style={styles.container}>
          <View style={styles.stripeFieldContainer}>
            <PaymentCardTextField
              style={{
                ...styles.stripeField,
                ...(paymentResult ? { color: colors.green } : {}),
              }}
              textErrorColor={colors.red}
              onParamsChange={(cardValid, params) => {
                setError(undefined)
                setCardParams(params)
                setCardValid(cardValid)
              }}
              disabled={Boolean(paymentResult)}
            />
          </View>

          <Caption>{strings.paymentStripe.securityInformation}</Caption>

          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            {error ? (
              <Button
                primary
                backgroundColor={colors.red}
                title={strings.common.tryAgain}
                onPress={() => {
                  paymentResult && setPaymentResult(undefined)
                  setError(undefined)
                }}
              ></Button>
            ) : !paymentConfirmed ? (
              <Button
                loading={loading}
                primary
                title={strings.common.pay}
                disabled={Boolean(!paymentIntent || !cardValid || loading)}
                onPress={() => {
                  setLoading(true)

                  navigation.setParams({
                    abortDisabled: true,
                  })

                  readVisits()
                    .then(visits =>
                      visits.filter(
                        ({ status, id }) =>
                          status === "Active" ||
                          status === "Queued" ||
                          (status === "Draft" && id !== visitId),
                      ).length === 0
                        ? stripe.confirmPaymentIntent({
                            clientSecret: paymentIntent.clientSecret,
                            paymentMethod: { card: cardParams },
                          })
                        : Promise.reject(
                            new Error(`Visit ${visitId} abandoned.`),
                          ),
                    )
                    .then(result => {
                      if (result.status === "succeeded") {
                        const { price, currency } =
                          navigation.getParam("pricing") || {}

                        const {
                          clinicianType,
                          treatment,
                        } = navigation.getParam("visit")

                        facebookAppEvents.purchased(price, currency, {
                          numItems: 1,
                          contentType: "product",
                          contentId: getSku({
                            clinicianType,
                            treatment,
                            price,
                          }),
                        })

                        // facebookAppEvents.schedule()

                        firebaseAnalytics.logPurchase({
                          currency,
                          value: price,
                        })
                      }

                      setPaymentResult(result)
                    })
                    .catch(error => {
                      setLoading(false)
                      setError(error)
                      visits.refresh()

                      navigation.setParams({
                        abortDisabled: true,
                      })

                      console.log(error)
                    })
                }}
              ></Button>
            ) : (
              <Button
                primary
                backgroundColor={colors.green}
                title={`${strings.common.continue} - ${countDown + 1}`}
                onPress={() => {
                  onSuccess()
                }}
              ></Button>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: windowWidth > 500 ? 500 : undefined,
    minWidth: windowWidth > 500 ? 500 : windowWidth,
  },
  stripeField: {
    ...textStyles.body,
    lineHeight: 0,
    borderColor: "transparent",
    marginBottom: -4,
  },
  stripeFieldContainer: {
    borderBottomWidth: 2,
    borderBottomColor: colors.secondary,
    marginBottom: 15,
    paddingBottom: 2,
  },
})
