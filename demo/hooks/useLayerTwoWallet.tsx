import React, { useContext, useEffect, useCallback, useState } from "react";
import { useAccount } from "./useAccount";
import axios from "axios";

export enum L2AccountStatus {
  Loading = "Loading",
  Ready = "Ready",
  NotCreated = "Not Created",
}

export interface IContext {
  l2AccountStatus: L2AccountStatus;
}

export function useL2Account(): IContext {
  return useContext(l2AccountContext);
}

export const l2AccountContext = React.createContext<IContext>({
  l2AccountStatus: L2AccountStatus.Loading,
});

export const L2AccountProvider: React.FunctionComponent = ({ children }) => {
  const { account } = useAccount();
  const [l2AccountStatus, setL2AccountStatus] = useState<L2AccountStatus>(
    L2AccountStatus.Loading
  );

  const checkL2Account = useCallback(async () => {
    if (account !== undefined) {
      await axios
        .get(
          `https://alpha4.starknet.io/feeder_gateway/get_class_hash_at?contractAddress=${"0x020ee7906bdb8a5e43269b744927ad971c170e22baab36aa04798879fbf6f500"}`
        )
        .then((res) => setL2AccountStatus(L2AccountStatus.Ready))
        .catch((err) => setL2AccountStatus(L2AccountStatus.NotCreated));
    }
  }, [account]);

  useEffect(() => {
    checkL2Account();
  }, [checkL2Account]);

  return (
    <l2AccountContext.Provider
      value={{
        l2AccountStatus,
      }}
    >
      {children}
    </l2AccountContext.Provider>
  );
};
