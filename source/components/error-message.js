import React from "react"
import { Image, StyleSheet, TouchableOpacity, View } from "react-native"
import { colors, fonts } from "../library"
import { Body, Caption } from "./text"

export const ErrorMessage = ({ title, message, onClose, style, ...props }) => {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <View
      style={[
        {
          paddingLeft: 15,
          paddingTop: 20,
          paddingRight: 20,
          backgroundColor: colors.gray200,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.gray700,
          alignItems: "flex-end",
        },
        style,
      ]}
      {...props}
    >
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        <View
          style={{
            paddingRight: 13,
          }}
        >
          <Image
            style={{ tintColor: colors.red }}
            source={require("../assets/alert-triangle.png")}
          ></Image>
        </View>

        <View style={{ flex: 1 }}>
          {title && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flex: 1 }}>
                <Body
                  style={{
                    fontFamily: fonts.openSans.bold,
                    marginBottom: expanded ? 6 : 20,
                  }}
                  selectable={true}
                >
                  {title}
                </Body>
              </View>
            </View>
          )}

          {expanded && (
            <Caption style={{ marginBottom: 8 }} selectable={true}>
              {message}
            </Caption>
          )}
        </View>

        {!expanded && (
          <View
            style={{
              flexDirection: "row",
              marginTop: "auto",
              marginBottom: "auto",
              paddingBottom: 20,
              paddingLeft: 13,
            }}
          >
            {message && (
              <TouchableOpacity
                onPress={() => setExpanded(expanded => !expanded)}
              >
                <View>
                  <Image
                    style={{ tintColor: colors.secondary }}
                    source={require("../assets/plus.png")}
                  />
                </View>
              </TouchableOpacity>
            )}

            {onClose && (
              <TouchableOpacity onPress={onClose}>
                <View style={{ marginLeft: message ? 13 : 0 }}>
                  <Image
                    style={{ tintColor: colors.secondary }}
                    source={require("../assets/x.png")}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {expanded && (
        <View style={{ flexDirection: "row", paddingBottom: 13 }}>
          <TouchableOpacity onPress={() => setExpanded(expanded => !expanded)}>
            <View>
              <Image
                style={{ tintColor: colors.secondary }}
                source={require("../assets/minus.png")}
              />
            </View>
          </TouchableOpacity>

          {onClose && (
            <TouchableOpacity onPress={onClose}>
              <View style={{ marginLeft: 13 }}>
                <Image
                  style={{ tintColor: colors.secondary }}
                  source={require("../assets/x.png")}
                />
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
}
