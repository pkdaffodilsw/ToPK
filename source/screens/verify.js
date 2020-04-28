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
import { usePolling } from "../hooks"
import { analytics, colors } from "../library"
import { Localization } from "../providers"
import { bankIdStore, orderRefStore, tokenStore } from "../resources"

export const Verify = ({ navigation }) => {
  const [orderRef, setOrderRef] = React.useState()
  const [response, setResponse] = React.useState({ status: "pending" })
  const [error, setError] = React.useState()
  const [errorCount, setErrorCount] = React.useState(0)
  const mounted = React.useRef(false)

  React.useEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  }, [])

  React.useEffect(() => {
    if (!orderRef) {
      orderRefStore
        .read()
        .then(setOrderRef)
        .catch(error => {
          if (mounted.current) {
            setError(error)
            setResponse({ status: "failed" })
          }
        })
    }
  }, [orderRef])

  const abort = usePolling(
    resume =>
      authentication
        .collect(orderRef)
        .then(({ response, token }) => {
          console.log(response)
          token && console.log(token)

          if (mounted.current) {
            setErrorCount(0)

            setResponse({
              ...response,
              code: response.hintCode || response.errorCode,
            })
          }

          if (token) {
            orderRefStore
              .delete()
              .then(() =>
                Promise.all([
                  tokenStore.update(token),
                  bankIdStore.update(response.completionData.user),
                ]),
              )
              .then(() => {
                navigation.navigate({
                  routeName: "Initialize",
                  params: { showSplashScreen: false },
                })
              })
              .catch(error => {
                if (mounted.current) {
                  setError(error)
                  setResponse({ status: "failed" })
                }
              })
          }

          if (response.status !== "complete" && response.status !== "failed") {
            resume()
          }
        })
        .catch(error => {
          if (mounted.current) {
            setErrorCount(state => state + 1)
            setError(error)

            errorCount < 3 && resume()
          }
        }),
    orderRef ? 3000 : null,
  )

  React.useEffect(() => {
    if (error) {
      console.log("errorCount", errorCount)
      console.log("error", error)

      analytics.trackEvent(
        "verifyError",
        error ? Object.assign(error, error.url ? { url: "***" } : {}) : {},
      )
    }
  }, [error, errorCount])

  const { common, verify: strings } = React.useContext(
    Localization.Context,
  ).getStrings({
    verify: { bankId: { codes: { startFailed: { platform: Platform.OS } } } },
  })

  return (
    <View style={styles.container}>
      <SafeAreaView
        style={{ flex: 1, alignItems: "center" }}
        forceInset={{ bottom: 30 }}
      >
        <View style={styles.statusContainer}>
          {response.status === "pending" && (
            <ActivityIndicator
              style={styles.activityIndicator}
              size="large"
              color={colors.primary}
            />
          )}

          <Text style={styles.text}>
            {strings.bankId.codes[response.code] ||
              strings.bankId.defaultMessages[response.status] ||
              ""}
          </Text>
        </View>

        <Button
          basic
          title={
            response.status === "failed" || response.status === "complete"
              ? common.confirm
              : common.abort
          }
          onPress={() => {
            abort()

            orderRefStore.delete().then(() => {
              navigation.navigate({
                routeName: "Initialize",
                params: { showSplashScreen: false },
              })
            })
          }}
        />
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
  statusContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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
