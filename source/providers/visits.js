import merge from "lodash.merge"
import React from "react"
import { readClinicianProfilePicture, readVisit, readVisits } from "../api"
import { usePolling } from "../hooks"
import * as NavigationHistory from "./navigation-history"

const disabledRoutes = [
  "Initialize",
  "Login",
  "Authenticate",
  "Verify",
  "Upgrade",
  "Registration",
  "TermsOfService",
]

// [ Draft, Queued, Active, Closed, Canceled, Abandoned ]
const visitStatus = {
  draft: "Draft",
  queued: "Queued",
  active: "Active",
  closed: "Closed",
  canceled: "Canceled",
  abandoned: "Abandoned",
}

const visitStatusKeys = Object.keys(visitStatus)

const actionTypes = {
  readVisits: "readVisits",
  readVisitsSuccess: "readVisitsSuccess",
  readVisitsError: "readVisitsError",
  readVisit: "readVisit",
  readVisitSuccess: "readVisitSuccess",
  readVisitError: "readVisitError",
  refresh: "refresh",
  readClinicianProfilePicture: "readClinicianProfilePicture",
  readClinicianProfilePictureSuccess: "readClinicianProfilePictureSuccess",
  readClinicianProfilePictureError: "readClinicianProfilePictureError",
  reset: "reset",
}

const initialState = {
  byId: {},
  error: undefined,
  loading: false,
  refreshing: false,
  draft: {},
  queued: undefined,
  active: undefined,
  closed: {},
  canceled: {},
  abandoned: {},
  clinicianProfilePicture: {
    loading: false,
    picture: undefined,
  },
}

const getNextState = (state, visits) =>
  visits.reduce(
    (nextState, visit) => {
      merge(nextState, {
        byId: {
          [visit.id]: merge(nextState.byId[visit.id] || {}, visit),
        },
      })

      switch (visit.status) {
        case visitStatus.draft:
          Object.assign(nextState, {
            draft: merge(nextState.byId[visit.id], visit),
          })

          return nextState
        case visitStatus.queued:
          Object.assign(nextState, {
            queued: merge(nextState.byId[visit.id], visit),
          })

          return nextState
        case visitStatus.active: {
          Object.assign(nextState, {
            active: merge(nextState.byId[visit.id], visit),
          })

          return nextState
        }
        case visitStatus.closed:
          return merge(nextState, {
            closed: { [visit.id]: visit },
          })
        case visitStatus.canceled:
          return merge(nextState, {
            canceled: { [visit.id]: visit },
          })
        case visitStatus.abandoned:
          return merge(nextState, {
            abandoned: { [visit.id]: visit },
          })
        default:
          return nextState
      }
    },
    {
      byId: state.byId,
      ...Object.entries(initialState)
        .filter(([key]) => visitStatusKeys.includes(key))
        .reduce(
          (initialState, [key, value]) => merge(initialState, { [key]: value }),
          {},
        ),
    },
  )

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.readVisits:
      return {
        ...state,
        loading: true,
      }
    case actionTypes.readVisitsSuccess: {
      const nextState = getNextState(state, action.visits)

      return {
        ...state,
        loading: false,
        refreshing: false,
        error: undefined,
        ...nextState,
        ...(state.active &&
        nextState.active &&
        state.active.id !== nextState.active.id
          ? {
              clinicianProfilePicture: {
                ...initialState.clinicianProfilePicture,
              },
            }
          : {}),
      }
    }
    case actionTypes.readVisitsError:
      return {
        ...state,
        loading: false,
        refreshing: false,
        error: action.error,
      }
    case actionTypes.refresh:
      return {
        ...state,
        refreshing: true,
      }
    case actionTypes.readVisit:
      return { ...state, loading: true }
    case actionTypes.readVisitSuccess:
      return {
        ...state,
        loading: false,
        ...getNextState(
          state,
          Object.values(state.byId).map(visit =>
            visit.id === action.visit.id ? merge(visit, action.visit) : visit,
          ),
        ),
      }
    case actionTypes.readVisitError:
      return {
        ...state,
        loading: false,
        error:
          action.error &&
          action.error.message &&
          action.error.message.match(/expired/)
            ? undefined
            : action.error,
      }
    case actionTypes.readClinicianProfilePicture:
      return {
        ...state,
        clinicianProfilePicture: {
          ...state.clinicianProfilePicture,
          loading: true,
        },
      }
    case actionTypes.readClinicianProfilePictureSuccess:
      return {
        ...state,
        clinicianProfilePicture: {
          loading: false,
          picture: action.picture,
        },
      }
    case actionTypes.readClinicianProfilePictureError:
      return {
        ...state,
        clinicianProfilePicture: {
          loading: false,
          picture: undefined,
        },
      }
    case actionTypes.reset:
      return { ...initialState }
    default:
      return state
  }
}

const useVisits = () => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const { history } = React.useContext(NavigationHistory.Context)
  const currentRouteName = (history.slice(-1).pop() || {}).routeName

  const read = React.useCallback(() => {
    if (!state.loading && !disabledRoutes.includes(currentRouteName)) {
      dispatch({ type: actionTypes.readVisits })

      return readVisits()
        .then(visits => {
          dispatch({ type: actionTypes.readVisitsSuccess, visits })
          return visits
        })
        .catch(error => dispatch({ type: actionTypes.readVisitsError, error }))
    }
  }, [currentRouteName, state.loading])

  const fetched = React.useRef()

  React.useEffect(() => {
    if (fetched.current !== currentRouteName) {
      fetched.current = currentRouteName
      read()
    }
  }, [currentRouteName, history, read])

  const { id: visitId } = state.active || state.queued || {}

  usePolling(
    poll => {
      dispatch({ type: actionTypes.readVisit })

      readVisit({ visitId })
        .then(visit => {
          dispatch({ type: actionTypes.readVisitSuccess, visit })
          poll()
        })
        .catch(error => dispatch({ type: actionTypes.readVisitError, error }))
    },
    state.active
      ? 3000
      : Boolean(state.queued) && currentRouteName === "History"
      ? 3000
      : state.queued
      ? 30000
      : null,
  )

  const { clinician } = state.active || state.queued || {}
  const { id: clinicianId, profilePicture } = clinician || {}
  const { id: profilePictureId } = profilePicture || {}

  React.useEffect(() => {
    if ((clinicianId, profilePictureId)) {
      dispatch({ type: actionTypes.readClinicianProfilePicture })

      readClinicianProfilePicture({ clinicianId, profilePictureId })
        .then(picture => {
          dispatch({
            type: actionTypes.readClinicianProfilePictureSuccess,
            picture,
          })
        })
        .catch(error => {
          dispatch({
            type: actionTypes.readClinicianProfilePictureError,
            error,
          })
        })
    }
  }, [clinicianId, profilePictureId])

  const refresh = () => {
    dispatch({ type: actionTypes.refresh })

    return readVisits()
      .then(visits => {
        dispatch({ type: actionTypes.readVisitsSuccess, visits })
        return visits
      })
      .catch(error => dispatch({ type: actionTypes.readVisitsError, error }))
  }

  const setInitial = () => dispatch({ type: actionTypes.reset })

  return { state, read, refresh, setInitial }
}

export const Context = React.createContext()

export const Provider = props => {
  const visits = useVisits()

  return <Context.Provider value={visits} {...props} />
}
