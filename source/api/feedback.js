import { visitApi } from "./api"
import { throwError } from "../library"

export const feedback = ({
  generalComment,
  generalRating = throwError("Missing parameter 'generalRating'"),
  clinicianId = throwError("Missing parameter 'clinicianId'"),
  visitId = throwError("Missing parameter 'visitId'"),
  isAnonymousFeedback = throwError("Missing parameter 'isAnonymousFeedback'"),
} = {}) =>
  visitApi("/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...(generalComment ? { generalComment } : {}),
      generalRating,
      clinicianId,
      visitId,
      isAnonymousFeedback,
    }),
  }).then(response =>
    response.ok && response.status === 201
      ? response.json()
      : Promise.reject(response),
  )
