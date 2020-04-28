import chroma from "chroma-js"
import get from "lodash.get"
import unset from "lodash.unset"
import React from "react"
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Image,
} from "react-native"
import DateTimePickerModal from "react-native-modal-datetime-picker"
import { getInset, getStatusBarHeight } from "react-native-safe-area-view"
import { Header } from "react-navigation-stack"
import {
  Button,
  CheckBox,
  CreateVisitDisabledMessage,
  Divider,
  HeaderTitle,
  ListItem,
  Markdown,
  Radio,
  TextInput,
  Title,
  Body,
} from "../components"
import { colors, createSchemaContainer, fonts, textStyles } from "../library"
import {
  Localization,
  QuestionTree as QuestionTreeProvider,
  Visits,
} from "../providers"

const { width: windowWidth } = Dimensions.get("window")

const icons = {
  aestheticDentistry: require("../assets/aesthetic-dentistry.png"),
  crown: require("../assets/crown.png"),
  damagedTooth: require("../assets/damaged-tooth.png"),
  dentalFear: require("../assets/dental-fear.png"),
  gums: require("../assets/gums.png"),
  jaws: require("../assets/jaws.png"),
  other: require("../assets/other.png"),
  sensitiveTeeth: require("../assets/sensitive-teeth.png"),
  toothache: require("../assets/toothache.png"),
  wisdomTeeth: require("../assets/wisdom-teeth.png"),
}

const messageShadow = {
  shadowColor: colors.gray900,
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.23,
  shadowRadius: 2.2,
  elevation: 2,
}

const WarningMessage = props => (
  <View
    style={{
      padding: 20,
      backgroundColor: colors.secondaryComplementary,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: chroma(colors.secondaryComplementary)
        .darken(0.4)
        .hex(),
      borderRadius: 5,
      ...messageShadow,
      shadowColor: chroma
        .mix(colors.secondaryComplementary, colors.gray700, 0.8)
        .hex(),
    }}
  >
    <Markdown
      style={{
        heading1: {
          ...textStyles.body,
          fontFamily: fonts.openSans.bold,
          marginBottom: 5,
        },
        paragraph: {
          ...textStyles.body,
        },
        listUnorderedItem: {
          ...textStyles.body,
          flexDirection: "row",
          justifyContent: "flex-start",
          marginTop: 5,
          marginBottom: 5,
        },
        listUnorderedItemIcon: {
          marginRight: 10,
          lineHeight: textStyles.body.lineHeight,
        },
      }}
      {...props}
    ></Markdown>
  </View>
)

const Description = props => (
  <View
    style={{
      padding: 20,
      backgroundColor: colors.primaryComplementary,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: chroma(colors.primaryComplementary)
        .darken(0.4)
        .hex(),
      borderRadius: 5,
      ...messageShadow,
      shadowColor: chroma
        .mix(colors.secondaryComplementary, colors.gray700, 0.8)
        .hex(),
    }}
  >
    <Markdown
      style={{
        heading1: {
          ...textStyles.body,
          fontFamily: fonts.openSans.bold,
          marginBottom: 5,
        },
        paragraph: {
          ...textStyles.body,
        },
      }}
      {...props}
    ></Markdown>
  </View>
)

const TimePicker = ({ value, onConfirm, onCancel, children, ...props }) => {
  const [visible, setVisible] = React.useState(false)

  const show = () => setVisible(true)

  return (
    <>
      <DateTimePickerModal
        isVisible={visible}
        value={new Date(value)}
        onConfirm={date => {
          setVisible(false)
          onConfirm && onConfirm(date)
        }}
        onCancel={() => {
          setVisible(false)
          onCancel && onCancel()
        }}
        {...props}
      />

      {children(show)}
    </>
  )
}

