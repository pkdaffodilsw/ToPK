import AsyncStorage from "@react-native-community/async-storage"
import compareVersions from "compare-versions"
import React from "react"
import { Platform } from "react-native"
import { getVersion } from "react-native-device-info"
import SplashScreen from "react-native-splash-screen"
import { readVisit, readVisits } from "../api"
import { Splash } from "../components"
import { analytics } from "../library"
import {
  Configuration,
  HealthDeclaration,
  Notifications,
  User,
  Visits,
} from "../providers"
import { bankIdStore, orderRefStore, tokenStore } from "../resources"

const initialRouteAfterSignIn = "Registered"

const checkAppVersion = ({ configuration }) =>
  Promise.all([
    getVersion(),
    configuration
      .read()
      .then(({ appVersions }) =>
        appVersions
          .filter(({ platform }) => platform.toLowerCase() === Platform.OS)
          .pop(),
      ),
  ]).then(([installedVersion, configuration]) =>
    compareVersions(installedVersion, configuration.minUsableVersion) >= 0
      ? undefined
      : { routeName: "Upgrade", params: { installedVersion, configuration } },
  )

const checkTokenAndRegistration = ({
  requestPermissions,
  registerDeviceToken,
  healthDeclaration,
  visits,
  user,
}) =>
  user
    .read()
    .then(() =>
      Platform.OS === "android"
        ? requestPermissions().then(() => registerDeviceToken())
        : Promise.resolve(),
    )
    .then(
      () =>
        readVisits()
          .then(visits => {
            const active = visits.filter(({ status }) => status === "Active")[0]

            return active
              ? readVisit({ visitId: active.id })
              : Promise.resolve()
          })
          .then(visit =>
            visit && visit.call && visit.call.status === "OnGoing"
              ? { routeName: "IncomingCall", params: { visit } }
              : Platform.OS === "ios"
              ? AsyncStorage.getItem("notification_permissions_requested")
                  .then(value =>
                    value !== null
                      ? requestPermissions()
                          .then(registerDeviceToken)
                          .then(() => ({ routeName: initialRouteAfterSignIn }))
                      : {
                          routeName: "Notifications",
                        },
                  )
                  .catch(() => ({ routeName: initialRouteAfterSignIn }))
              : { routeName: initialRouteAfterSignIn },
          ),
      error =>
        error.status === 404
          ? Promise.resolve({ routeName: "Registration" })
          : Promise.reject(error),
    )
    .catch(error => {
      console.log(error)

      healthDeclaration.setInitial()
      visits.setInitial()

      return Promise.all([
        bankIdStore.delete(),
        orderRefStore.delete(),
        tokenStore.delete(),
      ]).then(() => ({
        routeName: "Login",
      }))
    })

const checkOrderRef = () =>
  orderRefStore.read().then(
    orderRef => ({ routeName: "Verify", params: { orderRef } }),
    () => undefined,
  )

export const Initialize = ({ navigation }) => {
  const {
    requestPermissions,
    register: registerDeviceToken,
  } = React.useContext(Notifications.Context)

  const healthDeclaration = React.useContext(HealthDeclaration.Context)
  const configuration = React.useContext(Configuration.Context)
  const visits = React.useContext(Visits.Context)
  const user = React.useContext(User.Context)

  // Since code is minified in production, we need a way to keep the names around for logging purposes
  const [operations, setRemainingOperations] = React.useState([
    ["checkAppVersion", checkAppVersion],
    ["checkOrderRef", checkOrderRef],
    ["checkTokenAndRegistration", checkTokenAndRegistration],
  ])

  const options = React.useRef({
    requestPermissions,
    registerDeviceToken,
    healthDeclaration,
    configuration,
    visits,
    user,
  })

  const _navigation = React.useRef(navigation)

  React.useEffect(() => {
    options.current = {
      requestPermissions,
      registerDeviceToken,
      healthDeclaration,
      configuration,
      visits,
      user,
    }

    _navigation.current = navigation
  })

  React.useEffect(() => {
    let mounted = true

    if (operations.length) {
      const [[name, next], ...remainingOperations] = operations

      console.log(name)

      analytics.trackEvent("initialize", { next: name })

      next(options.current)
        .then(navigateOptions => {
          if (navigateOptions) {
            console.log(`${name} -> navigateOptions`, navigateOptions)
            _navigation.current.navigate(navigateOptions)
            setTimeout(() => SplashScreen.hide(), 0)
          } else {
            mounted && setRemainingOperations(remainingOperations)
          }
        })
        .catch(error => {
          throw new Error(error)
        })
    }

    return () => {
      mounted = false
    }
  }, [operations])

  return navigation.getParam("showSplashScreen") === false ? null : <Splash />
}
