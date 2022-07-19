import { ethers } from "ethers";
import React, { useContext, useState, useCallback } from "react";
import { useEffect } from "react";
import { MetamaskStatus, useMetamask } from "./useMetamask";

export enum WalletStatus {
  MetamaskNotInstalled = "Metamask Not Installed",
  Connecting = "Connecting",
  Switching = "Switching",
  Disconnected = "Connect to Metamask",
  Loading = "Loading",
  Ready = "Ready",
  NonTargetChain = "Non Target Chain",
}
interface IContext {
  account: string | undefined;
  walletStatus: WalletStatus;
  requestConnected: () => Promise<void>;
  requestNetworkChange: () => Promise<void>;
  importToken: () => Promise<void>;
}

export function useAccount(): IContext {
  return useContext(AccountContext);
}

export const AccountContext = React.createContext<IContext>({
  walletStatus: WalletStatus.Loading,
  account: undefined,
  requestConnected: async () => {},
  requestNetworkChange: async () => {},
  importToken: async () => {},
});

export const AccountProvider: React.FunctionComponent = ({ children }) => {
  const [account, setAccount] = useState<string | undefined>(undefined);
  const [walletStatus, setWalletStatus] = useState<WalletStatus>(
    WalletStatus.Loading
  );

  const { metamask, status } = useMetamask();

  const requestConnected = async () => {
    if (status === MetamaskStatus.Ready) {
      setWalletStatus(WalletStatus.Connecting);
      try {
        let accounts = await metamask?.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
      } catch (err: any) {
        if (err.code === 4001) {
          setWalletStatus(WalletStatus.Disconnected);
        } else {
          console.error(err);
        }
      }
    }
  };

  const requestNetworkChange = async () => {
    let targetChainIdHex = ethers.BigNumber.from(
      process.env.NEXT_PUBLIC_TARGET_CHAIN_ID
    ).toHexString();
    if (targetChainIdHex.length > 3 && targetChainIdHex.startsWith("0x0")) {
      targetChainIdHex = "0x" + targetChainIdHex.substring(3);
    }
    if (status === MetamaskStatus.Ready) {
      setWalletStatus(WalletStatus.Switching);
      try {
        await metamask?.send("wallet_switchEthereumChain", [
          {
            chainId: targetChainIdHex,
          },
        ]);
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: targetChainIdHex,
                  chainName: process.env.NEXT_PUBLIC_TARGET_CHAIN_NAME,
                  nativeCurrency: {
                    name: process.env.NEXT_PUBLIC_TARGET_CHAIN_NAME,
                    symbol:
                      process.env.NEXT_PUBLIC_TARGET_CHAIN_CURRENCY_SYMBOL,
                    decimals: 18,
                  },
                  rpcUrls: [process.env.NEXT_PUBLIC_TARGET_CHAIN_RPCURL],
                  blockExplorerUrls: [
                    process.env.NEXT_PUBLIC_TARGET_CHAIN_EXPLORER,
                  ],
                },
              ],
            });
          } catch (addError) {
            console.log(addError, "errors in adding target chain to metamask");
            setWalletStatus(WalletStatus.NonTargetChain);
          }
        } else {
          setWalletStatus(WalletStatus.NonTargetChain);
        }
      }
    }
  };

  const getNetwork = useCallback(async () => {
    await metamask
      ?.getNetwork()
      .then((network) => {
        if (
          network.chainId.toString() === process.env.NEXT_PUBLIC_TARGET_CHAIN_ID
        ) {
          setWalletStatus(WalletStatus.Ready);
        } else setWalletStatus(WalletStatus.NonTargetChain);
      })
      .catch((error) =>
        console.log(`error occurs when getting Network. Details:${error}`)
      );
  }, [metamask]);

  const getConnectedAccount = useCallback(async () => {
    if (status === MetamaskStatus.NotInstalled) {
      setWalletStatus(WalletStatus.MetamaskNotInstalled);
    } else if (status === MetamaskStatus.Ready) {
      await metamask
        ?.listAccounts()
        .then(async (accounts) => {
          if (accounts.length !== undefined && accounts.length !== 0) {
            setAccount(accounts[0]);
            await getNetwork();
          } else setWalletStatus(WalletStatus.Disconnected);
        })

        .catch((error) =>
          console.log(
            `error occurs when getting connected account. Details:${error}`
          )
        );
    }
  }, [metamask, status, getNetwork]);

  const importToken = async () => {
    try {
      const result = await ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: process.env.NEXT_PUBLIC_TOKEN_ADDRESS,
            symbol: process.env.NEXT_PUBLIC_TOKEN_SYMBOL,
            decimals: 18,
            image: `${window.location}${process.env.NEXT_PUBLIC_TOKEN_IMAGE_URL}`,
          },
        },
      });
    } catch (addError) {
      console.log(addError, "errors in adding token to metamask");
    }
  };

  useEffect(() => {
    const loadAccount = async () => {
      await getConnectedAccount();
    };
    loadAccount();
  }, [account, getConnectedAccount]);

  useEffect(() => {
    window.ethereum?.on("accountsChanged", (accounts: string[]) => {
      setAccount(accounts[0]);
    });

    window.ethereum?.on("chainChanged", () => {
      window.location.reload();
    });
  });

  return (
    <AccountContext.Provider
      value={{
        account,
        walletStatus,
        requestConnected,
        requestNetworkChange,
        importToken,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
