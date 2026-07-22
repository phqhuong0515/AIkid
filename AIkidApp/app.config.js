const app = require('./app.json');

module.exports = () => {
  const baseUrl = process.env.EXPO_PUBLIC_WEB_BASE_URL?.trim();
  return {
    ...app.expo,
    experiments: {
      ...app.expo.experiments,
      ...(baseUrl ? { baseUrl } : {}),
    },
  };
};
