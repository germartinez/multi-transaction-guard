// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0 <0.9.0;

import 'hardhat/console.sol';
import '@gnosis.pm/safe-contracts/contracts/common/Enum.sol';
import '@gnosis.pm/safe-contracts/contracts/base/GuardManager.sol';
import '@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

/// @title Deny List Guard - A guard that rejects transactions to denied addresses.
/// @notice This guard is only meant as a development tool and example
/// @author Germán Martínez - <german@safe.global>
contract DenyListGuard is Guard, Ownable {
    event AddedDeniedAddress(address deniedAddress);
    event RemovedDeniedAddress(address deniedAddress);

    address internal constant SENTINEL_ADDRESS = address(0x1);
    mapping(address => address) internal deniedAddresses;
    uint256 internal deniedAddressesCount;

    constructor() {
        deniedAddresses[SENTINEL_ADDRESS] = SENTINEL_ADDRESS;
        deniedAddressesCount = 0;
    }

    function addDeniedAddress(address deniedAddress) public onlyOwner {
        // DeniedAddress address cannot be null, the sentinel or the Safe itself.
        require(
            deniedAddress != address(0) &&
                deniedAddress != SENTINEL_ADDRESS &&
                deniedAddress != address(this),
            'Invalid address provided'
        );
        // No duplicate deniedAddresses denied.
        require(deniedAddresses[deniedAddress] == address(0), 'Address is already denied');
        deniedAddresses[deniedAddress] = deniedAddresses[SENTINEL_ADDRESS];
        deniedAddresses[SENTINEL_ADDRESS] = deniedAddress;
        deniedAddressesCount++;
        emit AddedDeniedAddress(deniedAddress);
    }

    function removeDeniedAddress(address prevDeniedAddress, address deniedAddress)
        public
        onlyOwner
    {
        // Validate deniedAddress address and check that it corresponds to deniedAddress index.
        require(
            deniedAddress != address(0) && deniedAddress != SENTINEL_ADDRESS,
            'Invalid address provided'
        );
        require(
            deniedAddresses[prevDeniedAddress] == deniedAddress,
            'Invalid prevAddress and address provided'
        );
        deniedAddresses[prevDeniedAddress] = deniedAddresses[deniedAddress];
        deniedAddresses[deniedAddress] = address(0);
        deniedAddressesCount--;
        emit RemovedDeniedAddress(deniedAddress);
    }

    function getDeniedAddresses() public view returns (address[] memory) {
        address[] memory array = new address[](deniedAddressesCount);
        uint256 index = 0;
        address currentDeniedAddress = deniedAddresses[SENTINEL_ADDRESS];
        while (currentDeniedAddress != SENTINEL_ADDRESS) {
            array[index] = currentDeniedAddress;
            currentDeniedAddress = deniedAddresses[currentDeniedAddress];
            index++;
        }
        return array;
    }

    // solhint-disable-next-line payable-fallback
    fallback() external {
        // We don't revert on fallback to avoid issues in case of a Safe upgrade
        // E.g. The expected check method might change and then the Safe would be locked.
    }

    event TransactionDetails(
        address indexed safe,
        bytes32 indexed txHash,
        address to,
        uint256 value,
        bytes data,
        Enum.Operation operation,
        uint256 safeTxGas,
        bool usesRefund,
        uint256 nonce
    );

    function checkTransaction(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation,
        uint256 safeTxGas,
        uint256 baseGas,
        uint256 gasPrice,
        address gasToken,
        // solhint-disable-next-line no-unused-vars
        address payable refundReceiver,
        bytes memory,
        address
    ) external override {
        require(to != SENTINEL_ADDRESS && deniedAddresses[to] == address(0) , 'Destination address is not allowed');
    }

    function checkAfterExecution(bytes32 txHash, bool success) external override {}
}
