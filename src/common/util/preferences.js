import { useSelector } from 'react-redux';

const containsProperty = (object, key) =>
  Boolean(object && Object.prototype.hasOwnProperty.call(object, key) && object[key] !== null);

export const usePreference = (key, defaultValue) =>
  useSelector((state) => {
    const server = state?.session?.server;
    const user = state?.session?.user;

    if (server?.forceSettings) {
      if (containsProperty(server, key)) {
        return server[key];
      }
      if (containsProperty(user, key)) {
        return user[key];
      }
      return defaultValue;
    }
    if (containsProperty(user, key)) {
      return user[key];
    }
    if (containsProperty(server, key)) {
      return server[key];
    }
    return defaultValue;
  });

export const useAttributePreference = (key, defaultValue) =>
  useSelector((state) => {
    const serverAttributes = state?.session?.server?.attributes;
    const userAttributes = state?.session?.user?.attributes;
    const server = state?.session?.server;

    if (server?.forceSettings) {
      if (containsProperty(serverAttributes, key)) {
        return serverAttributes[key];
      }
      if (containsProperty(userAttributes, key)) {
        return userAttributes[key];
      }
      return defaultValue;
    }
    if (containsProperty(userAttributes, key)) {
      return userAttributes[key];
    }
    if (containsProperty(serverAttributes, key)) {
      return serverAttributes[key];
    }
    return defaultValue;
  });
