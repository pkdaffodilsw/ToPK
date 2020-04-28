import React from "react"
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native"
import SafeAreaView from "react-native-safe-area-view"
import { authentication } from "../api"
import { Button } from "../components"
import { PRODUCTION } from "../constants"
import { colors, Linking } from "../library"
import { Localization } from "../providers"
import { orderRefStore } from "../resources"

const actionTypes = {
  AUTHENTICATE: "AUTHENTICATE",
  AUTHENTICATE_SUCCESS: "AUTHENTICATE_SUCCESS",
  AUTHENTICATE_ERROR: "AUTHENTICATE_ERROR",
}

const initialState = {
  loading: false,
  orderRef: undefined,
  autoStartToken: undefined,
  error: undefined,
}

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.AUTHENTICATE:
      return {
        ...state,
        loading: true,
        error: undefined,
      }
    case actionTypes.AUTHENTICATE_SUCCESS:
      return {
        loading: false,
        orderRef: action.payload.orderRef,
        autoStartToken: action.payload.autoStartToken,
        error: undefined,
      }
    case actionTypes.AUTHENTICATE_ERROR:
      return {
        loading: false,
        orderRef: undefined,
        autoStartToken: undefined,
        error: action.payload,
      }
    default:
      return state
  }
}

const useAuthentication = () => {
  const [state, dispatch] = React.useReducer(reducer, initialState)

  return {
    state,
    authenticate: personalNumber => {
      dispatch({ type: actionTypes.AUTHENTICATE })

      authentication
        .authenticate(personalNumber && personalNumber.replace(/\D/, "").trim())
        .then(({ orderRef, autoStartToken }) =>
          orderRefStore.update(orderRef).then(() =>
            dispatch({
              type: actionTypes.AUTHENTICATE_SUCCESS,
              payload: { autoStartToken, orderRef },
            }),
          ),
        )
        .catch(error =>
          dispatch({
            type: actionTypes.AUTHENTICATE_ERROR,
            payload: error,
          }),
        )
    },
  }
}

export const Authenticate = ({ navigation }) => {
  const localization = React.useContext(Localization.Context)

  const strings = localization.getStrings()

  const authentication = useAuthentication()
  const [openUrlError, setOpenUrlError] = React.useState()

  React.useEffect(() => {
    if (
      !authentication.state.loading &&
      !authentication.state.orderRef &&
      !authentication.state.error
    )
      authentication.authenticate(navigation.getParam("personalNumber"))
  }, [authentication, navigation])

  React.useEffect(() => {
    if (authentication.state.orderRef) {
      if (navigation.getParam("personalNumber")) {
        navigation.navigate("Verify")
      } else {
        const bankIdUri = Platform.select({
          ios: `bankid:///?autostarttoken=${authentication.state.autoStartToken}&redirect=toothie://`,
          android: `bankid:///?autostarttoken=${authentication.state.autoStartToken}&redirect=toothie://`,
        })

        Linking.openURL(bankIdUri)
          .then(() => navigation.navigate("Verify"))
          .catch(() => setOpenUrlError(new Error("RFA2")))
      }
    }
  }, [
    authentication.state.autoStartToken,
    authentication.state.orderRef,
    navigation,
  ])

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaView} forceInset={{ bottom: 30 }}>
        <View style={styles.statusContainer}>
          <ActivityIndicator
            style={styles.activityIndicator}
            size="large"
            color={colors.primary}
            animating={!authentication.state.error && !openUrlError}
          />
          {authentication.state.loading && (
            <Text style={styles.text}>{strings.authenticate.started}</Text>
          )}

          {authentication.state.error && (
            <Text style={styles.text}>
              {!PRODUCTION
                ? JSON.stringify(authentication.state.error)
                : strings.authenticate.error}
            </Text>
          )}

          {openUrlError && (
            <Text style={styles.text}>
              {localization.messages.authenticate.startFailed({
                platform: Platform.OS,
              })}
            </Text>
          )}
        </View>

        {authentication.state.error ||
          (openUrlError && (
            <View style={{ padding: 20 }}>
              <Button
                title={strings.common.back}
                onPress={() => {
                  orderRefStore.delete().then(() => {
                    navigation.navigate("Initialize")
                  })
                }}
              />
            </View>
          ))}
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.gray50,
  },
  safeAreaView: {
    flex: 1,
  },
  statusContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  activityIndicator: {
    marginBottom: 30,
  },
  text: {
    fontSize: 17,
    lineHeight: 22,
    textAlign: "center",
    paddingLeft: 20,
    paddingRight: 20,
    maxWidth: 400,
  },
})
