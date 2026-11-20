import appJson from './app.json';

const isProductionBuild = process.env.EAS_BUILD_PROFILE === 'production';
const requiredProductionVariables = [
  'EXPO_PUBLIC_API_BASE_URL',
  'EXPO_PUBLIC_API_SERVER_SECRET',
  'EXPO_PUBLIC_SERVER_SECRET',
] as const;
const missingProductionVariables = requiredProductionVariables.filter(
  (key) => !process.env[key]?.trim(),
);

if (isProductionBuild && missingProductionVariables.length) {
  throw new Error(
    `Missing owners-app production environment variables: ${missingProductionVariables.join(', ')}`,
  );
}

export default appJson.expo;
