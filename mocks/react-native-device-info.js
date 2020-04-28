jest.mock("react-native-device-info", () => {
  return {
    getBundleIdSync: jest.fn(),
    getUniqueIdSync: jest.fn(),
    getVersion: jest.fn(() => Promise.resolve()),
  }
})
