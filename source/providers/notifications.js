import React from "react"
import { Platform } from "react-native"
import NotificationsIOS, {
  NotificationsAndroid,
} from "react-native-notifications"
import { notifications as api } from "../api"

const useNotificationState = () => {
  const [deviceToken, setDeviceToken] = React.useState()
  const [permissions, setPermissions] = React.useState()
  const [loading, setLoading] = React.useState()
  const [error, setError] = React.useState()
  const mounted = React.useRef()

  React.useEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  }, [])

  return [
    {
      deviceToken,
      permissions,
      loading,
      error,
    },
    Object.entries({
      setDeviceToken,
      setPermissions,
      setLoading,
      setError,
    }).reduce((setters, [name, fn]) => {
      Object.assign(setters, {
        [name]: (...args) => mounted.current && fn(...args),
      })

      return setters
    }, {}),
  ]
}

const useNotificationsIOS = () => {
  const [state, setters] = useNotificationState()
  const firstNotification = React.useRef()

  React.useEffect(() => {
    const remoteNotificationsRegisteredListener = token => {
      setters.setLoading(false)
      setters.setError(undefined)
      setters.setDeviceToken(token)
    }

    const remoteNotificationsRegistrationFailedListener = error => {
      setters.setLoading(false)
      setters.setDeviceToken(undefined)
      setters.setError(error)
    }

    const notificationReceivedForegroundListener = (
      notification,
      completion,
    ) => {
      // {
      //   _data: {
      //     body: "Notification Hub test notification",
      //     identifier: "F9463958-02B7-499F-B510-DAED2D0F3637",
      //     date: "2019-10-25T15:58:22.869+02:00",
      //     category: "",
      //     title: null,
      //     thread: "",
      //   },
      //   _alert: "Notification Hub test notification",
      //   _sound: undefined,
      //   _badge: undefined,
      //   _category: undefined,
      //   _type: "regular",
      //   _thread: undefined,
      // }

      const { title, body, identifier } = notification.getData()

      // First notification will be shown
      if (!firstNotification.current) {
        firstNotification.current = true

        const id = NotificationsIOS.localNotification({
          title,
          body,
        })

        setTimeout(() => {
          NotificationsIOS.removeDeliveredNotifications([id])
        }, 8000)
      }

      setTimeout(() => {
        NotificationsIOS.removeDeliveredNotifications([identifier])
      }, 8000)

      completion({ alert: true, sound: false, badge: false })
    }

    NotificationsIOS.addEventListener(
      "remoteNotificationsRegistered",
      remoteNotificationsRegisteredListener,
    )
    NotificationsIOS.addEventListener(
      "remoteNotificationsRegistrationFailed",
      remoteNotificationsRegistrationFailedListener,
    )
    NotificationsIOS.addEventListener(
      "notificationReceivedForeground",
      notificationReceivedForegroundListener,
    )

    return () => {
      NotificationsIOS.removeEventListener(
        "remoteNotificationsRegistered",
        remoteNotificationsRegisteredListener,
      )
      NotificationsIOS.removeEventListener(
        "remoteNotificationsRegistrationFailed",
        remoteNotificationsRegistrationFailedListener,
      )
      NotificationsIOS.removeEventListener(
        "notificationReceivedForeground",
        notificationReceivedForegroundListener,
      )
    }
  }, [setters])

  return {
    ...state,
    requestPermissions: () => {
      if (!state.loading) {
        // No deviceToken when running in iOS Simulator
        state.deviceToken && setters.setLoading(true)

        NotificationsIOS.requestPermissions()

        return NotificationsIOS.checkPermissions()
          .then(permissions => {
            setters.setLoading(false)
            setters.setPermissions(permissions)
            setters.setError(undefined)

            return permissions
          })
          .catch(error => {
            console.log("error", error)

            setters.setLoading(false)
            setters.setError(error)
            setters.setPermissions(undefined)

            return Promise.reject(error)
          })
      }
    },
  }
}

const useNotificationsAndroid = () => {
  const [state, setters] = useNotificationState()

  // "On Android, we allow for only one (global) listener per each event type."
  // https://github.com/wix/react-native-notifications/blob/d65dc4f60f512a157f1cd012c21916126771fd68/docs/subscription.md
  const registrationUpdateListener = React.useRef(false)
  // const notificationReceivedInForegroundListener = React.useRef(false)

  React.useEffect(() => {
    if (
      setters &&
      typeof setters.setDeviceToken === "function" &&
      !registrationUpdateListener.current
    ) {
      try {
        NotificationsAndroid.setRegistrationTokenUpdateListener(token => {
          setters.setDeviceToken(token)
        })

        registrationUpdateListener.current = true

        // Undocumented in react-native-notifications documentation, but necessary.
        // Also, see:
        // https://github.com/wix/react-native-notifications/issues/109#issuecomment-325381460
        NotificationsAndroid.refreshToken()
      } catch (error) {
        setters.setError(error)
        console.log("setRegistrationTokenUpdateListener error", error)
      }
    }
  }, [setters])

  React.useEffect(() => {
    NotificationsAndroid.setNotificationReceivedInForegroundListener(
      notification => {
        const data = notification.getData()

        NotificationsAndroid.removeAllDeliveredNotifications()

        const notificationId = NotificationsAndroid.localNotification({
          title: data["gcm.notification.title"],
          body: data["gcm.notification.body"],
        })

        setTimeout(() => {
          NotificationsAndroid.cancelLocalNotification(notificationId)
        }, 8000)
      },
    )
  }, [])

  return {
    ...state,
    requestPermissions: () =>
      // Android will always give us a token, user has to manually turn off
      // notifications. We're unable to determine if they're off.
      new Promise((resolve, reject) => {
        try {
          NotificationsAndroid.refreshToken()
          resolve()
        } catch (error) {
          reject(error)
        }
      }),
  }
}

const useNotifications = Platform.select({
  android: useNotificationsAndroid,
  ios: useNotificationsIOS,
})

export const Context = React.createContext()

export const Provider = props => {
  const notifications = useNotifications()
  const registeredToken = React.useRef()
  const registering = React.useRef(false)

  React.useEffect(() => {
    Platform.OS === "ios" && NotificationsIOS.removeDeliveredNotifications()
    Platform.OS === "android" &&
      NotificationsAndroid.removeAllDeliveredNotifications()
  }, [])

  const register = () => {
    if (
      !registering.current &&
      notifications.deviceToken &&
      registeredToken.current !== notifications.deviceToken
    ) {
      registering.current = true

      return api
        .register({
          deviceToken: notifications.deviceToken,
        })
        .then(
          () => {
            registeredToken.current = notifications.deviceToken
            registering.current = false
          },
          () => {
            registering.current = false
          },
        )
    } else {
      return Promise.resolve()
    }
  }

  notifications.register = register

  return <Context.Provider value={notifications} {...props} />
}