export const QuestionTree = ({ navigation }) => {
  const questionTree = React.useContext(QuestionTreeProvider.Context)
  const visits = React.useContext(Visits.Context)
  const {
    questionTreeResources: translations,
    getStrings,
    format,
  } = React.useContext(Localization.Context)

  const strings = getStrings()

  React.useEffect(() => {
    if (navigation.getParam("headerBackTitle") !== strings.common.back) {
      navigation.setParams({ headerBackTitle: strings.common.back })
    }
  }, [strings.common.back, navigation])

  const formDisabled = Boolean(visits.state.queued || visits.state.active)

  const stateRootPath = navigation.getParam("stateRootPath")

  const schemaContainer = createSchemaContainer({
    schema: stateRootPath
      ? questionTree.additionalSchema.get(stateRootPath)
      : questionTree.state.tree,
    schemaPath: navigation.getParam("schemaPath"),
    stateRootPath,
    getState: () => questionTree.answers,
    setState: questionTree.setAnswers,
  })

  const {
    branch = {},
    items,
    required,
    statePath,
    firstQuestion,
  } = schemaContainer

  const getNavigateParams = nextSchemaContainer => {
    const next = nextSchemaContainer || schemaContainer.next()

    if (!next) {
      return {
        routeName:
          (schemaContainer.parent && schemaContainer.parent.app_nextScreen) ||
          "Images",
        params: {
          onBehalfOf: navigation.getParam("onBehalfOf"),
        },
      }
    }

    if (Object.prototype.toString.call(next) !== "[object Error]") {
      if (next.stateRootPath) {
        questionTree.additionalSchema.set(next.stateRootPath, next.schema)
      }

      return {
        routeName: "QuestionTree",
        key: JSON.stringify([next.schemaPath, next.stateRootPath]),
        params: {
          schemaPath: next.schemaPath,
          stateRootPath: next.stateRootPath,
          onBehalfOf: navigation.getParam("onBehalfOf"),
        },
      }
    }
  }

  const uiControl = branch.app_uiControl || ""

  const title =
    branch.title && branch.title.length ? translations[branch.title] : undefined

  const description = branch.description
    ? translations[branch.description]
    : undefined

  const warningMessage =
    schemaContainer.parent.app_warningMessage &&
    translations[schemaContainer.parent.app_warningMessage]

  const skipButton = (
    <View style={{ marginBottom: 6 }}>
      <Button
        basic
        title={strings.common.skip}
        onPress={() => {
          navigation.navigate(getNavigateParams())
          const state = { ...questionTree.answers }
          unset(state, statePath)
          questionTree.setAnswers(state)
        }}
      />
    </View>
  )

  return (
    <>
      <HeaderTitle>{strings.questionTree.headerTitle}</HeaderTitle>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : null}
        contentContainerStyle={{ flex: 1 }}
        keyboardVerticalOffset={Math.max(
          getStatusBarHeight() + getInset("top"),
          Header.HEIGHT,
        )}
      >
        <CreateVisitDisabledMessage navigation={navigation} />

        <ScrollView
          style={{
            flex: 1,
          }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
          }}
          alwaysBounceVertical={false}
          scrollEnabled={!formDisabled}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              ...(branch.oneOf ||
              description ||
              (warningMessage && firstQuestion) ||
              (branch.type === "string" &&
                !branch.enum &&
                branch.format !== "date-time")
                ? {}
                : {
                    marginTop: "auto",
                  }),
              ...(branch.oneOf
                ? {}
                : {
                    maxWidth: windowWidth > 500 ? 500 : undefined,
                    minWidth: windowWidth > 500 ? 500 : windowWidth,
                    marginLeft: "auto",
                    marginRight: "auto",
                  }),
              marginBottom: "auto",
            }}
          >
            {firstQuestion && warningMessage && (
              <View
                style={{
                  paddingTop: 20,
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingBottom: 20,
                }}
              >
                <WarningMessage>{warningMessage}</WarningMessage>
              </View>
            )}

            {description && (
              <View
                style={{
                  paddingTop: 20,
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingBottom: 20,
                }}
              >
                <Description>{description}</Description>
              </View>
            )}

            {title && (
              <>
                <View
                  style={{
                    ...(description ? { marginTop: "auto" } : {}),
                    paddingTop: 30,
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingBottom: 35,
                    justifyContent: "center",
                    alignItems: branch.oneOf ? "flex-start" : "center",
                  }}
                >
                  <Title
                    style={{
                      textAlign: branch.oneOf ? "left" : "center",
                      marginBottom: 5,
                    }}
                  >
                    {title}
                  </Title>
                </View>

                {branch.oneOf && <Divider />}
              </>
            )}

            {branch.oneOf &&
              items.map(({ title, icon, next }, index) => (
                <ListItem
                  key={index}
                  multiline
                  disabled={formDisabled}
                  onPress={() => {
                    navigation.navigate(getNavigateParams(next()))
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingRight: 20,
                    }}
                  >
                    {icon && (
                      <Image
                        style={{
                          marginRight: 12,
                        }}
                        source={icons[icon]}
                      />
                    )}
                    <Body>{translations[title]}</Body>
                  </View>
                </ListItem>
              ))}

            {branch.type === "array" && (
              <View
                style={{
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingBottom: 30,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {items.map(({ title, set }, index) => (
                  <View
                    key={index}
                    style={{
                      paddingBottom: 20,
                    }}
                  >
                    <CheckBox
                      title={translations[title]}
                      onPress={() => {
                        set()
                      }}
                      checked={get(
                        questionTree.answers,
                        statePath,
                        [],
                      ).includes(title)}
                    />
                  </View>
                ))}
              </View>
            )}

            {branch.enum && uiControl !== "button" && (
              <View
                style={{
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingBottom: 30,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {items.map(({ title, set }, index) => (
                  <View key={index} style={{ paddingBottom: 20 }}>
                    <Radio
                      title={translations[title]}
                      onPress={() => {
                        set()
                      }}
                      checked={get(questionTree.answers, statePath) === title}
                    />
                  </View>
                ))}
              </View>
            )}

            {branch.type === "string" &&
              !branch.enum &&
              !(branch.format && branch.format === "date-time") && (
                <View
                  style={{
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingBottom: 30,
                  }}
                >
                  <TextInput
                    multiline
                    value={get(questionTree.answers, statePath)}
                    onChangeText={text => {
                      schemaContainer.set(text)
                    }}
                  />
                </View>
              )}
          </View>

          <View
            style={{
              paddingLeft: 20,
              paddingRight: 20,
              maxWidth: windowWidth > 500 ? 500 : undefined,
              minWidth: windowWidth > 500 ? 500 : windowWidth,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {uiControl === "button" && (
              <View>
                {!required && skipButton}

                {schemaContainer.items.map(({ title, set }, index) => (
                  <View key={index} style={{ marginBottom: 20 }}>
                    <Button
                      primary={get(questionTree.answers, statePath) === title}
                      title={translations[title]}
                      onPress={() => {
                        set()
                        navigation.navigate(getNavigateParams())
                      }}
                    />
                  </View>
                ))}
              </View>
            )}

            {branch.format && branch.format === "date-time" && (
              <TimePicker
                mode="datetime"
                maximumDate={new Date(Date.now())}
                value={get(
                  questionTree.answers,
                  statePath,
                  new Date(Date.now()).toISOString(),
                )}
                onConfirm={date => {
                  schemaContainer.set(date.toISOString())
                }}
                headerTextIOS={strings.questionTree.dateTimePickerHeaderText}
                confirmTextIOS={strings.questionTree.dateTimePickerConfirm}
                cancelTextIOS={strings.common.abort}
              >
                {show => (
                  <View style={{ marginBottom: 20 }}>
                    <Button
                      primary={!get(questionTree.answers, statePath)}
                      title={
                        get(questionTree.answers, statePath)
                          ? format(
                              new Date(get(questionTree.answers, statePath)),
                              "yyyy-MM-dd' 'HH:mm",
                            )
                          : strings.questionTree.dateTimePicker
                      }
                      onPress={show}
                    />
                  </View>
                )}
              </TimePicker>
            )}

            {uiControl !== "button" && !branch.oneOf && (
              <>
                {!required && skipButton}

                <View style={{ marginBottom: 20 }}>
                  <Button
                    primary={get(questionTree.answers, statePath)}
                    disabled={required && !get(questionTree.answers, statePath)}
                    title={strings.common.next}
                    onPress={() => navigation.navigate(getNavigateParams())}
                  />
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  )
}
