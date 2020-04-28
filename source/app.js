import compareVersions from "compare-versions"
import get from "lodash.get"
import React from "react"
import { AppState, Platform } from "react-native"
import { getVersion } from "react-native-device-info"
import {
  createAppContainer,
  createSwitchNavigator,
  NavigationActions,
} from "react-navigation"
import { createStackNavigator } from "react-navigation-stack"
import { createBottomTabNavigator } from "react-navigation-tabs"
import { readConfiguration, readVisit, readVisits } from "./api"
import { Abort, TabBarIcon, TabBarLabel } from "./components"
import { appState, colors } from "./library"
import {
  Configuration,
  HealthDeclaration,
  Localization,
  NavigationHistory,
  Notifications,
  Pictures,
  Privacy,
  QuestionTree,
  Visits,
  User,
} from "./providers"
import { tokenStore } from "./resources"
import * as screens from "./screens"
import { activateKeepAwake, deactivateKeepAwake } from "expo-keep-awake"

const AppContainer = createAppContainer(
  createSwitchNavigator(
    {
      Initialize: {
        screen: screens.Initialize,
      },
      Upgrade: {
        screen: screens.Upgrade,
      },
      Login: {
        screen: screens.Login,
      },
      Authenticate: {
        screen: screens.Authenticate,
      },
      Verify: {
        screen: screens.Verify,
      },
      Onboarding: createStackNavigator(
        {
          Registration: {
            screen: screens.Registration,
          },
          TermsOfService: {
            screen: screens.TermsOfService,
          },
          Notifications: {
            screen: screens.Notifications,
            navigationOptions: {
              headerLeft: null,
              gesturesEnabled: false,
            },
          },
        },
        {
          defaultNavigationOptions: ({ navigation }) => ({
            title: navigation.getParam("headerTitle"),
            headerBackTitle: navigation.getParam("headerBackTitle"),
            headerTruncatedBackTitle: navigation.getParam("headerBackTitle"),
          }),
        },
      ),
      Registered: createStackNavigator(
        {
          RegisteredHome: {
            screen: createBottomTabNavigator(
              {
                Start: createStackNavigator(
                  {
                    Menu: {
                      screen: createStackNavigator(
                        {
                          Main: {
                            screen: screens.Main,
                            navigationOptions: {
                              header: null,
                            },
                          },
                          OnBehalfOf: {
                            screen: screens.OnBehalfOf,
                          },
                          QuestionTree: {
                            screen: screens.QuestionTree,
                          },
                          AestheticDentistry: {
                            screen: screens.AestheticDentistry,
                          },
                          Images: {
                            screen: screens.Images,
                          },
                          IllnessesAilments: {
                            screen: screens.IllnessesAilments,
                            navigationOptions: {
                              headerLeft: null,
                              gesturesEnabled: false,
                            },
                          },
                          Tobacco: {
                            screen: screens.Tobacco,
                          },
                          Allergies: {
                            screen: screens.Allergies,
                          },
                          Pregnancy: {
                            screen: screens.Pregnancy,
                          },
                          PaymentProviders: {
                            screen: screens.PaymentProviders,
                            navigationOptions: {
                              headerLeft: null,
                              gesturesEnabled: false,
                            },
                          },
                          PaymentStripe: {
                            screen: screens.PaymentStripe,
                          },
                          PaymentSwish: {
                            screen: screens.PaymentSwish,
                          },
                          ConfirmFreeVisit: {
                            screen: screens.ConfirmFreeVisit,
                            navigationOptions: {
                              headerLeft: null,
                              gesturesEnabled: false,
                            },
                          },
                        },
                        {
                          initialRouteName: "Main",
                          defaultNavigationOptions: ({ navigation }) => ({
                            headerTitle: navigation.getParam("headerTitle"),
                            headerBackTitle: navigation.getParam(
                              "headerBackTitle",
                            ),
                            headerTruncatedBackTitle: navigation.getParam(
                              "headerBackTitle",
                            ),
                            headerRight: (
                              <Abort
                                navigation={navigation}
                                routeName="RegisteredHome"
                              />
                            ),
                          }),
                        },
                      ),
                      navigationOptions: {
                        header: null,
                      },
                    },
                    FAQ: {
                      screen: screens.FAQ,
                    },
                    Guide: {
                      screen: screens.Guide,
                    },
                  },
                  { initialRouteName: "Menu" },
                ),
                History: {
                  screen: screens.History,
                },
                ProfileStack: createStackNavigator(
                  {
                    Profile: {
                      screen: screens.Profile,
                      navigationOptions: {
                        header: null,
                      },
                    },
                    ContactInformation: {
                      screen: screens.ContactInformation,
                    },
                    Settings: {
                      screen: screens.Settings,
                    },
                    Legal: {
                      screen: screens.Legal,
                    },
                  },
                  {
                    defaultNavigationOptions: ({ navigation }) => ({
                      title: navigation.getParam("headerTitle"),
                      headerBackTitle: navigation.getParam("headerBackTitle"),
                      headerTruncatedBackTitle: navigation.getParam(
                        "headerBackTitle",
                      ),
                    }),
                  },
                ),
              },
              {
                initialRouteName: "Start",
                tabBarOptions: {
                  activeTintColor: colors.secondary,
                  inactiveTintColor: colors.gray700,
                  style: {
                    backgroundColor: colors.gray50,
                  },
                  keyboardHidesTabBar: Platform.OS === "android",
                },
                defaultNavigationOptions: ({ navigation }) => ({
                  tabBarIcon: Object.assign(
                    props => <TabBarIcon navigation={navigation} {...props} />,
                    { displayName: "RegisteredHome.TabBarIcon" },
                  ),
                  tabBarLabel: Object.assign(
                    props => <TabBarLabel {...props} />,
                    { displayName: "RegisteredHome.TabBarLabel" },
                  ),
                }),
              },
            ),
          },
          Camera: {
            screen: screens.Camera,
          },
          IncomingCall: {
            screen: screens.IncomingCall,
          },
          Call: {
            screen: screens.Call,
            navigationOptions: {
              gesturesEnabled: false,
            },
          },
          Feedback: {
            screen: screens.Feedback,
            navigationOptions: {
              gesturesEnabled: false,
            },
          },
        },
        {
          mode: "modal",
          headerMode: "none",
        },
      ),
    },
    { initialRouteName: "Initialize" },
  ),
)

