import { isBefore, parse, subYears } from "date-fns"
import get from "lodash.get"
import React from "react"
import {
  BackHandler,
  Dimensions,
  LayoutAnimation,
  Platform,
  StyleSheet,
  View,
} from "react-native"
import { TouchableWithoutFeedback } from "react-native-gesture-handler"
import { health } from "../api"
import {
  ActionView,
  Body,
  Button,
  Caption,
  CheckBoxAlt as CheckBox,
  Content,
  ErrorMessage,
  HeaderBackTitle,
  HeaderTitle,
  Radio,
  TextInput,
  Title,
} from "../components"
import { keyboardVerticalOffsetWithTabBar } from "../constants"
import { colors, fonts, textStyles } from "../library"
import { HealthDeclaration, Localization } from "../providers"
import { bankIdStore } from "../resources"

// if (Platform.OS === "android") {
//   if (UIManager.setLayoutAnimationEnabledExperimental) {
//     UIManager.setLayoutAnimationEnabledExperimental(true)
//   }
// }

const { width: windowWidth } = Dimensions.get("window")

const Category = props => (
  <View style={categoryStyles.container} {...props}></View>
)

const categoryStyles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray400,
  },
})

const CheckField = ({
  title,
  checked,
  onPress,
  after,
  containerStyle,
  titleStyle,
}) => (
  <View style={[checkBoxFieldStyles.container, containerStyle]}>
    <CheckBox
      titleStyle={titleStyle}
      title={title}
      checked={checked}
      onToggle={(...args) => {
        Platform.OS === "ios" &&
          LayoutAnimation.configureNext({
            duration: 300,
            create: {
              type: LayoutAnimation.Types.easeInEaseOut,
              property: LayoutAnimation.Properties.opacity,
            },
            update: {
              type: LayoutAnimation.Types.easeInEaseOut,
            },
          })

        onPress(...args)
      }}
    />

    {after && <View style={checkBoxFieldStyles.after}>{after}</View>}
  </View>
)

const checkBoxFieldStyles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  after: {
    marginTop: 10,
    paddingLeft: 41,
    marginBottom: -20,
  },
})

const CategoryToggle = ({ title, toggled, onChange }) => (
  <TouchableWithoutFeedback
    onPress={() => {
      Platform.OS === "ios" && LayoutAnimation.easeInEaseOut()
      onChange(!toggled)
    }}
  >
    <View style={categoryToggleStyles.container}>
      <Body style={categoryToggleStyles.title}>{title}</Body>

      <View style={categoryToggleStyles.toggle}>
        <CheckBox checked={toggled} />
      </View>
    </View>
  </TouchableWithoutFeedback>
)

const categoryToggleStyles = StyleSheet.create({
  container: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  title: { flex: 1 },
  toggle: { marginLeft: 20, marginBottom: 0 },
})

const CategoryBody = props => (
  <View style={categoryBodyStyles.container} {...props} />
)

const categoryBodyStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray50,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray200,
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
})

const QuestionText = ({ children, required }) => {
  if (required) {
    const words = children.split(" ")
    const lastWord = words.slice(-1)

    return (
      <View style={questionTextStyles.container}>
        {words
          .slice(0, -1)
          .map((word, index) => (
            <Body key={index} style={questionTextStyles.text}>
              {word}{" "}
            </Body>
          ))
          .concat(
            <View key={lastWord}>
              <Body style={questionTextStyles.text}>
                {lastWord}
                <Body style={questionTextStyles.required}> *</Body>
              </Body>
            </View>,
          )}
      </View>
    )
  } else {
    return <Body style={questionTextStyles.text}>{children}</Body>
  }
}

const questionTextStyles = StyleSheet.create({
  container: {
    marginBottom: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  text: { fontFamily: fonts.openSans.bold },
  required: {
    color: colors.red,
    fontFamily: fonts.openSans.bold,
  },
})

const TextField = ({ title, value, onChange, style, required, ...props }) => (
  <View style={[textFieldStyles.container, style]}>
    <QuestionText required={required}>{title}</QuestionText>
    <TextInput
      multiline
      scrollEnabled={false}
      value={value}
      onChangeText={onChange}
      {...props}
    />
  </View>
)

const textFieldStyles = StyleSheet.create({
  container: {
    marginBottom:
      20 +
      Math.floor((textStyles.body.lineHeight - textStyles.body.fontSize) / 2),
  },
})

const RadioField = ({ title, checked, onPress, after, ...props }) => (
  <View style={radioFieldStyles.container} {...props}>
    <Radio title={title} checked={checked} onPress={onPress} />
    {after && <View style={checkBoxFieldStyles.after}>{after}</View>}
  </View>
)

const radioFieldStyles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  after: {
    marginTop: 10,
    paddingLeft: 41,
    marginBottom: -20,
  },
})

const Required = ({ title }) => (
  <View style={requiredStyles.container}>
    <Caption style={requiredStyles.title}>{title}</Caption>
  </View>
)

const requiredStyles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    color: colors.red,
  },
})

const FieldGroup = ({ title, required, children, ...props }) => (
  <View {...props}>
    {title && (
      <View style={fieldGroupStyles.titleContainer}>
        <QuestionText required={required}>{title}</QuestionText>
      </View>
    )}
    {children}
  </View>
)

const fieldGroupStyles = StyleSheet.create({
  titleContainer: {
    marginBottom: 10,
  },
})

