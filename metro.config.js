/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const path = require("path")
const fs = require("fs")

const dotenvFilePath = path.resolve(__dirname, ".env")

const dotenv = fs.existsSync(dotenvFilePath)
  ? fs
      .readFileSync(dotenvFilePath, { encoding: "utf8" })
      .split("\n")
      .map(line => {
        const [key, value] = line.split("=")

        if (key && value) {
          return { [key.trim()]: value.trim() }
        } else {
          return {}
        }
      })
      .reduce((env, kv) => {
        Object.assign(env, kv)
        return env
      }, {})
  : {}

const env = JSON.stringify(
  Object.keys(process.env)
    .filter(variableName => variableName.match(/^MED_/))
    .reduce((env, variableName) => {
      Object.assign(env, { [variableName]: process.env[variableName] })
      return env
    }, dotenv),
  null,
  2,
)

console.log("Creating env.json")
console.log(env + "\n")

const envPath = path.resolve(__dirname, "source", "env.json")
console.log("Current directory:", __dirname)
console.log("Writing env.json to:", envPath)

fs.writeFileSync(envPath, env, {
  encoding: "utf8",
})

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    extraNodeModules: {
      path: path.resolve(__dirname, "node_modules", "path-browserify"),
      events: path.resolve(__dirname, "node_modules", "events"),
      buffer: path.resolve(__dirname, "node_modules", "buffer"),
      http: path.resolve(__dirname, "node_modules", "stream-http"),
      https: path.resolve(__dirname, "node_modules", "https-browserify"),
      url: path.resolve(__dirname, "node_modules", "url"),
    },
  },
}
