import { isAfter } from "date-fns"
import get from "lodash.get"
import merge from "lodash.merge"
import { createStorage } from "../library/create-storage"

const storage = createStorage("med.localization")

export const localizationStore = {
  read: ({ locale, resourceGroupId, updated }) =>
    storage.read().then(
      localeData => {
        const cached = get(localeData, `${locale}.${resourceGroupId}`)

        if (cached) {
          if (updated) {
            if (isAfter(new Date(updated), new Date(cached.updated))) {
              return null
            } else {
              return cached.resources
            }
          } else {
            return cached.resources
          }
        } else {
          return null
        }
      },
      () => Promise.resolve(null),
    ),
  update: ({ locale, resourceGroupId, resources, updated }) =>
    updated
      ? storage
          .read()
          .then(
            data => data,
            () => ({}),
          )
          .then(data => {
            merge(data, {
              [locale]: { [resourceGroupId]: { resources, updated } },
            })

            return storage.update(data)
          })
      : Promise.resolve(),
}
