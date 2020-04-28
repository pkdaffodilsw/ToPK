import jwtDecode from "jwt-decode"
import React from "react"
import { Platform } from "react-native"
import { analytics } from "../library"

const generateKey = () =>
  Math.random()
    .toString(32)
    .substr(2)

const actionTypes = {
  twilio: {
    onCameraDidStart: "onCameraDidStart",
    onCameraDidStopRunning: "onCameraDidStopRunning", // { error }
    onCameraWasInterrupted: "onCameraWasInterrupted",
    onParticipantAddedAudioTrack: "onParticipantAddedAudioTrack", // { participant, track }
    onParticipantAddedVideoTrack: "onParticipantAddedVideoTrack", // { participant, track, enabled }
    onParticipantDisabledVideoTrack: "onParticipantDisabledVideoTrack", // { participant, track }
    onParticipantDisabledAudioTrack: "onParticipantDisabledAudioTrack", // { participant, track }
    onParticipantEnabledVideoTrack: "onParticipantEnabledVideoTrack", // { participant, track }
    onParticipantEnabledAudioTrack: "onParticipantEnabledAudioTrack", // { participant, track }
    onParticipantRemovedAudioTrack: "onParticipantRemovedAudioTrack", // { participant, track }
    onParticipantRemovedVideoTrack: "onParticipantRemovedVideoTrack", // { participant, track }
    onRoomDidConnect: "onRoomDidConnect", // { roomName, participants }
    onRoomDidDisconnect: "onRoomDidDisconnect", // { roomName, error }
    onRoomDidFailToConnect: "onRoomDidFailToConnect", // { roomName, error }
    onRoomParticipantDidConnect: "onRoomParticipantDidConnect", // { roomName, participant }
    onRoomParticipantDidDisconnect: "onRoomParticipantDidDisconnect", // { roomName, participant }
  },
  connect: "connect",
  connectError: "connectError",
  disconnect: "disconnect",
  disconnectError: "disconnectError",
  toggleLocalAudio: "toggleLocalAudio",
  toggleLocalAudioSuccess: "toggleLocalAudioSuccess",
  toggleLocalAudioError: "toggleLocalAudioError",
  toggleLocalVideo: "toggleLocalVideo",
  // toggleLocalVideoError: "toggleLocalVideoError",
}

const twilioStatus = {
  connecting: "connecting",
  connected: "connected",
  disconnecting: "disconnecting",
  disconnected: "disconnected",
}

const initialState = {
  localAudioEnabled: false,
  localVideoEnabled: true,
  togglingLocalAudio: false,
  roomName: undefined,
  status: twilioStatus.disconnected,
  participants: {},
  error: undefined,
  twilioVideoKey: generateKey(),
  roomCompleted: false,
}

