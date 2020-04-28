# Toothie

## **Warning**

- `react-native-camera >=3.0.0` is incompatible with `react-native <0.60.0`.
- `env-cmd >= 9.0.0` (tested up to `9.0.3`) requires an .env which breaks our build

## Why both `.babelrc` and `babel.config.js`

Compatibility, mainly because of Jest which uses `babel.config.js`.