const HeartCondition = ({ strings, setValidation }) => {
  const { heartCondition, setHeartCondition } = React.useContext(
    HealthDeclaration.Context,
  )
  const [valid, setValid] = React.useState()

  React.useEffect(() => {
    if (heartCondition.hasCondition) {
      if (
        Object.values(heartCondition.heartConditions).find(
          ({ hasCondition }) => hasCondition,
        ) === undefined ||
        Object.values(heartCondition.heartConditions).find(
          ({ hasCondition, medications }) => hasCondition && !medications,
        ) ||
        (heartCondition.heartConditions.other.hasCondition &&
          !heartCondition.heartConditions.other.conditionDescription)
      ) {
        setValid(false)
      } else {
        setValid(true)
      }
    } else {
      setValid(undefined)
    }
  }, [heartCondition.hasCondition, heartCondition.heartConditions])

  React.useEffect(() => {
    setValidation(state => {
      if (valid === undefined) {
        /* eslint-disable-next-line */
        const { heartCondition, ...nextState } = state
        return nextState
      } else {
        return {
          ...state,
          heartCondition: valid,
        }
      }
    })
  }, [setValidation, valid])

  return (
    <Category>
      <CategoryToggle
        title={strings.heartCondition.hasCondition}
        toggled={heartCondition.hasCondition}
        onChange={value => {
          setHeartCondition(state => ({
            ...state,
            hasCondition: value,
          }))
        }}
      />

      {heartCondition.hasCondition && (
        <CategoryBody>
          {Object.keys(heartCondition.heartConditions).map(condition => (
            <CheckField
              key={condition}
              title={strings.heartCondition[condition]}
              checked={heartCondition.heartConditions[condition].hasCondition}
              onPress={() => {
                setHeartCondition(state => {
                  const nextState = {
                    ...state,
                    heartConditions: {
                      ...state.heartConditions,
                    },
                  }

                  nextState.heartConditions[condition].hasCondition = !nextState
                    .heartConditions[condition].hasCondition

                  return nextState
                })
              }}
              after={
                heartCondition.heartConditions[condition].hasCondition && (
                  <>
                    {Object.prototype.hasOwnProperty.call(
                      heartCondition.heartConditions[condition],
                      "conditionDescription",
                    ) && (
                      <TextField
                        required
                        title={
                          strings.heartCondition[
                            condition + "ConditionDescription"
                          ]
                        }
                        value={
                          heartCondition.heartConditions[condition]
                            .conditionDescription
                        }
                        onChange={text =>
                          setHeartCondition(state => {
                            const nextState = {
                              ...state,
                              heartConditions: {
                                ...state.heartConditions,
                              },
                            }

                            nextState.heartConditions[
                              condition
                            ].conditionDescription = text

                            return nextState
                          })
                        }
                      />
                    )}

                    <TextField
                      required
                      title={strings.medication}
                      value={
                        heartCondition.heartConditions[condition].medications
                      }
                      onChange={text =>
                        setHeartCondition(state => {
                          const nextState = {
                            ...state,
                            heartConditions: {
                              ...state.heartConditions,
                            },
                          }

                          nextState.heartConditions[
                            condition
                          ].medications = text

                          return nextState
                        })
                      }
                    />
                  </>
                )
              }
            />
          ))}

          {heartCondition.hasCondition &&
            Object.values(heartCondition.heartConditions).find(
              ({ hasCondition }) => hasCondition,
            ) === undefined && (
              <Required title={strings.heartCondition.heartConditionRequired} />
            )}

          {heartCondition.hasCondition &&
            (Object.values(heartCondition.heartConditions).find(
              ({ hasCondition, medications }) => hasCondition && !medications,
            ) ||
              (heartCondition.heartConditions.other.hasCondition &&
                !heartCondition.heartConditions.other
                  .conditionDescription)) && (
              <Required title={strings.requiredField} />
            )}
        </CategoryBody>
      )}
    </Category>
  )
}

const HighBloodPressure = ({ strings, setValidation }) => {
  const { highBloodPressure, setHighBloodPressure } = React.useContext(
    HealthDeclaration.Context,
  )

  const [valid, setValid] = React.useState()

  React.useEffect(() => {
    if (highBloodPressure.hasCondition) {
      if (!highBloodPressure.medications) {
        setValid(false)
      } else {
        setValid(true)
      }
    } else {
      setValid(undefined)
    }
  }, [highBloodPressure.hasCondition, highBloodPressure.medications])

  React.useEffect(() => {
    setValidation(state => {
      if (valid === undefined) {
        /* eslint-disable-next-line */
        const { highBloodPressure, ...nextState } = state
        return nextState
      } else {
        return {
          ...state,
          highBloodPressure: valid,
        }
      }
    })
  }, [setValidation, valid])

  return (
    <Category>
      <CategoryToggle
        title={strings.highBloodPressure.hasCondition}
        toggled={highBloodPressure.hasCondition}
        onChange={value => {
          setHighBloodPressure(state => ({ ...state, hasCondition: value }))
        }}
      />

      {highBloodPressure.hasCondition && (
        <CategoryBody>
          <TextField
            required
            title={strings.medication}
            value={highBloodPressure.medications}
            onChange={text =>
              setHighBloodPressure(state => ({ ...state, medications: text }))
            }
          />

          {!valid && <Required title={strings.requiredField} />}
        </CategoryBody>
      )}
    </Category>
  )
}

const Diabetes = ({ strings, setValidation }) => {
  const { diabetes, setDiabetes } = React.useContext(HealthDeclaration.Context)
  const [valid, setValid] = React.useState()

  React.useEffect(() => {
    if (diabetes.hasCondition) {
      if (
        diabetes.type &&
        diabetes.treatment.length &&
        diabetes.medications &&
        diabetes.medications.length
      ) {
        setValid(true)
      } else {
        setValid(false)
      }
    } else {
      setValid(undefined)
    }
  }, [
    diabetes.hasCondition,
    diabetes.medications,
    diabetes.treatment.length,
    diabetes.type,
  ])

  React.useEffect(() => {
    setValidation(state => {
      if (valid === undefined) {
        /* eslint-disable-next-line */
        const { diabetes, ...nextState } = state
        return nextState
      } else {
        return {
          ...state,
          diabetes: valid,
        }
      }
    })
  }, [setValidation, valid])

  return (
    <Category>
      <CategoryToggle
        title={strings.diabetes.hasCondition}
        toggled={diabetes.hasCondition}
        onChange={value => {
          setDiabetes(state => ({ ...state, hasCondition: value }))
        }}
      />

      {diabetes.hasCondition && (
        <CategoryBody>
          <FieldGroup required title={strings.diabetes.type}>
            {["Type1", "Type2"].map(type => (
              <RadioField
                key={type}
                title={strings.diabetes[type.toLowerCase()]}
                checked={diabetes.type === type}
                onPress={() =>
                  setDiabetes(state => ({
                    ...state,
                    type: !state.type
                      ? type
                      : state.type === type
                      ? undefined
                      : type,
                  }))
                }
              />
            ))}
          </FieldGroup>

          <FieldGroup required title={strings.diabetes.treatment}>
            {["Diet", "Pills", "Insulin"].map(type => (
              <CheckField
                key={type}
                title={strings.diabetes[type.toLowerCase()]}
                checked={diabetes.treatment.includes(type)}
                onPress={() =>
                  setDiabetes(state => ({
                    ...state,
                    treatment: !state.treatment.includes(type)
                      ? state.treatment.concat(type)
                      : state.treatment.filter(treatment => treatment !== type),
                  }))
                }
              />
            ))}
          </FieldGroup>

          <TextField
            required
            title={strings.medication}
            value={diabetes.medications}
            onChange={text =>
              setDiabetes(state => ({
                ...state,
                medications: text,
              }))
            }
          ></TextField>

          {!valid && <Required title={strings.requiredFields} />}
        </CategoryBody>
      )}
    </Category>
  )
}

