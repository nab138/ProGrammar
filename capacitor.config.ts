import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'me.nabdev.programmingduolingo',
  appName: 'Programming Duolingo',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
