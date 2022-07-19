import React, { useContext, useEffect, useState } from "react";
import { providers } from "ethers";

const METAMASK_INJECT_TIMEOUT_MS = 1000;
const METAMASK_POLL_INTERVAL_MS = 100;

export enum MetamaskStatus {
  Loading = "Loading",
  NotInstalled = "NotInstalled",
  Ready = "Ready",
}

interface IContext {
  status: MetamaskStatus;
  metamask: providers.Web3Provider | undefined;
}

export function useMetamask(): IContext {
  return useContext(MetamaskContext);
}

export const MetamaskContext = React.createContext<IContext>({
  status: MetamaskStatus.Loading,
  metamask: undefined,
});

export const MetamaskProvider: React.FunctionComponent = ({ children }) => {
  const [status, setStatus] = useState<MetamaskStatus>(MetamaskStatus.Loading);
  const [metamask, setMetamask] = useState<providers.Web3Provider | undefined>(
    undefined
  );

  useEffect(() => {
    if (window.ethereum) {
      // Metamask already injected
      setMetamask(new providers.Web3Provider(window.ethereum));
      setStatus(MetamaskStatus.Ready);
    } else {
      // Metamask not injected. Poll for a certain period to determine if it's not installed.
      // Not sure if this is really needed though.
      // TODO: check if Metamask always injects before page load

      const timerStartTime: number = new Date().getTime();
      const timerId = setInterval(() => {
        if (window.ethereum) {
          // Metamask injected
          clearInterval(timerId);
          setMetamask(new providers.Web3Provider(window.ethereum));
          setStatus(MetamaskStatus.Ready);
        } else {
          // Metamask still not injected
          if (
            new Date().getTime() - timerStartTime >=
            METAMASK_INJECT_TIMEOUT_MS
          ) {
            // Metamask is not installed. No need to poll any more. Remove timer
            clearInterval(timerId);
            setStatus(MetamaskStatus.NotInstalled);
          }
        }
      }, METAMASK_POLL_INTERVAL_MS);

      return () => clearInterval(timerId);
    }
  }, []);

  return (
    <MetamaskContext.Provider
      value={{
        status,
        metamask,
      }}
    >
      {children}
    </MetamaskContext.Provider>
  );
};