const NeurologicalDisorder = ({ strings, setValidation }) => {
  const { neurologicalDisorder, setNeurologicalDisorder } = React.useContext(
    HealthDeclaration.Context,
  )

  const [valid, setValid] = React.useState()

  React.useEffect(() => {
    if (neurologicalDisorder.hasCondition) {
      if (
        neurologicalDisorder.medications &&
        (neurologicalDisorder.other.hasCondition
          ? neurologicalDisorder.other.conditionDescription
          : neurologicalDisorder.type.length)
      ) {
        setValid(true)
      } else {
        setValid(false)
      }
    } else {
      setValid(undefined)
    }
  }, [
    neurologicalDisorder.hasCondition,
    neurologicalDisorder.medications,
    neurologicalDisorder.other.conditionDescription,
    neurologicalDisorder.other.hasCondition,
    neurologicalDisorder.type.length,
  ])

  React.useEffect(() => {
    setValidation(state => {
      if (valid === undefined) {
        /* eslint-disable-next-line */
        const { neurologicalDisorder, ...nextState } = state
        return nextState
      } else {
        return {
          ...state,
          neurologicalDisorder: valid,
        }
      }
    })
  }, [setValidation, valid])

  return (
    <Category>
      <CategoryToggle
        title={strings.neurologicalDisorder.hasCondition}
        toggled={neurologicalDisorder.hasCondition}
        onChange={value => {
          setNeurologicalDisorder(state => ({ ...state, hasCondition: value }))
        }}
      />

      {neurologicalDisorder.hasCondition && (
        <CategoryBody>
          <FieldGroup required title={strings.neurologicalDisorder.type}>
            {["Epilepsy", "MS", "Parkinsons"].map(type => (
              <CheckField
                key={type}
                title={strings.neurologicalDisorder[type.toLowerCase()]}
                checked={neurologicalDisorder.type.includes(type)}
                onPress={() =>
                  setNeurologicalDisorder(state => ({
                    ...state,
                    type: !state.type.includes(type)
                      ? state.type.concat(type)
                      : state.type.filter(t => t !== type),
                  }))
                }
              />
            ))}

            <CheckField
              title={strings.neurologicalDisorder.other}
              checked={neurologicalDisorder.other.hasCondition}
              onPress={() => {
                setNeurologicalDisorder(state => ({
                  ...state,
                  other: {
                    ...state.other,
                    hasCondition: !state.other.hasCondition,
                  },
                }))
              }}
              after={
                neurologicalDisorder.other.hasCondition && (
                  <TextField
                    required
                    title={
                      strings.neurologicalDisorder.otherConditionDescription
                    }
                    value={neurologicalDisorder.other.conditionDescription}
                    onChange={text =>
                      setNeurologicalDisorder(state => ({
                        ...state,
                        other: { ...state.other, conditionDescription: text },
                      }))
                    }
                  />
                )
              }
            />
          </FieldGroup>

          <TextField
            required
            title={strings.medication}
            value={neurologicalDisorder.medications}
            onChange={text =>
              setNeurologicalDisorder(state => ({
                ...state,
                medications: text,
              }))
            }
          />

          {!valid && <Required title={strings.requiredFields} />}
        </CategoryBody>
      )}
    </Category>
  )
}

const ImmuneDisease = ({ strings, setValidation }) => {
  const { immuneDisease, setImmuneDisease } = React.useContext(
    HealthDeclaration.Context,
  )

  const [valid, setValid] = React.useState()

  React.useEffect(() => {
    if (immuneDisease.hasCondition) {
      if (immuneDisease.type && immuneDisease.medications) {
        setValid(true)
      } else {
        setValid(false)
      }
    } else {
      setValid(undefined)
    }
  }, [
    immuneDisease.hasCondition,
    immuneDisease.medications,
    immuneDisease.type,
  ])

  React.useEffect(() => {
    setValidation(state => {
      if (valid === undefined) {
        /* eslint-disable-next-line */
        const { immuneDisease, ...nextState } = state
        return nextState
      } else {
        return {
          ...state,
          immuneDisease: valid,
        }
      }
    })
  }, [setValidation, valid])

  return (
    <Category>
      <CategoryToggle
        title={strings.immuneDisease.hasCondition}
        toggled={immuneDisease.hasCondition}
        onChange={value => {
          setImmuneDisease(state => ({ ...state, hasCondition: value }))
        }}
      />

      {immuneDisease.hasCondition && (
        <CategoryBody>
          <TextField
            required
            title={strings.immuneDisease.type}
            value={immuneDisease.type}
            onChange={text =>
              setImmuneDisease(state => ({
                ...state,
                type: text,
              }))
            }
          />

          <TextField
            required
            title={strings.medication}
            value={immuneDisease.medications}
            onChange={text =>
              setImmuneDisease(state => ({
                ...state,
                medications: text,
              }))
            }
          />

          {!valid && <Required title={strings.requiredFields} />}
        </CategoryBody>
      )}
    </Category>
  )
}

const BloodInfection = ({ strings, setValidation }) => {
  const { bloodInfection, setBloodInfection } = React.useContext(
    HealthDeclaration.Context,
  )

  const [valid, setValid] = React.useState()

  React.useEffect(() => {
    if (bloodInfection.hasCondition) {
      if (
        bloodInfection.medications &&
        Object.values(bloodInfection.bloodInfections).find(
          ({ hasCondition }) => hasCondition,
        )
      ) {
        setValid(true)
      } else {
        setValid(false)
      }
    } else {
      setValid(undefined)
    }
  }, [
    bloodInfection.bloodInfections,
    bloodInfection.hasCondition,
    bloodInfection.medications,
  ])

  React.useEffect(() => {
    setValidation(state => {
      if (valid === undefined) {
        /* eslint-disable-next-line */
        const { bloodInfection, ...nextState } = state
        return nextState
      } else {
        return {
          ...state,
          bloodInfection: valid,
        }
      }
    })
  }, [setValidation, valid])

  return (
    <Category>
      <CategoryToggle
        title={strings.bloodInfection.hasCondition}
        toggled={bloodInfection.hasCondition}
        onChange={value => {
          setBloodInfection(state => ({ ...state, hasCondition: value }))
        }}
      />

      {bloodInfection.hasCondition && (
        <CategoryBody>
          <FieldGroup required title={strings.bloodInfection.type}>
            {["hepatitisB", "hepatitisC", "hiv"].map(type => (
              <CheckField
                key={type}
                title={strings.bloodInfection[type.toLowerCase()]}
                checked={bloodInfection.bloodInfections[type].hasCondition}
                onPress={() =>
                  setBloodInfection(state => ({
                    ...state,
                    bloodInfections: {
                      ...state.bloodInfections,
                      [type]: {
                        ...state.bloodInfections[type],
                        hasCondition: !state.bloodInfections[type].hasCondition,
                      },
                    },
                  }))
                }
              />
            ))}
          </FieldGroup>

          <TextField
            required
            title={strings.medication}
            value={bloodInfection.medications}
            onChange={text =>
              setBloodInfection(state => ({
                ...state,
                medications: text,
              }))
            }
          />

          {!valid && <Required title={strings.requiredFields} />}
        </CategoryBody>
      )}
    </Category>
  )
}

const RheumaticDisease = ({ strings, setValidation }) => {
  const { rheumaticDisease, setRheumaticDisease } = React.useContext(
    HealthDeclaration.Context,
  )

  const [valid, setValid] = React.useState()

  React.useEffect(() => {
    if (rheumaticDisease.hasCondition) {
      if (rheumaticDisease.type && rheumaticDisease.medications) {
        setValid(true)
      } else {
        setValid(false)
      }
    } else {
      setValid(undefined)
    }
  }, [
    rheumaticDisease.hasCondition,
    rheumaticDisease.medications,
    rheumaticDisease.type,
  ])

  React.useEffect(() => {
    setValidation(state => {
      if (valid === undefined) {
        /* eslint-disable-next-line */
        const { rheumaticDisease, ...nextState } = state
        return nextState
      } else {
        return {
          ...state,
          rheumaticDisease: valid,
        }
      }
    })
  }, [setValidation, valid])

  return (
    <Category>
      <CategoryToggle
        title={strings.rheumaticDisease.hasCondition}
        toggled={rheumaticDisease.hasCondition}
        onChange={value => {
          setRheumaticDisease(state => ({ ...state, hasCondition: value }))
        }}
      />

      {rheumaticDisease.hasCondition && (
        <CategoryBody>
          <TextField
            required
            title={strings.rheumaticDisease.type}
            value={rheumaticDisease.type}
            onChange={text =>
              setRheumaticDisease(state => ({
                ...state,
                type: text,
              }))
            }
          />

          <TextField
            required
            title={strings.medication}
            value={rheumaticDisease.medications}
            onChange={text =>
              setRheumaticDisease(state => ({
                ...state,
                medications: text,
              }))
            }
          />

          {(rheumaticDisease.type || "").length === 0 ||
          (rheumaticDisease.medications || "").length === 0 ? (
            <Required title={strings.requiredFields} />
          ) : null}
        </CategoryBody>
      )}
    </Category>
  )
}

