import React from "react"
import { Image, StyleSheet, Text, View } from "react-native"
import { colors, fonts } from "../library"
import { Visits, Localization } from "../providers"

const icons = {
  start: require("../assets/home.png"),
  history: require("../assets/calendar.png"),
  profilestack: require("../assets/user.png"),
}

export const TabBarIcon = ({
  navigation: {
    state: { routeName },
  },
  tintColor,
  horizontal,
}) => {
  const {
    state: { active, queued },
  } = React.useContext(Visits.Context)
  const strings = React.useContext(Localization.Context).getStrings()

  return (
    <View style={horizontal ? { paddingRight: 35 } : {}}>
      <Image
        source={icons[routeName.toLowerCase()]}
        style={[styles.image, { tintColor }]}
      />
      {routeName === "History" && (active || queued) && (
        <View
          style={{
            position: "absolute",
            ...(horizontal
              ? {
                  top: -15,
                  left: 15,
                }
              : {
                  top: -9,
                  left: 15,
                }),
          }}
        >
          <View
            style={{
              backgroundColor: colors.primary,
              height: 18,
              minWidth: 18,
              borderRadius: 9,
              paddingLeft: 9,
              paddingRight: 9,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: colors.primary,
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 0.27,
              shadowRadius: 4.65,
              elevation: 0,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                lineHeight: 17,
                fontFamily: fonts.openSans.regular,
                color: "#FFF",
                marginTop: -1,
              }}
            >
              {active
                ? strings.visits.active
                : queued && queued.queuedVisitStatus === "Rescheduling"
                ? strings.visits.rescheduling
                : queued
                ? strings.visits.queue
                : null}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  image: {
    width: 25,
    height: 25,
    resizeMode: "contain",
  },
})
