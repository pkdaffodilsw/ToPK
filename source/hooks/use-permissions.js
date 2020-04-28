import React from "react"
import { PermissionsAndroid, Platform } from "react-native"

const checkPermissions = async (...permissions) => {
  const notGranted = await Promise.all(
    permissions.map(async permission => {
      const granted = await PermissionsAndroid.check(permission)
      return !granted ? permission : false
    }),
  )

  return notGranted.filter(permission => permission)
}

export const usePermissions = (...permissions) => {
  const checked = React.useRef(null)
  const [granted, setGranted] = React.useState(Platform.OS === `ios`)

  React.useEffect(() => {
    if (!granted) {
      checkPermissions(...permissions)
        .then(permissions => {
          if (permissions.length) {
            PermissionsAndroid.requestMultiple(permissions).then(result => {
              const granted = Object.entries(result).reduce(
                (granted, [type, value]) => {
                  !value && console.warn(`Permission: ${type} denied`)
                  return granted && value
                },
                true,
              )

              setGranted(granted)
            })
          } else {
            setGranted(true)
          }
        })
        .catch(console.error)
    }
  }, [checked, granted, permissions])

  return {
    granted,
    check: () => {
      checked.current = Math.random()
    },
  }
}