const LungDisease = ({ strings, setValidation }) => {
  const { lungDisease, setLungDisease } = React.useContext(
    HealthDeclaration.Context,
  )

  const [valid, setValid] = React.useState()

  React.useEffect(() => {
    if (lungDisease.hasCondition) {
      if (
        (lungDisease.lungDiseases.asthma.hasCondition
          ? lungDisease.lungDiseases.asthma.medications
          : true) &&
        (lungDisease.lungDiseases.copd.hasCondition
          ? lungDisease.lungDiseases.copd.medications
          : true) &&
        (lungDisease.lungDiseases.other.hasCondition
          ? lungDisease.lungDiseases.other.medications &&
            lungDisease.lungDiseases.other.conditionDescription
          : true)
      ) {
        setValid(true)
      } else {
        setValid(false)
      }
    } else {
      setValid(undefined)
    }
  }, [
    lungDisease.hasCondition,
    lungDisease.lungDiseases.asthma.hasCondition,
    lungDisease.lungDiseases.asthma.medications,
    lungDisease.lungDiseases.copd.hasCondition,
    lungDisease.lungDiseases.copd.medications,
    lungDisease.lungDiseases.other.conditionDescription,
    lungDisease.lungDiseases.other.hasCondition,
    lungDisease.lungDiseases.other.medications,
  ])

  React.useEffect(() => {
    setValidation(state => {
      if (valid === undefined) {
        /* eslint-disable-next-line */
        const { lungDisease, ...nextState } = state
        return nextState
      } else {
        return {
          ...state,
          lungDisease: valid,
        }
      }
    })
  }, [setValidation, valid])

  return (
    <Category>
      <CategoryToggle
        title={strings.lungDisease.hasCondition}
        toggled={lungDisease.hasCondition}
        onChange={value => {
          setLungDisease(state => ({ ...state, hasCondition: value }))
        }}
      />

      {lungDisease.hasCondition && (
        <CategoryBody>
          <FieldGroup required title={strings.lungDisease.type}>
            {["asthma", "copd"].map(type => (
              <CheckField
                key={type}
                title={strings.lungDisease[type.toLowerCase()]}
                checked={lungDisease.lungDiseases[type].hasCondition}
                onPress={() => {
                  setLungDisease(state => ({
                    ...state,
                    lungDiseases: {
                      ...state.lungDiseases,
                      [type]: {
                        ...state.lungDiseases[type],
                        hasCondition: !state.lungDiseases[type].hasCondition,
                      },
                    },
                  }))
                }}
                after={
                  lungDisease.lungDiseases[type].hasCondition && (
                    <TextField
                      required
                      title={strings.medication}
                      value={lungDisease.lungDiseases[type].medications}
                      onChange={text =>
                        setLungDisease(state => ({
                          ...state,
                          lungDiseases: {
                            ...state.lungDiseases,
                            [type]: {
                              ...state.lungDiseases[type],
                              medications: text,
                            },
                          },
                        }))
                      }
                    />
                  )
                }
              />
            ))}

            <CheckField
              title={strings.lungDisease.other}
              checked={lungDisease.lungDiseases.other.hasCondition}
              onPress={() => {
                setLungDisease(state => ({
                  ...state,
                  lungDiseases: {
                    ...state.lungDiseases,
                    other: {
                      ...state.lungDiseases.other,
                      hasCondition: !state.lungDiseases.other.hasCondition,
                    },
                  },
                }))
              }}
              after={
                lungDisease.lungDiseases.other.hasCondition && (
                  <>
                    <TextField
                      required
                      title={strings.lungDisease.otherConditionDescription}
                      value={
                        lungDisease.lungDiseases.other.conditionDescription
                      }
                      onChange={text =>
                        setLungDisease(state => ({
                          ...state,
                          lungDiseases: {
                            ...state.lungDiseases,
                            other: {
                              ...state.lungDiseases.other,
                              conditionDescription: text,
                            },
                          },
                        }))
                      }
                    />
                    <TextField
                      required
                      title={strings.medication}
                      value={lungDisease.lungDiseases.other.medications}
                      onChange={text =>
                        setLungDisease(state => ({
                          ...state,
                          lungDiseases: {
                            ...state.lungDiseases,
                            other: {
                              ...state.lungDiseases.other,
                              medications: text,
                            },
                          },
                        }))
                      }
                    />
                  </>
                )
              }
            />
          </FieldGroup>

          {!Object.values(lungDisease.lungDiseases).find(
            ({ hasCondition }) => hasCondition,
          ) ? (
            <Required title={strings.lungDisease.lungDiseaseRequired} />
          ) : !valid ? (
            <Required title={strings.requiredFields} />
          ) : null}
        </CategoryBody>
      )}
    </Category>
  )
}

const Hemophilia = ({ strings, setValidation }) => {
  const { hemophilia, setHemophilia } = React.useContext(
    HealthDeclaration.Context,
  )

  const [valid, setValid] = React.useState()

  React.useEffect(() => {
    if (hemophilia.hasCondition) {
      if (hemophilia.medications) {
        setValid(true)
      } else {
        setValid(false)
      }
    } else {
      setValid(undefined)
    }
  }, [hemophilia.hasCondition, hemophilia.medications])

  React.useEffect(() => {
    setValidation(state => {
      if (valid === undefined) {
        /* eslint-disable-next-line */
        const { hemophilia, ...nextState } = state
        return nextState
      } else {
        return {
          ...state,
          hemophilia: valid,
        }
      }
    })
  }, [setValidation, valid])

  return (
    <Category>
      <CategoryToggle
        title={strings.hemophilia.hasCondition}
        toggled={hemophilia.hasCondition}
        onChange={value => {
          setHemophilia(state => ({ ...state, hasCondition: value }))
        }}
      />

      {hemophilia.hasCondition && (
        <CategoryBody>
          <TextField
            required
            title={strings.medication}
            value={hemophilia.medications}
            onChange={text =>
              setHemophilia(state => ({
                ...state,
                medications: text,
              }))
            }
          />

          {!valid && <Required title={strings.requiredField} />}
        </CategoryBody>
      )}
    </Category>
  )
}

