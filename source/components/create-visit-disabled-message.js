import React from "react"
import { Localization, Visits } from "../providers"
import { Message } from "./message"

export const CreateVisitDisabledMessage = ({ navigation }) => {
  const strings = React.useContext(Localization.Context).getStrings()
  const visits = React.useContext(Visits.Context)

  return visits.state.queued ? (
    <Message
      type="secondary"
      message={strings.node.existingQueuedVisit}
      onPress={() => navigation.navigate("History")}
    />
  ) : visits.state.active ? (
    <Message
      type="primary"
      message={strings.node.onGoingCall}
      onPress={() => navigation.navigate("Call")}
    />
  ) : null
}
