import { analytics } from "../library"
import isEqual from "lodash.isequal"
import merge from "lodash.merge"
import { join } from "path"
import uuid from "uuid/v4"
import {
  MED_API_AUTH,
  MED_API_CONFIGURATION,
  MED_API_LOCALIZATION,
  MED_API_VIDEO,
  MED_API_VISIT,
} from "../constants"
import { tokenStore } from "../resources"

const OBJECT = Object.prototype.toString()

const redactSensitive = body =>
  Object.entries(body).reduce((redacted, [key, value]) => {
    Object.assign(redacted, {
      [key]:
        Object.prototype.toString.call(value) === OBJECT
          ? redactSensitive(value)
          : "***",
    })

    return redacted
  }, {})

let previousFetch = undefined

const _fetch = (url, options) =>
  new Promise((resolve, reject) => {
    const id = uuid()

    if (!isEqual({ url, options }, previousFetch)) {
      previousFetch = { url, options }

      const { method, headers, body, ..._options } = options || {}
      const { Authorization, ..._headers } = headers || {}

      analytics.trackEvent("fetch", {
        url,
        method: method || "GET",
        ...(Authorization ? { authorization: "Bearer" } : {}),
        ...(options
          ? {
              init: JSON.stringify({
                ..._options,
                ...(method ? { method } : {}),
                ...(headers
                  ? {
                      headers: {
                        ..._headers,
                        ...(Authorization
                          ? { Authorization: "Bearer ***" }
                          : {}),
                      },
                    }
                  : {}),
                ...(body
                  ? {
                      body: redactSensitive(
                        typeof body === "string" ? JSON.parse(body) : body,
                      ),
                    }
                  : {}),
              }),
            }
          : {}),
      })
    }

    fetch(url, options).then(
      response => {
        console.log({
          id,
          url,
          options,
          response,
        })

        response.ok && (response.status < 400 || response.status > 599)
          ? resolve(response)
          : Promise.resolve(
              /\/json/g.test(response.headers.get("content-type"))
                ? response.json()
                : response.text(),
            ).then(body =>
              reject({
                ...response,
                body,
              }),
            )
      },
      error => {
        analytics.trackEvent("fetchError", error)

        console.log({
          id,
          url,
          options,
          error,
        })

        reject(error)
      },
    )
  })

const authenticatedFetch = (url, options = {}) =>
  tokenStore.read().then(token => {
    merge(options, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    return _fetch(url, options)
  })

const createAuthenticatedFetch = hostname => (url, options) =>
  authenticatedFetch(join(hostname, url), options)

const createFetch = hostname => (url, options) => {
  url = join(hostname, url)

  return _fetch(url, options)
}

export const authApi = createFetch(MED_API_AUTH)
export const configurationApi = createFetch(MED_API_CONFIGURATION)
export const videoApi = createAuthenticatedFetch(MED_API_VIDEO)
export const visitApi = createAuthenticatedFetch(MED_API_VISIT)
export const localizationApi = createFetch(MED_API_LOCALIZATION)
export const openVisitApi = createFetch(MED_API_VISIT)
