import React from "react"
import { BackHandler, Image, StyleSheet, View } from "react-native"
import { NavigationActions, StackActions } from "react-navigation"
import {
  ActionView,
  Body,
  Caption,
  Content,
  CreateVisitDisabledMessage,
  HeaderBackTitle,
  HeaderTitle,
  ListItem,
  Message,
} from "../components"
import { DEBUG } from "../constants"
import { colors /*, facebookAppEvents */, fonts, Linking } from "../library"
import { Localization, Pictures, Visits } from "../providers"

export const PaymentProviders = ({ navigation }) => {
  const visits = React.useContext(Visits.Context)
  const pictures = React.useContext(Pictures.Context)
  const localization = React.useContext(Localization.Context)
  const strings = localization.getStrings()

  const [swishAvailable, setSwishAvailable] = React.useState(undefined)

  React.useEffect(() => {
    Linking.canOpenURL("swish://")
      .then(canOpen => setSwishAvailable(canOpen))
      .catch(() => setSwishAvailable(null))
  }, [])

  React.useEffect(() => {
    const handler = () => true
    BackHandler.addEventListener("hardwareBackPress", handler)
    return () => BackHandler.removeEventListener("hardwareBackPress", handler)
  }, [])

  const visit = navigation.getParam("visit") || {
    ...(DEBUG
      ? {
          clinicianType: "Dentist",
        }
      : {}),
  }

  const pricing = navigation.getParam("pricing") || {
    ...(DEBUG
      ? {
          price: 29500,
          currency: "SEK",
        }
      : {}),
  }

  const [loading, setLoading] = React.useState(false)

  const checkCurrentVisitsBeforeNavigate = routeName => {
    if (!loading) {
      setLoading(true)

      return visits.read().then(_visits => {
        if (
          _visits.filter(
            ({ status, id }) =>
              status === "Active" ||
              status === "Queued" ||
              (status === "Draft" && id !== visit.id),
          ).length === 0
        ) {
          setLoading(false)
          pictures.clear()

          // facebookAppEvents.initiatedCheckout(pricing.price, {
          //   currency: pricing.currency,
          // })

          navigation.navigate({
            routeName,
            params: {
              visit,
              pricing,
            },
          })
        } else {
          visits
            .read()
            .then(() => {
              setLoading(false)
            })
            .catch(() => setLoading(false))
        }
      })
    }
  }

  return (
    <>
      <HeaderTitle>{strings.paymentProviders.headerTitle}</HeaderTitle>

      <HeaderBackTitle>{strings.common.back}</HeaderBackTitle>

      {visits.state.draft && visits.state.draft.id !== visit.id ? (
        <Message
          onPress={() => {
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
          }}
        >
          {strings.node.draftNotCurrent}
        </Message>
      ) : (
        <CreateVisitDisabledMessage />
      )}

      <View style={{ backgroundColor: colors.gray50 }}>
        <Content>
          <View
            style={{
              paddingTop: 20,
              paddingBottom: 20,
              marginLeft: 20,
              marginRight: 20,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.gray400,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Body style={{ flex: 1, paddingRight: 20 }}>
              {localization.messages.history.cardTitle({
                clinicianType: visit.clinicianType,
              })}
            </Body>
            <Body style={{ fontFamily: fonts.openSans.semiBold }}>
              {localization.formatCurrency({
                price: pricing.price / 100,
                currency: pricing.currency,
              })}
            </Body>
          </View>
        </Content>
      </View>

      <ActionView>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.gray50,
          }}
        />

        <View style={{ backgroundColor: colors.gray50 }}>
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: colors.gray400,
            }}
          >
            <ListItem
              onPress={() => checkCurrentVisitsBeforeNavigate("PaymentStripe")}
              disabled={loading}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  style={{
                    marginRight: 7,
                    tintColor: colors.secondary,
                  }}
                  source={require("../assets/credit-card.png")}
                />
                <Body style={{ fontFamily: fonts.openSans.semiBold }}>
                  {strings.common.cardPayment}
                </Body>
              </View>
            </ListItem>

            <ListItem
              onPress={() => checkCurrentVisitsBeforeNavigate("PaymentSwish")}
              loading={swishAvailable === undefined}
              disabled={swishAvailable === false || loading}
            >
              <Image source={require("../assets/swish-secondary.png")} />

              {(swishAvailable === false || swishAvailable === null) && (
                <Caption style={{ marginLeft: 39, marginBottom: 5 }}>
                  {strings.paymentProviders.noSwish}
                </Caption>
              )}
            </ListItem>
          </View>
        </View>
      </ActionView>
    </>
  )
}
