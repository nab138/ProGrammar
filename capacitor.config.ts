import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'programming.duolingo',
  appName: 'programming-duolingo',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
