import React from "react"
import { BackHandler, Dimensions, Image, Platform, View } from "react-native"
import { NavigationActions, StackActions } from "react-navigation"
import { payments } from "../api"
import { Body, Button, HeaderTitle } from "../components"
import { PRODUCTION } from "../constants"
import { usePolling } from "../hooks"
import {
  analytics,
  colors,
  facebookAppEvents,
  firebaseAnalytics,
  Linking,
} from "../library"
import { getSku } from "../library/get-sku"
import { Localization, Visits } from "../providers"

const { width: windowWidth } = Dimensions.get("window")

const paymentStatus = {
  paid: "PAID",
  declined: "DECLINED",
  error: "ERROR",
}

const getSwishUrl = ({ token, callbackUrl = `toothie:///` }) => {
  return Platform.select({
    android: `swish:///paymentrequest?token=${token}&callbackurl=${callbackUrl}`,
    ios: `swish://paymentrequest?token=${token}&callbackurl=${callbackUrl}`,
  })
}

const initialState = {
  loading: false,
  error: undefined,
  remainingRetries: 3,
  visitId: undefined,
  initialized: false,
  paymentRequestId: undefined,
  paymentRequestToken: undefined,
  swishCalled: false,
  status: undefined,
}

const actionTypes = {
  initialize: "initialize",
  initializeSuccess: "initializeSuccess",
  initializeError: "initializeError",
  openSwish: "openSwish",
  openSwishSuccess: "openSwishSuccess",
  openSwishError: "openSwishError",
  paymentStatus: "paymentStatus",
  paymentStatusSuccess: "paymentStatusSuccess",
  paymentStatusError: "paymentStatusError",
}

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.initialize:
      return {
        ...state,
        initialized: true,
        loading: true,
        visitId: action.visitId,
        status: "toothie_initializing",
      }
    case actionTypes.initializeSuccess:
      return {
        ...state,
        paymentRequestId: action.id,
        paymentRequestToken: action.token,
      }
    case actionTypes.initializeError:
      return {
        ...state,
        loading: false,
        error: action.error,
        status: "toothie_unknownError",
      }
    case actionTypes.openSwish:
      return {
        ...state,
        loading: true,
        swishCalled: true,
        status: "toothie_openSwish",
      }
    case actionTypes.openSwishSuccess:
      return { ...state }
    case actionTypes.openSwishError:
      return {
        ...state,
        ...(PRODUCTION
          ? {
              loading: false,
              error: action.error,
              status: "toothie_openSwishError",
            }
          : { status: "toothie_openSwishError", swishCalled: true }),
      }
    case actionTypes.paymentStatus:
      return {
        ...state,
        loading: true,
        status: "created",
      }
    case actionTypes.paymentStatusSuccess:
      if (Object.values(paymentStatus).includes(action.status)) {
        return {
          ...state,
          loading: false,
          status: action.status.toLowerCase(),
        }
      } else {
        return {
          ...state,
          status: action.status.toLowerCase(),
          remainingRetries: initialState.remainingRetries,
        }
      }
    case actionTypes.paymentStatusError:
      if (state.remainingRetries === 0) {
        return {
          ...state,
          loading: false,
          error: action.error,
          status: "toothie_unknownError",
        }
      } else {
        return {
          ...state,
          remainingRetries: state.remainingRetries - 1,
        }
      }
    default:
      throw new Error(`Unknown actionType: ${action.type}`)
  }
}