const reducer = (state, action = {}) => {
  switch (action.type) {
    case actionTypes.twilio.onRoomDidConnect:
      // { roomName, participants }
      return {
        ...state,
        status: twilioStatus.connected,
        roomName: action.roomName,
        localVideoEnabled: true,
        participants: {
          ...state.participants,
          ...action.participants.reduce((participants, participant) => {
            Object.assign(participants, {
              [participant.identity]: {
                ...participant,
                audioTrack: undefined,
                videoTrack: undefined,
              },
            })

            return participants
          }, {}),
        },
      }

    case actionTypes.twilio.onRoomDidDisconnect:
      // { roomName, error }
      return {
        ...state,
        status: twilioStatus.disconnected,
        roomName: action.roomName,
        participants: {},
        error: action.error, // "Room completed" when caregiver ends call
        twilioVideoKey: generateKey(),
        localVideoEnabled: false,
        roomCompleted: action.error && /completed/g.test(action.error),
      }

    case actionTypes.twilio.onRoomDidFailToConnect:
      // { roomName, error }
      return {
        ...state,
        status: twilioStatus.disconnected,
        roomName: action.roomName,
        participants: {},
        error: action.error,
        twilioVideoKey: generateKey(),
      }

    case actionTypes.twilio.onRoomParticipantDidConnect:
      // { roomName, participant }
      return {
        ...state,
        participants: {
          ...state.participants,
          [action.participant.identity]: {
            ...action.participant,
            audioTrack: undefined,
            videoTrack: undefined,
          },
        },
      }

    case actionTypes.twilio.onRoomParticipantDidDisconnect:
      // { roomName, participant }
      return {
        ...state,
        participants: Object.entries(state.participants).reduce(
          (participants, [identity, participant]) => {
            action.participant.identity !== identity &&
              Object.assign(participants, { [identity]: participant })
            return participants
          },
          {},
        ),
      }

    case actionTypes.twilio.onParticipantAddedAudioTrack:
      // { participant, track }
      return {
        ...state,
        participants: {
          ...state.participants,
          [action.participant.identity]: {
            ...state.participants[action.participant.identity],
            audioTrack: action.track,
          },
        },
      }

    case actionTypes.twilio.onParticipantDisabledAudioTrack:
      // { participant, track }
      return {
        ...state,
        participants: {
          ...state.participants,
          [action.participant.identity]: {
            ...state.participants[action.participant.identity],
            audioTrack: action.track,
          },
        },
      }

    case actionTypes.twilio.onParticipantEnabledAudioTrack:
      // { participant, track }
      return {
        ...state,
        participants: {
          ...state.participants,
          [action.participant.identity]: {
            ...state.participants[action.participant.identity],
            audioTrack: action.track,
          },
        },
      }

    case actionTypes.twilio.onParticipantRemovedAudioTrack:
      // { participant, track }
      return {
        ...state,
        participants: {
          ...state.participants,
          [action.participant.identity]: {
            ...state.participants[action.participant.identity],
            audioTrack: undefined,
          },
        },
      }

    case actionTypes.twilio.onParticipantAddedVideoTrack:
      // { participant, track }
      return {
        ...state,
        participants: {
          ...state.participants,
          [action.participant.identity]: {
            ...state.participants[action.participant.identity],
            videoTrack: action.track,
          },
        },
      }

    case actionTypes.twilio.onParticipantDisabledVideoTrack:
      // { participant, track }
      return {
        ...state,
        participants: {
          ...state.participants,
          [action.participant.identity]: {
            ...state.participants[action.participant.identity],
            videoTrack: action.track,
          },
        },
      }

    case actionTypes.twilio.onParticipantEnabledVideoTrack:
      // { participant, track }
      return {
        ...state,
        participants: {
          ...state.participants,
          [action.participant.identity]: {
            ...state.participants[action.participant.identity],
            videoTrack: action.track,
          },
        },
      }

    case actionTypes.twilio.onParticipantRemovedVideoTrack:
      // { participant, track }
      return {
        ...state,
        participants: {
          ...state.participants,
          [action.participant.identity]: {
            ...state.participants[action.participant.identity],
            videoTrack: undefined,
          },
        },
      }

    case actionTypes.connect:
      return state.roomName !== action.roomName
        ? {
            ...state,
            status: twilioStatus.connecting,
            roomName: action.roomName,
            roomCompleted: false,
          }
        : !state.roomCompleted
        ? {
            ...state,
            status: twilioStatus.connecting,
            roomName: action.roomName,
          }
        : state

    case actionTypes.connectError:
      return {
        ...state,
        status: twilioStatus.disconnected,
        error: action.error,
      }

    case actionTypes.disconnect:
      return {
        ...state,
        status: twilioStatus.disconnecting,
      }

    case actionTypes.disconnectError:
      return {
        ...state,
        error: action.error,
        status: twilioStatus.disconnected,
      }

    case actionTypes.toggleLocalAudio:
      return {
        ...state,
        togglingLocalAudio: true,
      }

    case actionTypes.toggleLocalAudioSuccess:
      return {
        ...state,
        togglingLocalAudio: false,
        localAudioEnabled: action.localAudioEnabled,
      }

    case actionTypes.toggleLocalAudioError:
      return {
        ...state,
        togglingLocalAudio: false,
        error: action.error,
      }

    // case actionTypes.toggleLocalVideo:
    //   return {
    //     ...state,
    //     localVideoEnabled: Platform.select({
    //       android: !state.localVideoEnabled,
    //       ios: true,
    //     }),
    //   }

    // case actionTypes.toggleLocalVideoError:
    //   return {
    //     ...state,
    //     error: action.error,
    //   }

    default:
      return state
  }
}

const getParticipantViewProps = ({
  identity,
  disconnect,
  participants: _participants,
}) => {
  const participants = Object.values(_participants).filter(
    participant => participant.identity !== identity.current,
  )

  if (participants.length > 1) {
    console.log("getParticipantsViewProps:identity", identity)
    console.log("getParticipantsViewProps:participants", participants)

    disconnect()

    return undefined
  } else if (participants.length === 1) {
    const participant = participants[0]
    const participantSid = participant.sid
    const videoTrackSid =
      participant && participant.videoTrack && participant.videoTrack.trackSid

    return participantSid && videoTrackSid
      ? {
          key: videoTrackSid,
          trackIdentifier: {
            participantSid,
            videoTrackSid,
          },
        }
      : undefined
  } else {
    return undefined
  }
}

