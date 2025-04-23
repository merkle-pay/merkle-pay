export const getPhantomEthereum = () => {
  if (typeof window === "undefined") {
    return null;
  }

  if ("phantom" in window) {
    const ethereum = window.phantom?.ethereum;

    if (ethereum?.isPhantom) {
      return ethereum;
    }
  }

  return null;
};
