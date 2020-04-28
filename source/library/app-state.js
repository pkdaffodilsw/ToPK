import { AppState } from "react-native"
import * as enroll from "enroll"

const APP_STATES = {
  ACTIVE: "active",
  BACKGROUND: "background",
  INACTIVE: "inactive",
}

const onActive = enroll.root()
const onBackground = enroll.root()
const onInActive = enroll.root()

let previousAppState = AppState.currentState

const changeListener = nextAppState => {
  switch (previousAppState) {
    case APP_STATES.ACTIVE:
      switch (nextAppState) {
        case APP_STATES.INACTIVE:
          onInActive.broadcast(previousAppState, nextAppState)
          break
        case APP_STATES.BACKGROUND:
          onBackground.broadcast(previousAppState, nextAppState)
          break
      }
      break
    case APP_STATES.BACKGROUND:
      switch (nextAppState) {
        case APP_STATES.ACTIVE:
          onActive.broadcast(previousAppState, nextAppState)
          break
        case APP_STATES.INACTIVE:
          onInActive.broadcast(previousAppState, nextAppState)
          break
      }
      break
    case APP_STATES.INACTIVE:
      switch (nextAppState) {
        case APP_STATES.ACTIVE:
          onActive.broadcast(previousAppState, nextAppState)
          break
        case APP_STATES.BACKGROUND:
          onBackground.broadcast(previousAppState, nextAppState)
          break
      }
      break
  }

  if (!previousAppState) {
    previousAppState = nextAppState
    changeListener()
  } else {
    previousAppState = nextAppState
  }
}

AppState.addEventListener("change", changeListener)

export const appState = {
  onActive: onActive.subscribe,
  onBackground: onBackground.subscribe,
  onInActive: onInActive.subscribe,
}