const Cancer = ({ strings, setValidation }) => {
  const { cancer, setCancer } = React.useContext(HealthDeclaration.Context)

  const [valid, setValid] = React.useState()

  React.useEffect(() => {
    if (cancer.hasCondition) {
      if (
        cancer.description &&
        cancer.treatment.length &&
        cancer.medications &&
        (cancer.isAffected ? cancer.effect : true)
      ) {
        setValid(true)
      } else {
        setValid(false)
      }
    } else {
      setValid(undefined)
    }
  }, [
    cancer.description,
    cancer.effect,
    cancer.hasCondition,
    cancer.isAffected,
    cancer.medications,
    cancer.treatment.length,
  ])

  React.useEffect(() => {
    setValidation(state => {
      if (valid === undefined) {
        /* eslint-disable-next-line */
        const { cancer, ...nextState } = state
        return nextState
      } else {
        return {
          ...state,
          cancer: valid,
        }
      }
    })
  }, [setValidation, valid])

  return (
    <Category>
      <CategoryToggle
        title={strings.cancer.hasCondition}
        toggled={cancer.hasCondition}
        onChange={value => {
          setCancer(state => ({ ...state, hasCondition: value }))
        }}
      />

      {cancer.hasCondition && (
        <CategoryBody>
          <TextField
            required
            title={strings.cancer.description}
            value={cancer.description}
            onChange={text =>
              setCancer(state => ({
                ...state,
                description: text,
              }))
            }
          />

          <FieldGroup required title={strings.cancer.treatment}>
            {["Chemotherapy", "Radiotherapy", "Surgery"].map(type => (
              <CheckField
                key={type}
                title={strings.cancer[type.toLowerCase()]}
                checked={cancer.treatment.includes(type)}
                onPress={() =>
                  setCancer(state => ({
                    ...state,
                    treatment: !state.treatment.includes(type)
                      ? state.treatment.concat(type)
                      : state.treatment.filter(t => t !== type),
                  }))
                }
              />
            ))}
          </FieldGroup>

          <TextField
            required
            title={strings.cancer.medication}
            value={cancer.medications}
            onChange={text =>
              setCancer(state => ({
                ...state,
                medications: text,
              }))
            }
          />

          <FieldGroup required title={strings.cancer.affected}>
            <RadioField
              title={strings.yes}
              checked={cancer.isAffected === true}
              onPress={() => {
                Platform.OS === "ios" && LayoutAnimation.easeInEaseOut()

                setCancer(state => ({
                  ...state,
                  isAffected: true,
                }))
              }}
            />
            <RadioField
              title={strings.no}
              checked={cancer.isAffected === false}
              onPress={() => {
                LayoutAnimation.easeInEaseOut()

                setCancer(state => ({
                  ...state,
                  isAffected: false,
                }))
              }}
              after={
                cancer.isAffected && (
                  <TextField
                    required
                    title={strings.cancer.effect}
                    value={cancer.effect}
                    onChange={text =>
                      setCancer(state => ({
                        ...state,
                        effect: text,
                      }))
                    }
                  />
                )
              }
            />
          </FieldGroup>

          {!valid && <Required title={strings.requiredFields} />}
        </CategoryBody>
      )}
    </Category>
  )
}

const Osteoporosis = ({ strings, setValidation }) => {
  const { osteoporosis, setOsteoporosis } = React.useContext(
    HealthDeclaration.Context,
  )

  const [valid, setValid] = React.useState()

  React.useEffect(() => {
    if (osteoporosis.hasCondition) {
      if (!osteoporosis.medications) {
        setValid(false)
      } else {
        setValid(true)
      }
    } else {
      setValid(undefined)
    }
  }, [osteoporosis.hasCondition, osteoporosis.medications])

  React.useEffect(() => {
    setValidation(state => {
      if (valid === undefined) {
        /* eslint-disable-next-line */
        const { osteoporosis, ...nextState } = state
        return nextState
      } else {
        return {
          ...state,
          osteoporosis: valid,
        }
      }
    })
  }, [setValidation, valid])

  return (
    <Category>
      <CategoryToggle
        title={strings.osteoporosis.hasCondition}
        toggled={osteoporosis.hasCondition}
        onChange={value => {
          setOsteoporosis(state => ({ ...state, hasCondition: value }))
        }}
      />

      {osteoporosis.hasCondition && (
        <CategoryBody>
          <TextField
            required
            title={strings.medication}
            value={osteoporosis.medications}
            onChange={text =>
              setOsteoporosis(state => ({
                ...state,
                medications: text,
              }))
            }
          />

          {(osteoporosis.medications || "").length === 0 ? (
            <Required title={strings.requiredField} />
          ) : null}
        </CategoryBody>
      )}
    </Category>
  )
}

const Mrsa = ({ strings, setValidation }) => {
  const { mrsa, setMrsa } = React.useContext(HealthDeclaration.Context)
  const [valid, setValid] = React.useState()

  React.useEffect(() => {
    if (mrsa.hasCondition) {
      if (mrsa.medications) {
        setValid(true)
      } else {
        setValid(false)
      }
    } else {
      setValid(undefined)
    }
  }, [mrsa.hasCondition, mrsa.medications])

  React.useEffect(() => {
    setValidation(state => {
      if (valid === undefined) {
        /* eslint-disable-next-line */
        const { mrsa, ...nextState } = state
        return nextState
      } else {
        return {
          ...state,
          mrsa: valid,
        }
      }
    })
  }, [setValidation, valid])

  return (
    <Category>
      <CategoryToggle
        title={strings.mrsa.hasCondition}
        toggled={mrsa.hasCondition}
        onChange={value => {
          setMrsa(state => ({ ...state, hasCondition: value }))
        }}
      />

      {mrsa.hasCondition && (
        <CategoryBody>
          <TextField
            required
            title={strings.medication}
            value={mrsa.medications}
            onChange={text =>
              setMrsa(state => ({
                ...state,
                medications: text,
              }))
            }
          />

          {!valid && <Required title={strings.requiredField} />}
        </CategoryBody>
      )}
    </Category>
  )
}

const Other = ({ strings, setValidation }) => {
  const { other, setOther } = React.useContext(HealthDeclaration.Context)

  const [valid, setValid] = React.useState()

  React.useEffect(() => {
    if (other.hasCondition) {
      if (other.medications && other.conditionDescription) {
        setValid(true)
      } else {
        setValid(false)
      }
    } else {
      setValid(undefined)
    }
  }, [other.conditionDescription, other.hasCondition, other.medications])

  React.useEffect(() => {
    setValidation(state => {
      if (valid === undefined) {
        /* eslint-disable-next-line */
        const { other, ...nextState } = state
        return nextState
      } else {
        return {
          ...state,
          other: valid,
        }
      }
    })
  }, [setValidation, valid])

  return (
    <Category>
      <CategoryToggle
        title={strings.other.hasCondition}
        toggled={other.hasCondition}
        onChange={value => {
          setOther(state => ({ ...state, hasCondition: value }))
        }}
      />

      {other.hasCondition && (
        <CategoryBody>
          <TextField
            required
            title={strings.other.conditionDescription}
            value={other.conditionDescription}
            onChange={text =>
              setOther(state => ({
                ...state,
                conditionDescription: text,
              }))
            }
          />

          <TextField
            required
            title={strings.medication}
            value={other.medications}
            onChange={text =>
              setOther(state => ({
                ...state,
                medications: text,
              }))
            }
          />

          {!valid && <Required title={strings.requiredFields} />}
        </CategoryBody>
      )}
    </Category>
  )
}

