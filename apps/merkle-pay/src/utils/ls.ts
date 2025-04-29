export const ls = {
  get: (key: string) => {
    return window.localStorage.getItem(key);
  },
  set: (key: string, value: string) => {
    window.localStorage.setItem(key, value);
  },
  remove: (key: string) => {
    window.localStorage.removeItem(key);
  },
  clear: () => {
    window.localStorage.clear();
  },
};
