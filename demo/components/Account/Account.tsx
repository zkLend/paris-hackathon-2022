import styles from "./Account.module.css";
import { useAccount, WalletStatus } from "../../hooks/useAccount";

export default function Account() {
  const { account, walletStatus, requestConnected, requestNetworkChange } =
    useAccount();

  function accountButtonClick() {
    if (walletStatus === WalletStatus.MetamaskNotInstalled) {
      window.open(`https://metamask.app.link/dapp/${window.location.host}/`);
    } else if (walletStatus === WalletStatus.NonTargetChain) {
      requestNetworkChange();
    } else if (walletStatus === WalletStatus.Disconnected) {
      requestConnected();
    }
  }

  return (
    <>
      {walletStatus === WalletStatus.Ready ? (
        <div className={`${styles.container} ${styles.account}`}>
          <span className={styles.connected}>Connected</span>
          <span>
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </span>
        </div>
      ) : (
        <div
          className={`${styles.container} ${styles.walletStatus}`}
          onClick={accountButtonClick}
        >
          <div className={styles.textWrapper}>
            {walletStatus === WalletStatus.MetamaskNotInstalled
              ? "Intall Metamask"
              : walletStatus}
          </div>
        </div>
      )}
    </>
  );
}
