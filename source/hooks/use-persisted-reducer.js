import React from "react"
import AsyncStorage from "@react-native-community/async-storage"

export const usePersistedReducer = (storageKey, reducer, initialState) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    Promise.resolve(AsyncStorage.getItem(storageKey))
      .then(log => {
        try {
          log !== null && JSON.parse(log).forEach(action => dispatch(action))
          setReady(true)
        } catch (error) {
          return Promise.reject(error)
        }
      })
      .catch(error => {
        console.log("usePersistedReducer initialization error", error)
      })
  }, [storageKey])

  const _dispatch = React.useCallback(
    action =>
      Promise.resolve(AsyncStorage.getItem(storageKey))
        .then(previous => {
          try {
            const next = JSON.stringify(
              JSON.parse(previous || "[]").concat(action),
            )

            return AsyncStorage.setItem(storageKey, next)
          } catch (error) {
            return Promise.reject(error)
          }
        })
        .then(() => {
          dispatch(action)
          return action
        })
        .catch(error => {
          throw new Error(error)
        }),
    [storageKey],
  )

  return [
    state,
    _dispatch,
    { ready, clear: () => AsyncStorage.removeItem(storageKey) },
  ]
}
