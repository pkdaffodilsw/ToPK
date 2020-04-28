import { visitApi } from "./api"
import { throwError } from "../library"

export const updateRequired = ({
  visitId = throwError("Missing parameter 'visitId'"),
} = {}) =>
  visitApi(`/health/updaterequired?visitId=${visitId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then(response =>
    response.ok && response.status === 200
      ? response.json()
      : Promise.reject(response),
  )

const OBJECT = Object.prototype.toString.call({})

const prepareHealthDeclaration = (healthDeclaration, [key, value]) => {
  if (Object.prototype.toString.call(value) === OBJECT) {
    if (Object.prototype.hasOwnProperty.call(value, "hasCondition")) {
      if (value.hasCondition) {
        Object.assign(healthDeclaration, {
          [key]: Object.entries(value).reduce(prepareHealthDeclaration, {}),
        })
      } /* else {
        Object.assign(healthDeclaration, { [key]: { hasCondition: false } })
      } */
    } else {
      Object.assign(healthDeclaration, {
        [key]: Object.entries(value).reduce(prepareHealthDeclaration, {}),
      })
    }
  } else {
    if (value !== undefined) {
      if (
        Object.prototype.hasOwnProperty.call(value, "length") &&
        value.length > 0
      ) {
        Object.assign(healthDeclaration, { [key]: value })
      } else {
        Object.assign(healthDeclaration, { [key]: value })
      }
    }
  }

  return healthDeclaration
}

// export const update = ({ healthDeclaration }) => ({
//   ...Object.entries(healthDeclaration)
//     .filter(([key]) => !/^set/.test(key))
//     .reduce(prepareHealthDeclaration, {}),
// })

export const update = ({
  visitId = throwError("Missing parameter 'visitId'"),
  healthDeclaration = throwError("Missing parameter 'healthDeclaration'"),
} = {}) => {
  const body = JSON.stringify({
    visitId,
    ...Object.entries(healthDeclaration)
      .filter(([key]) => !/^set/.test(key))
      .reduce(prepareHealthDeclaration, {}),
  })

  return visitApi("/health", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  }).then(response =>
    response.ok && response.status === 200
      ? response.json()
      : Promise.reject(response),
  )
}
