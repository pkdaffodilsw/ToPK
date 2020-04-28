import { AppEventsLogger } from "react-native-fbsdk"

// https://github.com/facebook/facebook-ios-sdk/blob/master/FBSDKCoreKit/FBSDKCoreKit/AppEvents/FBSDKAppEvents.m
// https://developers.facebook.com/docs/app-events
// https://developers.facebook.com/docs/analytics/send_data/events/
// https://developers.facebook.com/docs/marketing-api/app-event-api/
// https://sv-se.facebook.com/business/help/402791146561655?id=1205376682832142
// https://stackoverflow.com/questions/40982406/how-to-use-standard-events-in-the-react-native-facebook-sdk

const parameterNames = {
  contentCategory: "content_category",
  contentId: "fb_content_id",
  contentName: "content_name",
  contents: "fb_content",
  contentType: "fb_content_type",
  currency: "fb_currency",
  level: "fb_level",
  maxRatingValue: "fb_max_rating_value",
  numItems: "fb_num_items",
  orderId: "fb_order_id",
  paymentInfoAvailable: "fb_payment_info_available",
  predictedLtv: "predicted_ltv",
  registrationMethod: "fb_registration_method",
  searchString: "fb_search_string",
  status: "status",
  success: "fb_success",
  value: "value",
}

const getContentId = value =>
  Array.isArray(value) ? JSON.stringify(value) : value

const getContents = value =>
  typeof value !== "string" ? JSON.stringify(value) : value

const getParameters = (parameters = {}) => {
  const withValues = Object.entries(parameters).reduce(
    (withValues, [key, value]) => {
      if (value !== null && value !== undefined) {
        const parameterName = parameterNames[key] || key

        Object.assign(withValues, {
          [parameterName]:
            parameterName === parameterNames.contentId
              ? getContentId(value)
              : parameterName === parameterNames.contents
              ? getContents(value)
              : value,
        })
      }

      return withValues
    },
    {},
  )

  return Object.keys(withValues).length ? withValues : undefined
}

// Log this event during a telephone/SMS, email, chat, or other type of contact between a customer and your business.
export const contact = () => AppEventsLogger.logEvent("Contact")

// Log this event during a search performed on your website, app or other property (example: product searches, travel searches).
// Recommended Parameters:
// content_category
// content_ids
// contents
// currency
// search_string
// value
export const searched = (
  parameters = {
    contentCategory: null,
    contentId: null,
    contents: null,
    currency: null,
    searchString: null,
    value: null,
    success: null,
  },
) => AppEventsLogger.logEvent("fb_mobile_search", getParameters(parameters))

// Log this event during the submission of information in exchange for a service provided by your business (example: sign up for email subscription).
// Recommended Parameters:
// content_name
// currency
// status
// value

// registrationMethod
export const completedRegistration = (
  parameters = {
    contentName: null,
    currency: null,
    status: null,
    value: null,
    registrationMethod: null,
  },
) =>
  AppEventsLogger.logEvent(
    "fb_mobile_complete_registration",
    getParameters(parameters),
  )

// Log this event during a visit to a content page you care about, such as a product page, landing page or article.
// Recommended Parameters:
// content_ids*
// content_name
// content_type*
// contents*
// currency
// value
// *Required for Dynamic Ads
export const viewedContent = (
  parameters = {
    contentId: null,
    contentName: null,
    contentType: null,
    contents: null,
    currency: null,
    value: null,
  },
) =>
  AppEventsLogger.logEvent("fb_mobile_content_view", getParameters(parameters))

// Log this event when a person achieves specific levels you define within your application, business, or organization.
export const achievedLevel = (parameters = { level: null }) =>
  AppEventsLogger.logEvent(
    "fb_mobile_level_achieved",
    getParameters(parameters),
  )

// Log this event during the addition of an item to a shopping cart or basket (example: clicking an Add to Cart button on a website).
// Recommended Parameters:
// content_ids*
// content_name
// content_type*
// contents*
// currency
// value
// *Required parameters for Dynamic Ads.

// valueToSum - price of item added
export const addedToCart = (
  price,
  parameters = {
    contentId: null,
    contentName: null,
    contentType: null,
    contents: null,
    currency: null,
    value: null,
  },
) => {
  const args = [
    "fb_mobile_add_to_cart",
    ...(price && parameters
      ? [price, getParameters(parameters)]
      : [getParameters(price)]),
  ]

  return AppEventsLogger.logEvent(...args)
}

// Log this event during the customization of products through a configuration tool or other application your business owns.
export const customizeProduct = () =>
  AppEventsLogger.logEvent("CustomizeProduct")

// Log this event at the start of a checkout process.
// Recommended Parameters:
// content_category
// content_ids
// contents
// currency
// num_items
// value

// content_type
// payment_info_available

// valueToSum - total price of items in cart
export const initiatedCheckout = (
  totalPrice,
  parameters = {
    contentCategory: null,
    contentId: null,
    contents: null,
    currency: null,
    numItems: null,
    value: null,
    contentType: null,
    paymentInfoAvailable: null,
  },
) => {
  const args = [
    "fb_mobile_initiated_checkout",
    ...(totalPrice && parameters
      ? [totalPrice, getParameters(parameters)]
      : [getParameters(totalPrice)]),
  ]

  return AppEventsLogger.logEvent(...args)
}

// Log this event at the start of a free trial of a product or service you offer (example: trial subscription).
// Recommended Parameters:
// currency
// predicted_ltv
// value

// order_id

// valueToSum - price of subscription
export const startTrial = (
  price,
  parameters = {
    currency: null,
    predictedLtv: null,
    value: null,
    orderId: null,
  },
) => {
  const args = [
    "StartTrial",
    ...(price && parameters
      ? [price, getParameters(parameters)]
      : [getParameters(price)]),
  ]

  return AppEventsLogger.logEvent(...args)
}

// Log this event during the booking of an appointment to visit one of your locations.
export const schedule = () => AppEventsLogger.logEvent("Schedule")

// Log this event during a rating of something within your app, business, or organization (example: rates a restaurant within a restaurant review app).
// fb_content_type
// fb_content_id
// fb_max_rating_value
// valueToSum - rating given
export const rated = (
  rating,
  parameters = {
    contentType: null,
    contentId: null,
    maxRatingValue: null,
  },
) => {
  const args = [
    "fb_mobile_rate",
    ...(rating && parameters
      ? [rating, getParameters(parameters)]
      : [getParameters(rating)]),
  ]

  return AppEventsLogger.logEvent(...args)
}

// Log this event during the completion of a purchase, usually signified by receiving order/purchase confirmation or a transaction receipt
// If you use Facebook to manage your in-app purchases, the purchase events are automatically logged.
// Required Parameters:
// currency
// value
// Recommended Parameters:
// content_ids*
// content_name
// content_type*
// contents*
// num_items
// *Required for Dynamic Ads
export const purchased = (
  value,
  currency,
  parameters = {
    contentId: null,
    contentName: null,
    contentType: null,
    contents: null,
    numItems: null,
  },
) =>
  AppEventsLogger.logPurchase(value / 100, currency, getParameters(parameters))

// Log this event during the addition of customer payment information during a checkout process.
// Recommended Parameters:
// content_category
// content_ids
// contents
// currency
// value
export const addedPaymentInfo = (
  parameters = {
    contentCategory: null,
    contentId: null,
    contents: null,
    currency: null,
    value: null,
  },
) =>
  AppEventsLogger.logEvent(
    "fb_mobile_add_payment_info",
    getParameters(parameters),
  )
