import { createStorage } from "../library/create-storage"
import merge from "lodash.merge"

const storage = createStorage("med.user")

export const bankIdStore = {
  read: storage.read,
  update: data =>
    storage
      .read()
      .then(
        user => user,
        () => ({}),
      )
      .then(user => storage.update(merge({}, user, data))),
  delete: storage.delete,
}