export const IllnessesAilments = ({ navigation }) => {
  const healthDeclaration = React.useContext(HealthDeclaration.Context)
  const localization = React.useContext(Localization.Context)
  const strings = localization.getStrings()
  const [validation, setValidation] = React.useState({})
  const [withoutRemarkApproved, setWithoutRemarkApproved] = React.useState(
    false,
  )

  const withoutRemark =
    Object.entries(healthDeclaration).filter(
      ([key, { hasCondition }]) =>
        !/^set|tobacco|allergies/.test(key) && hasCondition,
    ).length === 0

  React.useEffect(() => {
    if (!withoutRemark) {
      setWithoutRemarkApproved(false)
    }
  }, [withoutRemark])

  const invalidSections = Object.entries(validation).reduce(
    (result, [sectionName, isValid]) => {
      if (isValid) {
        return result
      } else {
        return result.concat(
          result.length
            ? `, "${strings.healthDeclaration.illnessesAilments[sectionName].hasCondition}"`
            : `"${strings.healthDeclaration.illnessesAilments[sectionName].hasCondition}"`,
        )
      }
    },
    "",
  )

  const {
    healthDeclaration: { illnessesAilments },
  } = strings

  React.useEffect(() => {
    const handler = () => true

    BackHandler.addEventListener("hardwareBackPress", handler)

    return () => BackHandler.removeEventListener("hardwareBackPress", handler)
  }, [])

  return (
    <>
      <HeaderTitle>{strings.healthDeclaration.title}</HeaderTitle>
      <HeaderBackTitle>{strings.common.back}</HeaderBackTitle>

      <ActionView
        keyboardAvoidingViewProps={{
          keyboardVerticalOffset: keyboardVerticalOffsetWithTabBar,
        }}
      >
        <View
          style={{
            width: windowWidth,
            marginLeft: "auto",
            marginRight: "auto",
            marginBottom: "auto",
          }}
        >
          <View
            style={{
              padding: 20,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.gray400,
            }}
          >
            <Body style={{ fontFamily: fonts.openSans.bold }}>
              {illnessesAilments.hasCondition}
            </Body>
          </View>

          <HeartCondition
            strings={illnessesAilments}
            setValidation={setValidation}
          />
          <HighBloodPressure
            strings={illnessesAilments}
            setValidation={setValidation}
          />
          <Diabetes strings={illnessesAilments} setValidation={setValidation} />
          <NeurologicalDisorder
            strings={illnessesAilments}
            setValidation={setValidation}
          />
          <ImmuneDisease
            strings={illnessesAilments}
            setValidation={setValidation}
          />
          <BloodInfection
            strings={illnessesAilments}
            setValidation={setValidation}
          />
          <RheumaticDisease
            strings={illnessesAilments}
            setValidation={setValidation}
          />
          <LungDisease
            strings={illnessesAilments}
            setValidation={setValidation}
          />
          <Hemophilia
            strings={illnessesAilments}
            setValidation={setValidation}
          />
          <Cancer strings={illnessesAilments} setValidation={setValidation} />
          <Osteoporosis
            strings={illnessesAilments}
            setValidation={setValidation}
          />
          <Mrsa strings={illnessesAilments} setValidation={setValidation} />
          <Other strings={illnessesAilments} setValidation={setValidation} />
        </View>

        <View
          style={{
            paddingTop: 20,
            backgroundColor:
              withoutRemark && !withoutRemarkApproved
                ? colors.gray50
                : "transparent",
          }}
        >
          <Content
            style={{
              paddingLeft: 20,
              paddingRight: 20,
            }}
          >
            {!!invalidSections && (
              <View style={{ marginBottom: 20, justifyContent: "center" }}>
                <Caption
                  style={{ color: colors.red, textAlign: "center" }}
                >{`${strings.healthDeclaration.illnessesAilments.missingAnswers} ${invalidSections}`}</Caption>
              </View>
            )}
          </Content>

          {withoutRemark ? (
            <>
              <Content
                style={{
                  marginBottom: 20,
                  paddingLeft: 20,
                  paddingRight: 20,
                }}
              >
                <CheckField
                  containerStyle={{ marginBottom: 20 }}
                  titleStyle={{
                    marginLeft: 15,
                    fontFamily: fonts.openSans.bold,
                  }}
                  title={
                    strings.healthDeclaration.illnessesAilments.withoutRemark
                  }
                  onPress={() => setWithoutRemarkApproved(state => !state)}
                />

                <Button
                  primary
                  disabled={!withoutRemarkApproved}
                  title={strings.common.next}
                  onPress={() =>
                    navigation.navigate({
                      routeName: "Tobacco",
                      params: {
                        pricing: navigation.getParam("pricing"),
                        visit: navigation.getParam("visit"),
                        onBehalfOf: navigation.getParam("onBehalfOf"),
                      },
                    })
                  }
                />
              </Content>
            </>
          ) : (
            <Content
              style={{ marginBottom: 20, paddingLeft: 20, paddingRight: 20 }}
            >
              <Button
                primary
                disabled={
                  Object.values(validation).find(bool => bool === false) !==
                  undefined
                }
                title={strings.common.next}
                onPress={() =>
                  navigation.navigate({
                    routeName: "Tobacco",
                    params: {
                      pricing: navigation.getParam("pricing"),
                      visit: navigation.getParam("visit"),
                      onBehalfOf: navigation.getParam("onBehalfOf"),
                    },
                  })
                }
              />
            </Content>
          )}
        </View>
      </ActionView>
    </>
  )
}

