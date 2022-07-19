import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Account from "../components/Account/Account";
import Claim from "./subpage/Subpage";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Best use of starkNet</title>
        <meta name="description" content="starkNet hackathon" />
        <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
        <link rel="manifest" href="/favicons/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/favicons/safari-pinned-tab.svg"
          color="#5bbad5"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Mukta:wght@300;400;500&family=Ubuntu:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <main className={styles.main}>
        <div className={styles.topNav}>
          <div className={styles.zkLend}></div>
          <Account />
        </div>
        <div className={styles.subpageWrapper}>
          <Claim />
        </div>
      </main>
    </div>
  );
};

export default Home;
