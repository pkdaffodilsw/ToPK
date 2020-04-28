import { throwError } from "../library"
import { localizationApi } from "./api"

export const readLocales = () =>
  localizationApi(`/localization/locales`).then(response =>
    response.ok && response.status === 200
      ? response.json()
      : Promise.reject(response),
  )

export const readResources = ({
  locale = throwError("Missing parameter 'locale'"),
  resourceGroupId,
}) =>
  localizationApi(
    `/localization/resources?locale=${locale}${
      resourceGroupId ? `&resourceGroupId=${resourceGroupId}` : ``
    }`,
  ).then(response =>
    response.ok && response.status === 200
      ? response.json().then(resources =>
          resources.reduce((combinedResources, { resources }) => {
            Object.assign(combinedResources, resources)
            return combinedResources
          }, {}),
        )
      : Promise.reject(response),
  )
