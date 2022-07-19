// SPDX-License-Identifier: Apache-2.0.
pragma solidity ^0.8.9;

interface IStarknetCore {
    /**
      Sends a message to an L2 contract.

      Returns the hash of the message.
    */
    function sendMessageToL2(
        uint256 toAddress,
        uint256 deployAccountSelector,
        uint256[] calldata payload
    ) external returns (bytes32);
}

contract StarkNetAccountOnboarder {
  IStarknetCore starknetCore;
  uint256 l2AccountOnboarder;
  uint256 deployAccountSelector;

  constructor(
    IStarknetCore starknetCore_, 
    uint256 l2AccountOnboarder_, 
    uint256 deployAccountSelector_
  ) {
    starknetCore = starknetCore_;
    l2AccountOnboarder = l2AccountOnboarder_;
    deployAccountSelector = deployAccountSelector_;
  }

  /*
    Send message to StarkNet core contract to create L2 account assoicated with L1 
  */
  function deploy_contract() external {
    uint256[] memory payload = new uint256[](1);
    payload[0] = uint(uint160(msg.sender));

    starknetCore.sendMessageToL2(l2AccountOnboarder, deployAccountSelector, payload);
  }
}

