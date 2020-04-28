import AsyncStorage from "@react-native-community/async-storage"
import Crashes from "appcenter-crashes"
import React from "react"
import { FlatList, Platform, View } from "react-native"
import NotificationsIOS, {
  NotificationsAndroid,
} from "react-native-notifications"
import { Body, HeaderBackTitle, HeaderTitle, ListItem } from "../components"
import { colors } from "../library"
import { Localization, Notifications } from "../providers"

const RNNotifications = Platform.select({
  ios: NotificationsIOS,
  android: NotificationsAndroid,
})

const actionTypes = {
  REGISTER_ACTION: "REGISTER_ACTION",
  EXECUTE_ACTION: "EXECUTE_ACTION",
  EXECUTE_ACTION_SUCCESS: "EXECUTE_ACTION_SUCCESS",
  EXECUTE_ACTION_ERROR: "EXECUTE_ACTION_ERROR",
}

const initialState = new Map()

const initialActionState = {
  loading: false,
  error: undefined,
  data: undefined,
}

const reducer = (stateMap, { type, payload } = {}) => {
  switch (type) {
    case actionTypes.REGISTER_ACTION:
      return new Map([...stateMap, [payload.action, { ...initialActionState }]])
    case actionTypes.EXECUTE_ACTION:
      return new Map(
        [...stateMap].map(([action, state]) =>
          action === payload.action
            ? [action, { ...state, loading: true }]
            : [action, state],
        ),
      )
    case actionTypes.EXECUTE_ACTION_ERROR:
      return new Map(
        [...stateMap].map(([action, state]) =>
          action === payload.action
            ? [action, { ...initialActionState, error: payload.error }]
            : [action, state],
        ),
      )
    case actionTypes.EXECUTE_ACTION_SUCCESS:
      return new Map(
        [...stateMap].map(([action, state]) =>
          action === payload.action
            ? [action, { ...initialActionState, data: payload.data }]
            : [action, state],
        ),
      )
    default:
      return stateMap
  }
}

const useAsyncActions = () => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const handlers = React.useRef(new Map())
  const mounted = React.useRef()

  React.useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  return {
    state,
    register: action => {
      if (handlers.current.has(action)) {
        return handlers.current.get(action)
      } else {
        const handler = (...args) => {
          dispatch({ type: actionTypes.EXECUTE_ACTION, payload: { action } })

          action(...args)
            .then(
              data =>
                mounted.current === true &&
                dispatch({
                  type: actionTypes.EXECUTE_ACTION_SUCCESS,
                  payload: { action, data },
                }),
            )
            .catch(
              error =>
                mounted.current === true &&
                dispatch({
                  type: actionTypes.EXECUTE_ACTION_ERROR,
                  payload: { action, error },
                }),
            )
        }

        handlers.current.set(action, handler)

        dispatch({ type: actionTypes.REGISTER_ACTION, payload: { action } })

        return handler
      }
    },
  }
}

const items = [
  {
    title: "Clear AsyncStorage",
    action: ({ navigation }) =>
      AsyncStorage.clear().then(() => {
        navigation.navigate("Initialize")
      }),
  },
  {
    title: "Generate test crash",
    action: () => {
      Crashes.generateTestCrash()
      throw new Error("Test crash")
    },
  },
  // {
  //   title: "Navigate to Call",
  //   action: ({ navigation }) => {
  //     navigation.navigate({ routeName: "Call", params: { debugCall: true } })
  //     return Promise.resolve()
  //   },
  // },
  {
    title: "Local notification",
    action: () => {
      RNNotifications.localNotification({
        title: "Toothie",
        body: Date.now().toString(),
      })

      return Promise.resolve()
    },
  },
]

export const Settings = ({ navigation }) => {
  const strings = React.useContext(Localization.Context).getStrings()
  const notifications = React.useContext(Notifications.Context)
  const asyncActions = useAsyncActions()

  const data = items.map(item => {
    const onPress = asyncActions.register(item.action)

    return {
      ...item,
      onPress: () => onPress({ navigation, notifications }),
      hideArrow: true,
    }
  })

  return (
    <>
      <HeaderTitle>{strings.settings.title}</HeaderTitle>
      <HeaderBackTitle>{strings.common.back}</HeaderBackTitle>

      <FlatList
        style={{ flex: 1 }}
        data={data}
        keyExtractor={(_, index) => `${index}`}
        renderItem={({ item: { action, ...item } }) => {
          const itemState = asyncActions.state.get(action)

          return <ListItem {...item} loading={itemState.loading} />
        }}
        ListFooterComponent={() => (
          <>
            <View style={{ padding: 20 }}>
              {Object.entries(colors).map(([name, color]) => (
                <View
                  key={name}
                  style={{
                    marginBottom: 20,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: color,
                      width: 20,
                      height: 20,
                    }}
                  />
                  <View style={{ paddingLeft: 20 }}>
                    <Body>{name}</Body>
                    <Body selectable>{color}</Body>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      />
    </>
  )
}