export const PaymentSwish = ({ navigation }) => {
  const strings = React.useContext(Localization.Context).getStrings()
  const visits = React.useContext(Visits.Context)

  const [state, dispatch] = React.useReducer(reducer, initialState)
  const [countDown, setCountDown] = React.useState(3)

  React.useEffect(() => {
    !navigation.getParam("abortDisabled") &&
      navigation.setParams({ abortDisabled: true })
  }, [navigation])

  React.useEffect(() => {
    if (!state.initialized && visits.state.draft.id) {
      dispatch({
        type: actionTypes.initialize,
        visitId: visits.state.draft.id,
      })

      payments.swish
        .initialize({ visitId: visits.state.draft.id })
        .then(response => {
          dispatch({ type: actionTypes.initializeSuccess, ...response })
        })
        .catch(error => {
          dispatch({ type: actionTypes.initializeError, error })
        })
    }
  }, [dispatch, state.initialized, visits.state.draft.id])

  React.useEffect(() => {
    if (state.paymentRequestToken && !state.swishCalled) {
      dispatch({ type: actionTypes.openSwish })

      Linking.openURL(getSwishUrl({ token: state.paymentRequestToken }))
        .then(() => {
          // facebookAppEvents.addedPaymentInfo()

          dispatch({ type: actionTypes.openSwishSuccess })
        })
        .catch(error => {
          analytics.trackEvent("linkingError", error)

          dispatch({ type: actionTypes.openSwishError, error })
        })
    }
  })

  const { status } = state

  usePolling(
    resume => {
      dispatch({ type: actionTypes.paymentStatus })

      payments.swish
        .verify({ paymentRequestId: state.paymentRequestId })
        .then(
          response =>
            dispatch({ type: actionTypes.paymentStatusSuccess, ...response }),
          error => dispatch({ type: actionTypes.paymentStatusError, error }),
        )
        .then(() => resume())
    },
    state.swishCalled &&
      !state.error &&
      !Object.values(paymentStatus).includes(status.toUpperCase())
      ? 3000
      : null,
  )

  const done = () => {
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
      if (countDown > 0) {
        setCountDown(state => state - 1)
        resume()
      } else {
        done()
      }
    },
    status === "paid" ? 1000 : null,
  )

  React.useEffect(() => {
    if (status === "paid") {
      const { price, currency } = navigation.getParam("pricing") || {}
      const { clinicianType, treatment } = navigation.getParam("visit")

      facebookAppEvents.purchased(price, currency, {
        numItems: 1,
        contentType: "product",
        contentId: getSku({ clinicianType, treatment, price }),
      })

      // facebookAppEvents.schedule()
      firebaseAnalytics.logPurchase({ currency, value: price })
    }
  }, [navigation, status])

  React.useEffect(() => {
    if (status === "paid") {
      const handler = () => true

      BackHandler.addEventListener("hardwareBackPress", handler)

      return () => BackHandler.removeEventListener("hardwareBackPress", handler)
    }
  }, [status])

  React.useEffect(() => {
    if (state.error) {
      console.log(state.error)
      analytics.trackEvent("paymentSwishError", state.error)
    }
  }, [state.error])

  return (
    <>
      <HeaderTitle>{strings.common.swishPayment}</HeaderTitle>

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          marginLeft: "auto",
          marginRight: "auto",
          maxWidth: windowWidth > 500 ? 500 : undefined,
          minWidth: windowWidth > 500 ? 500 : windowWidth,
        }}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Image
            style={{ marginBottom: 30 }}
            source={require("../assets/swish-color.png")}
          />

          <Body color={state.error && colors.red}>
            {status && strings.paymentSwish[status]
              ? strings.paymentSwish[status]
              : strings.paymentSwish.toothie_unknownStatus}
          </Body>
        </View>

        <View style={{ alignSelf: "stretch" }}>
          <Button
            primary
            backgroundColor={
              status === "paid"
                ? colors.green
                : state.error || status === "declined" || status === "error"
                ? colors.red
                : undefined
            }
            title={
              status === "paid"
                ? `${strings.common.continue} - ${countDown}`
                : state.error || status === "declined" || status === "error"
                ? strings.common.back
                : strings.common.continue
            }
            loading={state.loading}
            disabled={state.loading}
            onPress={
              state.error || status === "declined" || status === "error"
                ? () => {
                    navigation.goBack()
                  }
                : done
            }
          ></Button>
        </View>
      </View>
    </>
  )
}
