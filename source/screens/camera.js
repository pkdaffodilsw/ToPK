import React from "react"
import { Camera as CameraComponent } from "../components"
import { Pictures } from "../providers"

export const Camera = ({ navigation }) => {
  const pictures = React.useContext(Pictures.Context)

  const goBack = () => {
    const goBackTo = navigation.getParam("goBackTo")

    goBackTo
      ? navigation.navigate({ routeName: goBackTo })
      : navigation.goBack()
  }

  const med_metadata = navigation.getParam("metadata")

  return (
    <CameraComponent
      onClose={goBack}
      onPicture={picture => {
        pictures.add(
          med_metadata ? Object.assign(picture, { med_metadata }) : picture,
        )
        goBack()
      }}
    />
  )
}