const Root = () => {
  const { appContainerProps, history } = React.useContext(
    NavigationHistory.Context,
  )

  const {
    state: { active, queued },
  } = React.useContext(Visits.Context)

  const navigate = React.useCallback(
    (route, params) => {
      appContainerProps.ref.current &&
        appContainerProps.ref.current.dispatch &&
        appContainerProps.ref.current.dispatch(
          NavigationActions.navigate(
            typeof route === "string" ? { routeName: route, params } : route,
          ),
        )
    },
    [appContainerProps.ref],
  )

  const currentRoute = history.slice(-1)[0] || { routeName: "Initialize" }

  // Check if there is an active call when returning to the app

  React.useEffect(() => {
    const unsubscribe = appState.onActive(() => {
      if (
        currentRoute.routeName !== "Upgrade" &&
        currentRoute.routeName !== "Login" &&
        currentRoute.routeName !== "Authenticate" &&
        currentRoute.routeName !== "Verify" &&
        currentRoute.routeName !== "Registration" &&
        currentRoute.routeName !== "TermsOfService" &&
        currentRoute.routeName !== "Call" &&
        currentRoute.routeName !== "IncomingCall"
      ) {
        readVisits()
          .then(visits => {
            const active = visits.filter(({ status }) => status === "Active")[0]

            return active
              ? readVisit({ visitId: active.id })
              : Promise.resolve()
          })
          .then(visit => {
            visit &&
              visit.call &&
              visit.call.status === "OnGoing" &&
              navigate("IncomingCall")
          })
          .catch(error => {
            console.log(error)
            // check if token has expired
            error &&
              error.message &&
              error.message.match(/expired/) &&
              navigate("Initialize")
          })
      }
    })

    return unsubscribe
  }, [currentRoute.routeName, history, navigate])

  // Navigate to IncomingCall if foregrounded and there's an active call
  const [previousState, setPreviousState] = React.useState()

  React.useEffect(() => {
    const previousId = get(previousState, "call.id")
    const currentId = get(active, "call.id")

    const onGoing =
      get(active, "status") === "Active" &&
      get(active, "call.status") === "OnGoing"

    if (
      AppState.currentState === "active" &&
      typeof currentId === "string" &&
      previousId !== currentId &&
      onGoing &&
      currentRoute.routeName !== "IncomingCall" &&
      currentRoute.routeName !== "Call"
    ) {
      setPreviousState(active)

      navigate({
        routeName: "IncomingCall",
        params: { previousScreen: currentRoute.routeName },
      })
    }
  }, [active, currentRoute.routeName, navigate, previousState])

  // When returning to the app, check if current version has become obsolete
  React.useEffect(
    () =>
      appState.onActive(() =>
        Promise.all([
          getVersion(),
          readConfiguration().then(({ appVersions }) =>
            appVersions
              .filter(({ platform }) => platform.toLowerCase() === Platform.OS)
              .pop(),
          ),
        ]).then(([installedVersion, configuration]) =>
          compareVersions(installedVersion, configuration.minUsableVersion) >= 0
            ? undefined
            : navigate({
                routeName: "Upgrade",
                params: { installedVersion, configuration },
              }),
        ),
      ),
    [navigate],
  )

  React.useEffect(
    () =>
      appState.onActive(() => {
        if (
          ![
            "Initialize",
            "Login",
            "Authenticate",
            "Verify",
            "Upgrade",
            "Call",
          ].includes(currentRoute)
        ) {
          tokenStore.read().catch(() => {
            navigate({ routeName: "Initialize" })
          })
        }
      }),
    [currentRoute, navigate],
  )

  const queuedOrOnGoingCall = queued || get(active, "call.status") === "OnGoing"

  React.useEffect(() => {
    if (queuedOrOnGoingCall) {
      activateKeepAwake()
    } else {
      deactivateKeepAwake()
    }

    return deactivateKeepAwake
  }, [queuedOrOnGoingCall])

  return <AppContainer {...appContainerProps} />
}

export const App = () => (
  <Configuration.Provider>
    <Notifications.Provider>
      <NavigationHistory.Provider>
        <Localization.Provider>
          <QuestionTree.Provider>
            <User.Provider>
              <Pictures.Provider>
                <Visits.Provider>
                  <HealthDeclaration.Provider>
                    <Privacy.Provider>
                      <Root />
                    </Privacy.Provider>
                  </HealthDeclaration.Provider>
                </Visits.Provider>
              </Pictures.Provider>
            </User.Provider>
          </QuestionTree.Provider>
        </Localization.Provider>
      </NavigationHistory.Provider>
    </Notifications.Provider>
  </Configuration.Provider>
)