export const useTwilioVideo = ({ roomName, accessToken }) => {
  const ref = React.useRef()
  const mounted = React.useRef()
  const identity = React.useRef()
  const [state, _dispatch] = React.useReducer(reducer, initialState)

  React.useEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  })

  const dispatch = React.useCallback((...args) => {
    const { type, ...action } = args[0] || {}
    const includeAction = /error|toggle/i.test(type)

    type &&
      analytics.trackEvent("twilioVideo", {
        type,
        ...(includeAction ? action : {}),
      })

    return mounted.current && _dispatch(...args)
  }, [])

  React.useEffect(() => {
    try {
      const token = jwtDecode(accessToken)
      identity.current = token.grants.identity
    } catch (error) {
      identity.current = undefined
    }
  })

  const toggleLocalAudio = React.useCallback(
    (nextState = !state.localAudioEnabled) => {
      dispatch({ type: actionTypes.toggleLocalAudio })

      return ref.current
        .setLocalAudioEnabled(nextState)
        .then(localAudioEnabled => {
          dispatch({
            type: actionTypes.toggleLocalAudioSuccess,
            localAudioEnabled,
          })

          // analytics.trackEvent("twilioVideo", {type: actionTypes.toggleLocalAudio, enabled: localAudioEnabled})
        })
        .catch(error => {
          dispatch({ type: actionTypes.toggleLocalAudioError, error })
        })
    },
    [dispatch, state.localAudioEnabled],
  )

  // const toggleLocalVideo = React.useCallback(
  //   (nextState = !state.localVideoEnabled) => {
  //     return ref.current
  //       .setLocalVideoEnabled(nextState)
  //       .then(() => {
  //         dispatch({ type: actionTypes.localVideoEnabled })
  //       })
  //       .catch(error => {
  //         dispatch({ type: actionTypes.toggleLocalVideoError, error })
  //       })
  //   },
  //   [dispatch, state.localVideoEnabled],
  // )

  const connect = () => {
    dispatch({ type: actionTypes.connect, roomName })

    analytics.trackEvent("twilioVideo", { type: actionTypes.toggleLocalVideo })

    Promise.all([
      toggleLocalAudio(true),
      ref.current.setLocalVideoEnabled(true),
    ]).then(() => {
      try {
        ref.current.connect({ roomName, accessToken })
      } catch (error) {
        dispatch({ type: actionTypes.connectError, error })
      }
    })
  }

  const disconnect = React.useCallback(() => {
    dispatch({ type: actionTypes.disconnect })

    toggleLocalAudio(false).then(() => {
      try {
        ref.current.disconnect()
        // analytics.trackEvent("twilioVideo", { type: twilioStatus.disconnected })
      } catch (error) {
        dispatch({ type: actionTypes.disconnectError, error })
      }
    })
  }, [dispatch, toggleLocalAudio])

  const flipCamera = () => {
    ref.current.flipCamera()
    analytics.trackEvent("twilioVideo", { type: "flipCamera" })
  }

  const twilioVideoProps = Object.keys(actionTypes.twilio).reduce(
    (props, type) => {
      Object.assign(props, {
        [type]: data => {
          console.log(type, data)

          // analytics.trackEvent("twilioVideo", { type })

          return dispatch({ type, ...data })
        },
      })

      return props
    },
    {
      ref,
      key: Platform.select({
        android: state.twilioVideoKey,
        ios: "twilioVideo",
      }),
    },
  )

  const twilioVideoLocalViewProps = {
    enabled: state.localVideoEnabled,
  }

  const twilioParticipantViewProps =
    !state.disconnecting &&
    getParticipantViewProps({
      identity,
      disconnect,
      participants: state.participants,
    })

  // React.useEffect(() => {
  //   const navigationListener = navigation.addListener("willBlur", () => {
  //     disconnect()
  //   })

  //   return navigationListener.remove
  // }, [disconnect, navigation])

  React.useEffect(() => {
    if (state.error) {
      console.log(state.error)
      // analytics.trackEvent("twilioVideo:error", state.error)
    }
  }, [state.error])

  return {
    state,
    twilioVideoProps,
    twilioVideoLocalViewProps,
    twilioParticipantViewProps,
    connect,
    disconnect,
    toggleLocalAudio,
    // toggleLocalVideo,
    flipCamera,
  }
}

Object.assign(useTwilioVideo, { twilioStatus })