export const Tobacco = ({ navigation }) => {
  const { tobaccoUse, setTobaccoUse } = React.useContext(
    HealthDeclaration.Context,
  )
  const localization = React.useContext(Localization.Context)
  const strings = localization.getStrings()

  return (
    <>
      <HeaderTitle>{strings.healthDeclaration.title}</HeaderTitle>
      <HeaderBackTitle>{strings.common.back}</HeaderBackTitle>

      <ActionView
        keyboardAvoidingViewProps={{
          keyboardVerticalOffset: keyboardVerticalOffsetWithTabBar,
        }}
      >
        <View>
          <Content
            style={{ paddingTop: 20, paddingRight: 20, paddingLeft: 20 }}
          >
            <Title style={{ marginBottom: 20 }}>
              {strings.healthDeclaration.tobaccoUse.hasCondition}
            </Title>

            <RadioField
              title={strings.healthDeclaration.tobaccoUse.yes}
              checked={tobaccoUse.hasCondition === true}
              onPress={() => {
                Platform.OS === "ios" && LayoutAnimation.easeInEaseOut()

                setTobaccoUse(state => ({
                  ...state,
                  hasCondition: true,
                }))
              }}
            />
            <RadioField
              title={strings.healthDeclaration.tobaccoUse.no}
              checked={tobaccoUse.hasCondition === false}
              onPress={() => {
                Platform.OS === "ios" && LayoutAnimation.easeInEaseOut()

                setTobaccoUse(state => ({
                  ...state,
                  hasCondition: false,
                }))
              }}
            />
          </Content>

          {tobaccoUse.hasCondition && (
            <View style={{ backgroundColor: colors.gray50 }}>
              <Content
                style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 20 }}
              >
                <FieldGroup
                  required
                  title={strings.healthDeclaration.tobaccoUse.smoke}
                >
                  <RadioField
                    title={strings.healthDeclaration.tobaccoUse.yes}
                    checked={tobaccoUse.smoking.hasCondition === true}
                    onPress={() => {
                      Platform.OS === "ios" && LayoutAnimation.easeInEaseOut()

                      setTobaccoUse(state => ({
                        ...state,
                        smoking: {
                          ...state.smoking,
                          hasCondition: true,
                        },
                      }))
                    }}
                    after={
                      tobaccoUse.smoking.hasCondition && (
                        <FieldGroup
                          required
                          title={strings.healthDeclaration.tobaccoUse.amount}
                        >
                          <RadioField
                            title={
                              strings.healthDeclaration.tobaccoUse
                                .fewerThanTenPerDay
                            }
                            checked={
                              tobaccoUse.smoking.amount === "FewerThanTenPerDay"
                            }
                            onPress={() => {
                              Platform.OS === "ios" &&
                                LayoutAnimation.easeInEaseOut()

                              setTobaccoUse(state => ({
                                ...state,
                                smoking: {
                                  ...state.smoking,
                                  amount: "FewerThanTenPerDay",
                                },
                              }))
                            }}
                          />
                          <RadioField
                            title={
                              strings.healthDeclaration.tobaccoUse
                                .tenOrMorePerDay
                            }
                            checked={
                              tobaccoUse.smoking.amount === "TenOrMorePerDay"
                            }
                            onPress={() => {
                              Platform.OS === "ios" &&
                                LayoutAnimation.easeInEaseOut()

                              setTobaccoUse(state => ({
                                ...state,
                                smoking: {
                                  ...state.smoking,
                                  amount: "TenOrMorePerDay",
                                },
                              }))
                            }}
                          />
                        </FieldGroup>
                      )
                    }
                  />
                  <RadioField
                    title={strings.healthDeclaration.tobaccoUse.no}
                    checked={tobaccoUse.smoking.hasCondition === false}
                    onPress={() => {
                      Platform.OS === "ios" && LayoutAnimation.easeInEaseOut()

                      setTobaccoUse(state => ({
                        ...state,
                        smoking: {
                          ...state.smoking,
                          hasCondition: false,
                        },
                      }))
                    }}
                  />
                </FieldGroup>

                <FieldGroup
                  required
                  title={strings.healthDeclaration.tobaccoUse.waterpipe}
                >
                  <RadioField
                    title={strings.healthDeclaration.tobaccoUse.yes}
                    checked={tobaccoUse.waterpipe.hasCondition === true}
                    onPress={() => {
                      LayoutAnimation.easeInEaseOut()

                      setTobaccoUse(state => ({
                        ...state,
                        waterpipe: {
                          ...state.waterpipe,
                          hasCondition: true,
                        },
                      }))
                    }}
                  />
                  <RadioField
                    title={strings.healthDeclaration.tobaccoUse.no}
                    checked={tobaccoUse.waterpipe.hasCondition === false}
                    onPress={() => {
                      Platform.OS === "ios" && LayoutAnimation.easeInEaseOut()

                      setTobaccoUse(state => ({
                        ...state,
                        waterpipe: {
                          ...state.waterpipe,
                          hasCondition: false,
                        },
                      }))
                    }}
                  />
                </FieldGroup>

                <FieldGroup
                  required
                  title={strings.healthDeclaration.tobaccoUse.snus}
                >
                  <RadioField
                    title={strings.healthDeclaration.tobaccoUse.yes}
                    checked={tobaccoUse.snus.hasCondition === true}
                    onPress={() => {
                      Platform.OS === "ios" && LayoutAnimation.easeInEaseOut()

                      setTobaccoUse(state => ({
                        ...state,
                        snus: {
                          ...state.snus,
                          hasCondition: true,
                        },
                      }))
                    }}
                  />
                  <RadioField
                    title={strings.healthDeclaration.tobaccoUse.no}
                    checked={tobaccoUse.snus.hasCondition === false}
                    onPress={() => {
                      Platform.OS === "ios" && LayoutAnimation.easeInEaseOut()

                      setTobaccoUse(state => ({
                        ...state,
                        snus: {
                          ...state.snus,
                          hasCondition: false,
                        },
                      }))
                    }}
                  />
                </FieldGroup>
              </Content>
            </View>
          )}
        </View>

        <Content
          style={{
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          <View style={{ marginTop: 20, marginBottom: 20 }}>
            <Button
              primary
              disabled={
                tobaccoUse.hasCondition === undefined ||
                (tobaccoUse.hasCondition &&
                  (tobaccoUse.smoking.hasCondition === undefined ||
                    tobaccoUse.snus.hasCondition === undefined ||
                    tobaccoUse.waterpipe.hasCondition === undefined)) ||
                (tobaccoUse.smoking.hasCondition && !tobaccoUse.smoking.amount)
              }
              title={strings.common.next}
              onPress={() =>
                navigation.navigate({
                  routeName: "Allergies",
                  params: {
                    pricing: navigation.getParam("pricing"),
                    visit: navigation.getParam("visit"),
                    onBehalfOf: navigation.getParam("onBehalfOf"),
                  },
                })
              }
            />
          </View>
        </Content>
      </ActionView>
    </>
  )
}

