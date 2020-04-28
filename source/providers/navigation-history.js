import React from "react"
import { analytics } from "../library"

const MAX_HISTORY_ENTRIES = 100

export const Context = React.createContext()

export const Provider = props => {
  const navigation = React.createRef()

  const [history, dispatch] = React.useReducer(
    (state, { type, ...payload } = {}) => {
      console.log(type, payload)
      switch (type) {
        case "Navigation/NAVIGATE":
          return [
            ...state.slice(parseInt(`-${MAX_HISTORY_ENTRIES}`, 10) - 1),
            payload,
          ]
        case "Navigation/SET_PARAMS":
          return [
            ...state.slice(0, -1),
            {
              ...state.slice(-1).pop(),
              params: {
                ...(state.slice(-1).pop().params || {}),
                ...payload.params,
              },
            },
          ]
        default:
          return state
      }
    },
    [],
  )

  const appContainerProps = {
    ref: navigation,
    onNavigationStateChange: (previousState, nextState, action) => {
      const { routeName: previousRouteName } = history.slice(-1)[0] || {}

      if (action.type === "Navigation/NAVIGATE") {
        if (
          !(
            action.routeName === "QuestionTree" &&
            previousRouteName === "QuestionTree"
          ) &&
          previousRouteName !== action.routeName
        ) {
          analytics.trackEvent("navigate", {
            routeName: action.routeName,
          })
        }
      }

      if (action.type === "Navigation/BACK") {
        if (
          !(
            action.routeName === "QuestionTree" &&
            previousRouteName === "QuestionTree"
          )
        ) {
          analytics.trackEvent("navigate", {
            routeName: action.routeName,
          })
        }
      }

      if (action.type === "Navigation/RESET") {
        action.actions.map(({ action, ...payload }) => {
          dispatch(payload)
          dispatch(action)
        })
      } else {
        dispatch(action)
      }
    },
  }

  return (
    <Context.Provider
      value={{
        appContainerProps,
        history,
      }}
      {...props}
    />
  )
}
