import chroma from "chroma-js"
import { isBefore, subDays } from "date-fns"
import { deactivateKeepAwake } from "expo-keep-awake"
import get from "lodash.get"
import React from "react"
import {
  Alert,
  Animated,
  Easing,
  Image,
  Platform,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native"
import NotificationsIOS from "react-native-notifications"
import { getInset } from "react-native-safe-area-view"
import { Permissions } from "react-native-unimodules"
import { reschedule } from "../api"
import { Body, Caption, Header, Headline } from "../components"
import { DEBUG, DEVELOPMENT } from "../constants"
import { appState, colors, fonts, Linking, textStyles } from "../library"
import { Localization, Notifications, Visits } from "../providers"
import { bankIdStore } from "../resources"

const getNotificationPermissionStatus = permissions => {
  return !permissions
    ? "unknown"
    : !permissions.badge && !permissions.alert && !permissions.sound
    ? "disabled"
    : !permissions.alert || !permissions.sound
    ? "partial"
    : "enabled"
}

export const History = ({ navigation }) => {
  const [progressViewOffset, setProgressViewOffset] = React.useState(0)

  const { messages, getStrings, formatDistance, format } = React.useContext(
    Localization.Context,
  )

  const strings = getStrings()
  const visits = React.useContext(Visits.Context)
  const notifications = React.useContext(Notifications.Context)

  const [bankId, setBankId] = React.useState()

  React.useEffect(() => {
    bankIdStore.read().then(setBankId)
  }, [])

  React.useEffect(() => {
    notifications.register()
  }, [notifications])

  const [currentPermissionStatus, setCurrentPermissionStatus] = React.useState()

  React.useEffect(() => {
    if (Platform.OS === "ios") {
      const updatePermissions = () => {
        NotificationsIOS.checkPermissions()
          .then(permissions =>
            setCurrentPermissionStatus(
              getNotificationPermissionStatus(permissions),
            ),
          )
          .catch(console.log)
      }

      updatePermissions()

      return appState.onActive(updatePermissions)
    }
  }, [])

  const spinnerAnimationValue = React.useRef(new Animated.Value(0))

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(spinnerAnimationValue.current, {
        toValue: 360,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false,
      }),
    ).start()
  }, [])

  const queuedOrOnGoing =
    visits.state.queued || get(visits, "state.active.call.status") === "OnGoing"

  React.useEffect(() => {
    if (queuedOrOnGoing) {
      Permissions.askAsync(Permissions.CAMERA, Permissions.AUDIO_RECORDING)
        .then(console.log)
        .catch(console.log)
    }

    return deactivateKeepAwake
  }, [queuedOrOnGoing])

  return (
    <>
      <View style={styles.container}>
        <View
          onLayout={({
            nativeEvent: {
              layout: { height },
            },
          }) => setProgressViewOffset(height)}
        >
          <View style={styles.headerContainer}>
            <Image
              style={{
                tintColor: colors.primary,
                resizeMode: "contain",
                height: textStyles.body.lineHeight,
                marginBottom: 3,
              }}
              source={require("../assets/calendar.png")}
            />

            <Header title={strings.history.title}></Header>
          </View>
        </View>

        <SectionList
          contentContainerStyle={{ paddingBottom: 20 }}
          onRefresh={() => {
            visits.refresh()
          }}
          refreshing={visits.state.refreshing}
          progressViewOffset={progressViewOffset}
          ListHeaderComponent={() => (
            <>
              <Body style={styles.description}>
                {strings.history.description}
              </Body>

              {currentPermissionStatus !== "enabled" &&
                (visits.state.active || visits.state.queued) && (
                  <View
                    style={{
                      flexDirection: "row",
                      paddingLeft: 20,
                      paddingRight: 20,
                      marginTop: 10,
                      marginBottom: 10,
                    }}
                  >
                    <View
                      style={{
                        paddingRight: 8,
                        paddingTop:
                          (textStyles.caption.lineHeight -
                            textStyles.caption.fontSize) /
                          2,
                      }}
                    >
                      <Image
                        style={{ tintColor: colors.primary }}
                        source={require("../assets/bell.png")}
                      ></Image>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Caption>
                        {Platform.select({
                          android: strings.notifications.unknown,
                          ios:
                            strings.notifications[
                              getNotificationPermissionStatus(
                                notifications.permissions,
                              )
                            ],
                        })}
                      </Caption>

                      {Platform.OS === "ios" && (
                        <TouchableOpacity
                          onPress={() =>
                            Linking.openURL(
                              "app-settings://notification/toothie",
                            )
                          }
                        >
                          <Caption
                            style={{
                              fontFamily: fonts.openSans.bold,
                              color: colors.secondary,
                              paddingTop: 8,
                            }}
                          >
                            {strings.notifications.openSettings}
                          </Caption>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
            </>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Headline style={styles.sectionHeader}>{title}</Headline>
          )}
          renderItem={({ section, item }) => {
            const onPress =
              section.name === "active" &&
              item.call &&
              item.call.status === "OnGoing"
                ? () => navigation.navigate("Call")
                : item.queuedVisitStatus === "Rescheduling"
                ? () => {
                    Alert.alert(
                      strings.history.alertTitle,
                      strings.history.alertMessage,
                      [
                        {
                          text: strings.history.alertNegative,
                          style: "destructive",
                          onPress: () => {
                            reschedule
                              .cancel({ queuedVisitId: item.queuedVisitId })
                              .then(() => visits.refresh())
                          },
                        },
                        {
                          text: strings.history.alertPositive,
                          onPress: () => {
                            reschedule
                              .confirm({ queuedVisitId: item.queuedVisitId })
                              .then(() => visits.refresh())
                          },
                        },
                      ],
                      { cancelable: true },
                    )
                  }
                : undefined

            const loading = item.status === "Queued"

            return (
              <TouchableOpacity onPress={onPress} disabled={!onPress}>
                <View
                  key={item.id}
                  style={{
                    backgroundColor: colors.gray50,
                    marginLeft: 16,
                    marginRight: 16,
                    marginBottom: 14,
                    marginTop: 3,
                    borderRadius: 5,
                    ...(item.status === "Active" || item.status === "Queued"
                      ? {
                          borderWidth: StyleSheet.hairlineWidth,
                          borderColor: chroma(
                            colors[
                              item.status === "Active"
                                ? "primaryComplementary"
                                : item.status === "Queued"
                                ? "secondaryComplementary"
                                : "gray200"
                            ],
                          )
                            .darken(0.4)
                            .hex(),
                          shadowColor: chroma
                            .mix(
                              colors[
                                item.status === "Active"
                                  ? "primaryComplementary"
                                  : item.status === "Queued"
                                  ? "secondaryComplementary"
                                  : "gray200"
                              ],
                              colors.gray700,
                              0.8,
                            )
                            .hex(),
                          shadowOffset: {
                            width: 0,
                            height: 2,
                          },
                          shadowOpacity: 0.23,
                          shadowRadius: 2.2,
                          // elevation: 2,
                        }
                      : {}),
                  }}
                >
                  <View
                    style={[
                      styles.card,
                      styles[section.name + "Card"],
                      ...(item.status === "Active" &&
                      item.call &&
                      item.call.status === "Failed"
                        ? [styles.errorCard]
                        : [{}]),
                    ]}
                  >
                    <View style={styles.cardContent}>
                      <Caption
                        style={{
                          marginBottom: 6,
                          color: colors.gray700,
                        }}
                      >
                        {item.status === "Queued" &&
                        item.queue &&
                        item.queuedVisitStatus === "Rescheduling"
                          ? strings.history.rescheduling
                          : item.status === "Queued" && item.queue
                          ? messages.history.future({
                              distance: formatDistance(
                                new Date(
                                  Date.now() +
                                    visits.state.queued.queue.timeEstimation
                                      .estimatedSeconds *
                                      1000,
                                ),
                                new Date(Date.now()),
                              ),
                            })
                          : item.status === "Active"
                          ? strings.history.now
                          : isBefore(
                              new Date(item.createdUtc),
                              subDays(new Date(Date.now()), 5),
                            )
                          ? format(new Date(item.createdUtc), "PPp")
                          : messages.history.past({
                              distance: formatDistance(
                                new Date(item.createdUtc),
                                new Date(Date.now()),
                              ),
                            })}
                      </Caption>

                      <Body
                        style={{
                          marginBottom:
                            item.patientName !== get(bankId, "name") ? 0 : 6,
                          ...(item.queuedVisitStatus === "Rescheduling"
                            ? {
                                color: colors.gray700,
                              }
                            : {}),
                        }}
                      >
                        {messages.history.cardTitle({
                          clinicianType: item.clinicianType || "Unknown",
                        })}
                      </Body>

                      {item.patientName !== get(bankId, "name") && (
                        <Caption style={{ marginBottom: 8 }}>
                          {messages.history.patient({
                            patientName: item.patientName,
                          })}
                        </Caption>
                      )}

                      {item.clinician && item.clinician.name && (
                        <>
                          <Caption
                            style={{
                              fontFamily: fonts.openSans.bold,
                            }}
                          >
                            {item.clinician.name}
                          </Caption>
                          <Caption>
                            {messages.history.clinicianType({
                              clinicianType: item.clinicianType,
                            })}
                          </Caption>
                        </>
                      )}

                      {item.queuedVisitStatus === "Rescheduling" && (
                        <Caption
                          style={{
                            fontFamily: fonts.openSans.bold,
                          }}
                        >
                          {strings.history.reschedulingMessage}
                        </Caption>
                      )}

                      {item.refundStatus !== "None" && (
                        <View
                          style={{
                            justifyContent: "center",
                            borderTopWidth: StyleSheet.hairlineWidth,
                            borderTopColor: colors.gray400,
                            paddingTop: 10,
                            marginTop: 15,
                          }}
                        >
                          {!!strings.history.refundTitle[
                            item.refundStatus.replace(/^./, m =>
                              m.toLowerCase(),
                            )
                          ] && (
                            <Body style={{ textAlign: "center" }}>
                              {
                                strings.history.refundTitle[
                                  item.refundStatus.replace(/^./, m =>
                                    m.toLowerCase(),
                                  )
                                ]
                              }
                            </Body>
                          )}
                          {!!strings.history.refundDescription[
                            item.refundStatus.replace(/^./, m =>
                              m.toLowerCase(),
                            )
                          ] && (
                            <Caption style={{ textAlign: "center" }}>
                              {
                                strings.history.refundDescription[
                                  item.refundStatus.replace(/^./, m =>
                                    m.toLowerCase(),
                                  )
                                ]
                              }
                            </Caption>
                          )}
                        </View>
                      )}
                    </View>

                    {onPress ? (
                      <View style={styles.chevronContainer}>
                        <Image
                          source={require("../assets/chevron-right.png")}
                          style={[
                            styles.chevron,
                            {
                              tintColor:
                                item.status === "Active"
                                  ? colors.primary
                                  : colors.secondary,
                            },
                          ]}
                        />
                      </View>
                    ) : loading ? (
                      <View style={styles.chevronContainer}>
                        <Animated.Image
                          source={require("../assets/spinner.png")}
                          style={[
                            styles.chevron,
                            {
                              tintColor: colors.secondary,
                            },
                            {
                              transform: [
                                {
                                  rotate: spinnerAnimationValue.current.interpolate(
                                    {
                                      inputRange: [0, 360],
                                      outputRange: ["0deg", "360deg"],
                                    },
                                  ),
                                },
                                { perspective: 1000 },
                              ],
                            },
                          ]}
                        />
                      </View>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            )
          }}
          sections={[
            ...(visits.state.active
              ? [
                  {
                    name: "active",
                    title:
                      visits.state.active.call &&
                      visits.state.active.call.status === "OnGoing"
                        ? strings.history.active
                        : strings.history.callFailed,
                    data: [visits.state.active],
                  },
                ]
              : []),
            ...(visits.state.queued
              ? [
                  {
                    name: "queued",
                    title:
                      visits.state.queued.queuedVisitStatus !== "Rescheduling"
                        ? strings.history.queued
                        : strings.history.requiresAction,
                    data: [visits.state.queued],
                  },
                ]
              : []),
            ...(Object.values(visits.state.closed).length
              ? [
                  {
                    name: "closed",
                    title: strings.history.closed,
                    data: Object.values(visits.state.closed),
                  },
                ]
              : []),
            ...(Object.values(visits.state.canceled).length
              ? [
                  {
                    name: "canceled",
                    title: strings.history.canceled,
                    data: [...Object.values(visits.state.canceled)],
                  },
                ]
              : []),
            ...((DEBUG || DEVELOPMENT) &&
            Object.values(visits.state.draft).length
              ? [
                  {
                    name: "draft",
                    title: strings.history.draft,
                    data: [visits.state.draft],
                  },
                ]
              : []),
            ...((DEBUG || DEVELOPMENT) &&
            Object.values(visits.state.abandoned).length
              ? [
                  {
                    name: "abandoned",
                    title: strings.history.abandoned,
                    data: [...Object.values(visits.state.abandoned)],
                  },
                ]
              : []),
          ]}
          keyExtractor={item => item.id}
        ></SectionList>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: Math.max(getInset("top"), 20) - 20 + 30,
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 10,
  },
  description: {
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  sectionHeader: {
    backgroundColor: "#FFF",
    paddingTop: 10,
    paddingBottom: 6,
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: "baseline",
  },
  card: {
    flexDirection: "row",
    borderRadius: 5,
    borderLeftWidth: 6,
    padding: 15,
  },
  cardContent: {
    flex: 1,
  },
  chevronContainer: {
    paddingLeft: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  chevron: {
    marginLeft: 20,
    resizeMode: "contain",
    height: textStyles.body.lineHeight,
  },
  activeCard: {
    backgroundColor: colors.primaryComplementary,
    borderLeftColor: colors.primary,
  },
  queuedCard: {
    backgroundColor: colors.secondaryComplementary,
    borderLeftColor: colors.secondary,
  },
  closedCard: {
    backgroundColor: colors.gray200,
    borderLeftColor: colors.gray700,
  },
  canceledCard: {
    backgroundColor: colors.gray50,
    borderLeftColor: colors.gray200,
  },
  abandonedCard: {
    backgroundColor: colors.gray50,
    borderLeftColor: colors.gray200,
  },
  draftCard: {
    backgroundColor: colors.gray50,
    borderLeftColor: colors.gray200,
  },
  errorCard: {
    backgroundColor: colors.gray200,
    borderLeftColor: colors.red,
  },
})
