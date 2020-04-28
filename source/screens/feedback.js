import React from "react"
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Alert,
} from "react-native"
import { getInset } from "react-native-safe-area-view"
import { feedback } from "../api"
import {
  Body,
  Button,
  CheckBox,
  ErrorMessage,
  Rating,
  TextInput,
  Title,
} from "../components"
import { useKeyboard } from "../hooks"
import { colors /* facebookAppEvents */ } from "../library"
import { Localization } from "../providers"

const { width: windowWidth } = Dimensions.get("window")

const RATINGS = ["One", "Two", "Three", "Four", "Five"]

export const Feedback = ({ navigation }) => {
  const strings = React.useContext(Localization.Context).getStrings()
  const [generalRating, setGeneralRating] = React.useState()
  const [generalComment, setGeneralComment] = React.useState()
  const [isAnonymousFeedback, setIsAnonymousFeedback] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState()

  const keyboard = useKeyboard()

  const visitId = navigation.getParam("visitId")
  const clinicianId = navigation.getParam("clinicianId")

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : null}
      contentContainerStyle={{ flex: 1 }}
    >
      {error && (
        <ErrorMessage
          style={{ paddingTop: getInset("top") || 20 }}
          title={strings.common.generalError}
        />
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
          paddingTop: getInset("top") || 20,
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: keyboard.visible ? 0 : getInset("bottom") || 20,
        }}
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            marginTop: "auto",
            marginBottom: "auto",
            paddingBottom: 60,
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 10,
            alignItems: "center",
          }}
        >
          <Title style={{ textAlign: "center", marginBottom: 20 }}>
            {strings.feedback.title}
          </Title>
          <Body style={{ textAlign: "center", marginBottom: 30 }}>
            {strings.feedback.description}
          </Body>

          <Rating
            style={{ marginBottom: 30 }}
            stars={RATINGS}
            selected={generalRating}
            onPress={setGeneralRating}
          />

          <TextInput
            style={{ marginBottom: 40 }}
            inputStyles={{ textAlign: "center" }}
            multiline
            value={generalComment}
            onChangeText={setGeneralComment}
            placeholder={strings.feedback.commentPlaceholder}
          />

          <CheckBox
            checked={isAnonymousFeedback}
            onPress={() => setIsAnonymousFeedback(state => !state)}
            title={strings.feedback.anonymous}
          />
        </View>

        <View>
          <Button
            primary={generalRating}
            backgroundColor={colors.green}
            title={strings.feedback.send}
            disabled={loading || !generalRating}
            loading={loading}
            onPress={() => {
              setError(undefined)
              setLoading(true)

              // facebookAppEvents.rated(RATINGS.indexOf(generalRating) + 1, {
              //   maxRatingValue: RATINGS.length,
              // })

              feedback({
                generalComment,
                generalRating,
                clinicianId,
                visitId,
                isAnonymousFeedback,
              })
                .then(() => {
                  navigation.navigate({
                    routeName: "Initialize",
                    params: { showSplashScreen: false },
                  })
                })
                .catch(error => {
                  setLoading(false)
                  setError(error)
                })
            }}
          />
          <Button
            basic
            color={colors.gray700}
            title={strings.common.skip}
            onPress={() =>
              generalRating
                ? Alert.alert(
                    strings.common.skip,
                    strings.feedback.skipMessage,
                    [
                      { text: strings.common.no },
                      {
                        text: strings.common.yes,
                        style: "destructive",
                        onPress: () =>
                          navigation.navigate({
                            routeName: "Initialize",
                            params: { showSplashScreen: false },
                          }),
                      },
                    ],
                  )
                : navigation.navigate({
                    routeName: "Initialize",
                    params: { showSplashScreen: false },
                  })
            }
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
