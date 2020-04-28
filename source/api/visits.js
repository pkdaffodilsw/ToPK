import { prepareFile, throwError } from "../library"
import { visitApi, openVisitApi } from "./api"

export const readVisits = () =>
  visitApi("users/me/visits").then(response =>
    response.ok && response.status === 200
      ? response.json()
      : Promise.reject(response),
  )

export const readVisit = ({
  visitId = throwError("Missing required parameter 'questionTreeId'"),
}) =>
  visitApi(`/visits/${visitId}`).then(response =>
    response.ok && response.status === 200
      ? response.json()
      : Promise.reject(response),
  )

export const createVisit = ({
  questionTreeId = throwError("Missing required parameter 'questionTreeId'"),
  questionTreeAnswer = throwError(
    "Missing required parameter 'questionTreeAnswer'",
  ),
  onBehalfOf,
}) =>
  visitApi("/visits", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      questionTreeId,
      questionTreeAnswer: JSON.stringify(questionTreeAnswer),
      ...(onBehalfOf ? { onBehalfOf } : {}),
    }),
  }).then(response =>
    response.ok && response.status === 201
      ? response.json()
      : Promise.reject(response),
  )

export const createVisitImage = ({ visitId, picture }) =>
  visitApi(`/visits/${visitId}/images`, {
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    body: prepareFile(picture),
  }).then(response =>
    response.ok && response.status === 201
      ? response.json()
      : Promise.reject(response),
  )

export const enqueueVisit = ({
  visitId = throwError("Missing required parameter 'visitId'"),
}) =>
  visitApi(`/visits/${visitId}/enqueue`, {
    method: "POST",
  }).then(response => {
    return response.ok && response.status === 204
      ? response
      : Promise.reject(response)
  })

export const endCall = ({
  callId = throwError("Missing required parameter 'callId'"),
} = {}) =>
  visitApi(`/visits/calls/${callId}/end`, {
    method: "POST",
  }).then(response => {
    return response.ok && response.status === 200
      ? response
      : Promise.reject(response)
  })

export const readClinicianProfilePicture = ({
  clinicianId = throwError("Missing required parameter 'clinicianId'"),
  profilePictureId = throwError(
    "Missing required parameter 'profilePictureId'",
  ),
} = {}) =>
  visitApi(`/visits/${clinicianId}/asset/${profilePictureId}`)
    .then(response => {
      return response.ok && response.status === 200
        ? response.blob()
        : Promise.reject(response)
    })
    .then(
      blob =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()

          reader.addEventListener("error", reject)
          reader.onload = ({ target: { result } }) => {
            reader.removeEventListener("error", reject)
            resolve(result)
          }
          reader.readAsDataURL(blob)
        }),
    )

export const reschedule = {
  confirm: ({
    queuedVisitId = throwError("Missing required parameter 'queuedVisitId'"),
  }) =>
    visitApi(`/queuedvisits/reschedule/${queuedVisitId}/confirm`, {
      method: "POST",
    }).then(response => {
      return response.ok && response.status === 200
        ? response
        : Promise.reject(response)
    }),
  cancel: ({
    queuedVisitId = throwError("Missing required parameter 'queuedVisitId'"),
  }) =>
    visitApi(`/queuedvisits/reschedule/${queuedVisitId}/cancel`, {
      method: "POST",
    }).then(response => {
      return response.ok && response.status === 200
        ? response
        : Promise.reject(response)
    }),
}

export const readInfo = () =>
  openVisitApi("/visits/info").then(response =>
    response.ok && response.status === 200
      ? response.json().then(json => {
          if (
            Object.prototype.hasOwnProperty.call(json, "estiamtedQueueTime")
          ) {
            const { estiamtedQueueTime, ..._ } = json
            return { ..._, estimatedQueueTime: estiamtedQueueTime }
          } else {
            return json
          }
        })
      : Promise.reject(response),
  )
