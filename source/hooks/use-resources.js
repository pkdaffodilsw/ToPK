import get from "lodash.get"
import React from "react"
import { localization } from "../api"
import { localizationStore } from "../resources"

export const useResources = (
  { locale, remoteLocales },
  ...resourceGroupIds
) => {
  const [currentResourceGroupIds, setCurrentResourceGroupIds] = React.useState(
    resourceGroupIds,
  )

  React.useEffect(() => {
    if (
      resourceGroupIds.find(
        resource => !currentResourceGroupIds.includes(resource),
      ) ||
      currentResourceGroupIds.find(
        resource => !resourceGroupIds.includes(resource),
      )
    ) {
      setCurrentResourceGroupIds(resourceGroupIds)
    }
  }, [currentResourceGroupIds, resourceGroupIds])

  const [state, dispatch] = React.useReducer(
    (state, action = {}) => {
      switch (action.type) {
        case "read_resource_group_id":
          return {
            ...state,
            [action.resourceGroupId]: {
              ...state[action.resourceGroupId],
              loading: true,
            },
          }
        case "read_resource_group_id_success":
          return {
            ...state,
            [action.resourceGroupId]: {
              ...state[action.resourceGroupId],
              loading: false,
              error: null,
              resources: action.resources,
            },
          }
        case "read_resource_group_id_error":
          return {
            ...state,
            [action.resourceGroupId]: {
              ...state[action.resourceGroupId],
              loading: false,
              error: action.error,
            },
          }
        default:
          throw new TypeError(`Unhandled action type: ${action.type}`)
      }
    },
    currentResourceGroupIds.reduce((initialState, resourceGroupId) => {
      Object.assign(initialState, {
        [resourceGroupId]: {
          loading: false,
          error: null,
          resources: undefined,
        },
      })

      return initialState
    }, {}),
  )

  React.useEffect(() => {
    currentResourceGroupIds.forEach(resourceGroupId => {
      dispatch({ type: "read_resource_group_id", resourceGroupId })

      const updated = get(
        remoteLocales,
        `${locale}.statistics.${resourceGroupId}`,
      )

      localizationStore
        .read({
          locale,
          resourceGroupId,
          updated,
        })
        .then(resources =>
          resources === null
            ? localization.readResources({ locale, resourceGroupId })
            : resources,
        )
        .then(resources => {
          dispatch({
            type: "read_resource_group_id_success",
            resourceGroupId,
            resources,
          })

          return localizationStore.update({
            locale,
            resourceGroupId,
            resources,
            updated,
          })
        })
        .catch(error =>
          dispatch({
            type: "read_resource_group_id_error",
            resourceGroupId,
            error,
          }),
        )
    })
  }, [currentResourceGroupIds, locale, remoteLocales])

  return state
}
