import { visitApi } from "./api"

export const readQuestionTree = () =>
  visitApi("/questiontrees/published").then(response =>
    response.ok && response.status === 200
      ? response.json()
      : Promise.reject(response),
  )
