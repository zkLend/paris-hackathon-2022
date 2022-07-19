import styles from "./Subpage.module.css";
import { useAccount } from "../../hooks/useAccount";
import Modal from "../../components/modal/Modal";
import { stark } from "starknet";

enum ModalType {
  Create = "Create",
  Claim = "Claim",
}

export default function Claim() {
  const { account } = useAccount();

  const callArray = [
    {
      contractAddress:
        "0x6A7A6243F92A347C03C935CE4834C47CBD2A951536C10319168866DB9D57983".toLowerCase(), // fee token address on devnet
      entrypoint: "transfer",
      calldata: stark.compileCalldata({
        recipient: address.toLowerCase(), // put recipient address here
        amount: {
          type: "struct",
          ...uint256.bnToUint256(number.toBN("1000000000000000000")), // 1 ETH (1e18 wei)
        },
      }),
    },
  ];

  const msgParams = JSON.stringify({
    domain: {
      // Defining the chain aka Rinkeby testnet or Ethereum Main Net
      chainId: 1,
      // Give a user friendly name to the specific contract you are signing for.
      name: "Ether Mail",
      // If name isn't enough add verifying contract to make sure you are establishing contracts with the proper entity
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
      // Just let's you know the latest version. Definitely make sure the field name is correct.
      version: "1",
    },

    // Defining the message signing data content.
    message: {
      /*
       - Anything you want. Just a JSON Blob that encodes the data you want to send
       - No required fields
       - This is DApp Specific
       - Be as explicit as possible when building out the message schema.
      */
      contents: "Hello, Bob!",
      attachedMoneyInEth: 4.2,
      from: {
        name: "Cow",
        wallets: [
          "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
          "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF",
        ],
      },
      to: [
        {
          name: "Bob",
          wallets: [
            "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
            "0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57",
            "0xB0B0b0b0b0b0B000000000000000000000000000",
          ],
        },
      ],
    },
    // Refers to the keys of the *types* object below.
    primaryType: "Mail",
    types: {
      // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      // Not an EIP712Domain definition
      Group: [
        { name: "name", type: "string" },
        { name: "members", type: "Person[]" },
      ],
      // Refer to PrimaryType
      Mail: [
        { name: "from", type: "Person" },
        { name: "to", type: "Person[]" },
        { name: "contents", type: "string" },
      ],
      // Not an EIP712Domain definition
      Person: [
        { name: "name", type: "string" },
        { name: "wallets", type: "address[]" },
      ],
    },
  });

  async function onButtonClick() {
    if (account === undefined) return;
    const from = account;
    var params = [from, msgParams];
    var method = "eth_signTypedData_v4";
    ethereum.sendAsync({
      method,
      params,
      from,
    });
  }

  return (
    <div className={styles.subpageWrapper}>
      <Modal
        contentText="Claim a token from starkNet"
        isLoading={false}
        buttonText="Claim"
        disableButton={false}
        onButtonClick={onButtonClick}
      />
    </div>
  );
}
