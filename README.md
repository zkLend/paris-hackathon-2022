# zkLend Paris Hackathon Submission - EIP712 StarkNet Account

zkLend is submitting an EIP-712-enabled account contract implementation.

# The problem

As of today, using StarkNet involves the following steps:

- decide on which StarkNet wallet to use
- download and install the said wallet
- generate and backup **yet another** keypair
- deploy the account contract

not to mention the cognitive overhead one has to bear during the process. This adds significant friction to the on-boarding process of existing layer-1 users.

# Existing solution (sort of)

Currently, OpenZeppelin has an account contract implementation using Ethereum signature called `EthAccount`. However, this account has serveral issues:

- it uses the layer-2 transaction hash directly, but there's no way to sign a raw hash (`personal_sign` prepends all data with a prefix) in standard web3 APIs, making it impossible to be used with an existing wallet like Metamask; and
- even if the above issue is resolved inside the account contract by taking into account the prefix, there's still a serious security issue since users would be signing opaque hashes.

# Our solution

We built an account contract implementation that works with the EIP-712 standard. Users can:

- use any existing Ethereum wallet with EIP-712 support; and
- leverage all hardware wallets supported by these layer-1 wallets (INCLUDING LEDGER!!); and
- still be able to see what EXACTLY is in the transaction, with a human-readable format.

The custom EIP-712 type is defined as:

```solidity
struct Call {
    uint256 account;
    uint256 nonce;
    uint256 max_fee;
    uint256 to;
    uint256 selector;
    uint256[] calldata;
}
```

Users will see all these information properly displayed on their layer-1 wallet UI before proceeding to sign.

# Limitations

Due to limited time, not all functionalities have been implemented. Notably, the multicall functionality hasn't been implemented and callers are required to send one call at a time only. However, implementing this should be trivial given we already have on-chain EIP-712 encoding working in Cairo.

# Further steps

The account implementation is nice, but the account itself still needs to be deployed on layer-2, which layer-1 wallets isn't capable of doing.

However, leveraging the trustless L1-L2 messaging, as well as the new `deploy` syscall in StarkNet, we can implement a trustless onboarder contract on layer-1 which users can simply call to have a layer-2 account deployed for them, potentially even bridging some Ether over at the same time for paying transaction fees on layer 2. The possibility is unlimited.
