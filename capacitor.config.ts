import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "me.nabdev.programmar",
  appName: "ProGrammar",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    extConfig: {},
    LiveUpdates: {
      appId: "28f7b0bb",
      channel: "development",
      autoUpdateMethod: "none",
      maxVersions: 2,
    }
  },
};

export default config;
