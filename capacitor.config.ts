import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "me.nabdev.prolingo",
  appName: "Prolingo",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    extConfig: {},
    LiveUpdates: {
      appId: "28f7b0bb",
      channel: "development",
      autoUpdateMethod: "background",
      maxVersions: 2,
    },
    SplashScreen: {
      launchAutoHide: false,
    },
  },
};

export default config;
