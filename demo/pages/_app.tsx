import "../styles/globals.css";
import type { AppProps } from "next/app";
import { MetamaskProvider } from "../hooks/useMetamask";
import { AccountProvider } from "../hooks/useAccount";
import { L2AccountProvider } from "../hooks/useLayerTwoWallet";
declare global {
  var ethereum: any;
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MetamaskProvider>
      <AccountProvider>
        <L2AccountProvider>
          <Component {...pageProps} />
        </L2AccountProvider>
      </AccountProvider>
    </MetamaskProvider>
  );
}

export default MyApp;
