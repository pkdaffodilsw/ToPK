import { AppRegistry } from "react-native"
import { useScreens } from "react-native-screens"
import { name as appName } from "./app.json"
import { App } from "./source/app"

useScreens()

if (typeof Buffer === "undefined") global.Buffer = require("buffer").Buffer

AppRegistry.registerComponent(appName, () => App)
