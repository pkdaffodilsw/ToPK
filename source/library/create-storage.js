import AsyncStorage from "@react-native-community/async-storage"
import throwError from "./throw-error"

export const createStorage = (
  storageKey = throwError("A storage key is required"),
) => ({
  read: () =>
    AsyncStorage.getItem(storageKey).then(data =>
      data
        ? JSON.parse(data)
        : Promise.reject(
            new Error(`Could not read ${storageKey} from AsyncStorage`),
          ),
    ),
  update: data => AsyncStorage.setItem(storageKey, JSON.stringify(data)),
  delete: () => AsyncStorage.removeItem(storageKey),
})
