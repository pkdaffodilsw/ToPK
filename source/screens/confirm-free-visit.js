import React from "react"
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native"
import { NavigationActions, StackActions } from "react-navigation"
import { payments } from "../api"
import {
  Body,
  Button,
  ErrorMessage,
  HeaderBackTitle,
  HeaderTitle,
  Title,
} from "../components"
import { colors, facebookAppEvents, firebaseAnalytics } from "../library"
import { getSku } from "../library/get-sku"
import { Localization, Pictures, Visits } from "../providers"

const { width: windowWidth } = Dimensions.get("window")

export const ConfirmFreeVisit = ({ navigation }) => {
  const pictures = React.useContext(Pictures.Context)
  const localization = React.useContext(Localization.Context)
  const strings = localization.getStrings()

  const {
    state: { draft },
    refresh,
  } = React.useContext(Visits.Context)

  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState()

  return (
    <>
      <HeaderTitle>{strings.confirmFreeVisit.headerTitle}</HeaderTitle>

      <HeaderBackTitle>{strings.common.back}</HeaderBackTitle>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : null}
        contentContainerStyle={{ flex: 1 }}
      >
        {error && (
          <ErrorMessage title={strings.common.generalError}></ErrorMessage>
        )}

        <ScrollView
          style={{
            flex: 1,
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: windowWidth > 500 ? 500 : undefined,
            minWidth: windowWidth > 500 ? 500 : windowWidth,
          }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
            paddingTop: 20,
            paddingLeft: 20,
            paddingRight: 20,
            paddingBottom: 20,
          }}
          alwaysBounceVertical={false}
        >
          <View
            style={{
              marginTop: "auto",
              marginBottom: "auto",
              paddingBottom: 20,
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 10,
              alignItems: "center",
            }}
          >
            <Title style={{ textAlign: "center", marginBottom: 20 }}>
              {strings.confirmFreeVisit.title}
            </Title>
            <Body style={{ textAlign: "center", marginBottom: 30 }}>
              {strings.confirmFreeVisit.description}
            </Body>
          </View>

          <View>
            <Button
              primary
              backgroundColor={colors.green}
              title={strings.common.yes}
              disabled={loading}
              loading={loading}
              onPress={() => {
                setError(undefined)
                setLoading(true)

                payments
                  .confirmFreeVisit({ visitId: draft.id })
                  .then(() => {
                    const { price, currency } =
                      navigation.getParam("pricing") || {}

                    const { clinicianType, treatment } = navigation.getParam(
                      "visit",
                    )

                    facebookAppEvents.purchased(price, currency, {
                      numItems: 1,
                      contentType: "product",
                      contentId: getSku({ clinicianType, treatment, price }),
                    })

                    // facebookAppEvents.schedule()

                    firebaseAnalytics.logPurchase({ currency, value: 0 })

                    return refresh()
                  })
                  .then(() => {
                    pictures.clear()

                    navigation.dispatch(
                      StackActions.reset({
                        index: 0,
                        actions: [
                          NavigationActions.navigate({
                            routeName: "RegisteredHome",
                            action: NavigationActions.navigate({
                              routeName: "History",
                            }),
                          }),
                        ],
                      }),
                    )
                  })
                  .catch(error => {
                    setLoading(false)
                    setError(error || true)
                  })
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  )
}
