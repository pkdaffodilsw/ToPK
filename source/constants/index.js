import { Settings, Platform } from "react-native"
import { getInset, getStatusBarHeight } from "react-native-safe-area-view"
import { Header } from "react-navigation-stack"
const env = require("../env.json")

const requiredEnvironmentVariable = variableName =>
  console.log(`Missing required environment variable "${variableName}"`)

const getEnvironmentVariable = (variableName, required) => {
  const variable =
    (Platform.OS === "ios" && Settings.get(variableName)) || env[variableName]

  if (required && !variable) requiredEnvironmentVariable(variableName)

  return variable
}

export const MED_API_VISIT = getEnvironmentVariable("MED_API_VISIT")

export const MED_API_AUTH = getEnvironmentVariable("MED_API_AUTH")

export const MED_API_CONFIGURATION = getEnvironmentVariable(
  "MED_API_CONFIGURATION",
)

export const MED_API_VIDEO = getEnvironmentVariable("MED_API_VIDEO")

export const MED_API_LOCALIZATION = getEnvironmentVariable(
  "MED_API_LOCALIZATION",
)

export const MED_SESSION_TIME = parseInt(
  getEnvironmentVariable("MED_SESSION_TIME"),
  10,
)

export const MED_STRIPE_PUBLISHABLE_KEY = getEnvironmentVariable(
  "MED_STRIPE_PUBLISHABLE_KEY",
)

export const DEBUG =
  env.MED_BUNDLE_IDENTIFIER === undefined ||
  env.MED_BUNDLE_IDENTIFIER === "se.medigital.toothie.debug"

export const DEVELOPMENT =
  env.MED_BUNDLE_IDENTIFIER === "se.medigital.toothie.development"

export const TEST = env.MED_BUNDLE_IDENTIFIER === "se.medigital.toothie.test"

export const PRODUCTION = env.MED_BUNDLE_IDENTIFIER === "se.medigital.toothie"

export const SKU = {
  DentistConsultation: "DentistConsultation8231977",
  DentistConsultationFree: "DentistConsultationFree2680216",
  HygienistConsultation: "HygienistConsultation9023218",
  HygienistConsultationFree: "HygienistConsultationFree1417979",
}

export const keyboardVerticalOffsetWithTabBar = Math.max(
  getStatusBarHeight() + getInset("top"),
  Header.HEIGHT,
)