export const Allergies = ({ navigation }) => {
  const healthDeclaration = React.useContext(HealthDeclaration.Context)
  const { allergies, setAllergies } = healthDeclaration
  const localization = React.useContext(Localization.Context)
  const strings = localization.getStrings()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState()
  const [bankId, setBankId] = React.useState()

  React.useEffect(() => {
    bankIdStore.read().then(setBankId)
  }, [])

  return (
    <>
      <HeaderTitle>{strings.healthDeclaration.title}</HeaderTitle>
      <HeaderBackTitle>{strings.common.back}</HeaderBackTitle>

      {error && (
        <ErrorMessage
          title={strings.common.generalError}
          message={error.message}
          onClose={() => setError(false)}
        />
      )}

      <ActionView
        keyboardAvoidingViewProps={{
          keyboardVerticalOffset: keyboardVerticalOffsetWithTabBar,
        }}
      >
        <Content style={{ padding: 20 }}>
          <Title style={{ marginBottom: 20 }}>
            {strings.healthDeclaration.allergies.hasCondition}
          </Title>

          <CheckField
            title={strings.healthDeclaration.allergies.penicillin}
            checked={allergies.penicillin === true}
            onPress={() =>
              setAllergies(state => ({
                ...state,
                penicillin: !state.penicillin,
              }))
            }
          />
          <CheckField
            title={strings.healthDeclaration.allergies.localAnesthesia}
            checked={allergies.localAnesthesia === true}
            onPress={() =>
              setAllergies(state => ({
                ...state,
                localAnesthesia: !state.localAnesthesia,
              }))
            }
          />
          <CheckField
            title={strings.healthDeclaration.allergies.pollen}
            checked={allergies.pollen === true}
            onPress={() =>
              setAllergies(state => ({
                ...state,
                pollen: !state.pollen,
              }))
            }
          />
          <CheckField
            title={strings.healthDeclaration.allergies.food}
            checked={allergies.food === true}
            onPress={() =>
              setAllergies(state => ({
                ...state,
                food: !state.food,
              }))
            }
          />
          <CheckField
            title={strings.healthDeclaration.allergies.other}
            checked={allergies.other.hasCondition === true}
            onPress={() =>
              setAllergies(state => ({
                ...state,
                other: {
                  ...state.other,
                  hasCondition: !state.other.hasCondition,
                },
              }))
            }
            after={
              allergies.other.hasCondition && (
                <TextField
                  required
                  title={
                    strings.healthDeclaration.allergies
                      .otherConditionDescription
                  }
                  value={allergies.other.conditionDescription}
                  onChange={text =>
                    setAllergies(state => ({
                      ...state,
                      other: {
                        ...state.other,
                        conditionDescription: text,
                      },
                    }))
                  }
                />
              )
            }
          />

          {(allergies.penicillin ||
            allergies.localAnesthesia ||
            allergies.pollen ||
            allergies.food ||
            allergies.other.hasCondition) && (
            <TextField
              required
              title={strings.healthDeclaration.allergies.medication}
              value={allergies.medications}
              onChange={text =>
                setAllergies(state => ({
                  ...state,
                  medications: text,
                }))
              }
            />
          )}
        </Content>

        <Content style={{ paddingLeft: 20, paddingRight: 20 }}>
          <View style={{ marginBottom: 20 }}>
            <Button
              primary
              loading={loading}
              disabled={
                (allergies.other.hasCondition &&
                  !allergies.other.conditionDescription) ||
                ((allergies.penicillin ||
                  allergies.localAnesthesia ||
                  allergies.pollen ||
                  allergies.food ||
                  allergies.other.hasCondition) &&
                  !allergies.medications)
              }
              title={strings.common.next}
              onPress={() => {
                const visit = navigation.getParam("visit")
                const pricing = navigation.getParam("pricing")

                const personalNumber = get(
                  navigation.getParam("onBehalfOf"),
                  "personalNumber",
                  bankId.personalNumber,
                )

                const dateOfBirth = parse(
                  personalNumber.slice(0, 8),
                  "yyyyMMdd",
                  new Date(),
                )

                const today = new Date(Date.now())

                const isFemale = personalNumber.slice(10, 11) % 2 === 0

                if (isFemale && isBefore(dateOfBirth, subYears(today, 15))) {
                  navigation.navigate({
                    routeName: "Pregnancy",
                    params: {
                      pricing,
                      visit,
                    },
                  })
                } else {
                  setError(undefined)
                  setLoading(true)

                  health
                    .update({ visitId: visit.id, healthDeclaration })
                    .then(() => {
                      navigation.navigate({
                        routeName:
                          pricing.price > 0
                            ? "PaymentProviders"
                            : "ConfirmFreeVisit",
                        params: {
                          pricing,
                          visit,
                        },
                      })
                    })
                    .catch(error => {
                      setError(error)
                      setLoading(false)
                    })
                }
              }}
            />
          </View>
        </Content>
      </ActionView>
    </>
  )
}

const months = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
]

const currentTime = Date.now()
const currentMonthIndex = new Date(currentTime).getMonth()

const { selections } = months
  .slice(currentMonthIndex)
  .concat(months)
  .slice(0, 10)
  .reduce(
    (options, month) => {
      if (options.selections.length && month === "january") {
        options.year++
        options.selections.push({ month, year: options.year })
      } else {
        options.selections.push({ month, year: options.year })
      }

      return options
    },
    { selections: [], year: new Date(currentTime).getFullYear() },
  )

export const Pregnancy = ({ navigation }) => {
  const healthDeclaration = React.useContext(HealthDeclaration.Context)
  const { pregnancy, setPregnancy } = healthDeclaration
  const localization = React.useContext(Localization.Context)
  const strings = localization.getStrings()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState()

  return (
    <>
      <HeaderTitle>{strings.healthDeclaration.title}</HeaderTitle>
      <HeaderBackTitle>{strings.common.back}</HeaderBackTitle>

      {error && (
        <ErrorMessage
          title={strings.common.generalError}
          message={error.message}
          onClose={() => setError(false)}
        />
      )}

      <ActionView
        keyboardAvoidingViewProps={{
          keyboardVerticalOffset: keyboardVerticalOffsetWithTabBar,
        }}
      >
        <View>
          <Content
            style={{ paddingTop: 20, paddingRight: 20, paddingLeft: 20 }}
          >
            <Title style={{ marginBottom: 20 }}>
              {strings.healthDeclaration.pregnancy.hasCondition}
            </Title>

            <FieldGroup required>
              <RadioField
                title={strings.healthDeclaration.pregnancy.yes}
                checked={pregnancy.hasCondition === true}
                onPress={() => {
                  Platform.OS === "ios" && LayoutAnimation.easeInEaseOut()

                  setPregnancy(state => ({
                    ...state,
                    hasCondition: true,
                  }))
                }}
              />
              <RadioField
                title={strings.healthDeclaration.pregnancy.no}
                checked={pregnancy.hasCondition === false}
                onPress={() => {
                  Platform.OS === "ios" && LayoutAnimation.easeInEaseOut()

                  setPregnancy(state => ({
                    ...state,
                    hasCondition: false,
                  }))
                }}
              />
            </FieldGroup>
          </Content>

          {pregnancy.hasCondition && (
            <View style={{ backgroundColor: colors.gray50, marginBottom: 20 }}>
              <Content
                style={{ paddingTop: 20, paddingRight: 20, paddingLeft: 20 }}
              >
                <FieldGroup
                  required
                  title={strings.healthDeclaration.pregnancy.estimated}
                >
                  {selections.map(({ month, year }) => (
                    <RadioField
                      key={month + year}
                      title={`${strings.healthDeclaration.pregnancy[month]}, ${year}`}
                      checked={
                        months[pregnancy.estimatedMonth - 1] === month &&
                        pregnancy.estimatedYear === year
                      }
                      onPress={() => {
                        LayoutAnimation.easeInEaseOut()

                        setPregnancy(state => ({
                          ...state,
                          estimatedMonth: months.indexOf(month) + 1,
                          estimatedYear: year,
                        }))
                      }}
                    />
                  ))}
                </FieldGroup>
              </Content>
            </View>
          )}
        </View>

        <Content
          style={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 20 }}
        >
          <Button
            primary
            disabled={
              pregnancy.hasCondition === undefined ||
              (pregnancy.hasCondition &&
                (!pregnancy.estimatedMonth || !pregnancy.estimatedYear))
            }
            loading={loading}
            title={strings.common.next}
            onPress={() => {
              const visit = navigation.getParam("visit")

              setError(undefined)
              setLoading(true)

              health
                .update({ visitId: visit.id, healthDeclaration })
                .then(() => {
                  const pricing = navigation.getParam("pricing")

                  navigation.navigate({
                    routeName:
                      pricing.price > 0
                        ? "PaymentProviders"
                        : "ConfirmFreeVisit",
                    params: {
                      pricing,
                      visit,
                    },
                  })
                })
                .catch(error => {
                  setError(error)
                  setLoading(false)
                })
            }}
          />
        </Content>
      </ActionView>
    </>
  )
}
