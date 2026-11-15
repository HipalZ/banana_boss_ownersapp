const webHost = typeof window !== 'undefined' ? window.location.hostname : '';
const isLocalWeb =
  webHost === 'localhost' ||
  webHost === '127.0.0.1' ||
  /^192\.168\.\d{1,3}\.\d{1,3}$/.test(webHost) ||
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(webHost) ||
  /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(webHost);

const pick = (...values: Array<string | undefined>): string | undefined =>
  values.find((value) => typeof value === 'string' && value.trim().length > 0);

const localApiBaseUrl = pick(
  process.env.EXPO_PUBLIC_DEV_API_BASE_URL,
  process.env.EXPO_PUBLIC_LOCAL_API_BASE_URL,
  isLocalWeb ? `http://${webHost}:4500` : undefined,
  process.env.EXPO_PUBLIC_API_BASE_URL,
  process.env['API_BASE_URL'],
  'http://localhost:4500',
);

const prodApiBaseUrl = pick(
  process.env.EXPO_PUBLIC_API_BASE_URL,
  process.env['API_BASE_URL'],
  'https://api.bananabillz.com',
);

export const API_BASE_URL = isLocalWeb ? localApiBaseUrl! : prodApiBaseUrl!;

export const SERVER_SECRET =
  (isLocalWeb
    ? pick(
        process.env.EXPO_PUBLIC_DEV_SERVER_SECRET,
        process.env.EXPO_PUBLIC_LOCAL_SERVER_SECRET,
        process.env.EXPO_PUBLIC_SERVER_SECRET,
        process.env['SERVER_SECRET'],
        'SERVER_SECRET',
      )
    : pick(
        process.env.EXPO_PUBLIC_SERVER_SECRET,
        process.env['SERVER_SECRET'],
        process.env.EXPO_PUBLIC_DEV_SERVER_SECRET,
        'SERVER_SECRET',
      )) ?? '';

export const API_SERVER_SECRET =
  (isLocalWeb
    ? pick(
        process.env.EXPO_PUBLIC_DEV_API_SERVER_SECRET,
        process.env.EXPO_PUBLIC_LOCAL_API_SERVER_SECRET,
        process.env.EXPO_PUBLIC_API_SERVER_SECRET,
        process.env['API_SERVER_SECRET'],
        'API_SERVER_SECRET',
      )
    : pick(
        process.env.EXPO_PUBLIC_API_SERVER_SECRET,
        process.env['API_SERVER_SECRET'],
        process.env.EXPO_PUBLIC_DEV_API_SERVER_SECRET,
        'API_SERVER_SECRET',
      )) ?? '';
