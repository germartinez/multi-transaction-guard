// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0 <0.9.0;

import '@gnosis.pm/safe-contracts/contracts/common/Enum.sol';
import '@gnosis.pm/safe-contracts/contracts/base/GuardManager.sol';
import '@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

/// @title Allow List Guard - A guard that only allows transactions to enabled addresses.
/// @notice This guard is only meant as a development tool and example
/// @author Germán Martínez - <german@safe.global>
contract AllowListGuard is Guard, Ownable {
    event AddedAllowedAddress(address allowedAddress);
    event RemovedAllowedAddress(address allowedAddress);

    address internal constant SENTINEL_ADDRESS = address(0x1);
    mapping(address => address) internal allowedAddresses;
    uint256 internal allowedAddressesCount;

    constructor() {
        allowedAddresses[SENTINEL_ADDRESS] = SENTINEL_ADDRESS;
        allowedAddressesCount = 0;
    }

    function addAllowedAddress(address allowedAddress) public onlyOwner {
        // AllowedAddress address cannot be null, the sentinel or the Safe itself.
        require(
            allowedAddress != address(0) &&
                allowedAddress != SENTINEL_ADDRESS &&
                allowedAddress != address(this),
            'Invalid address provided'
        );
        // No duplicate allowedAddresses allowed.
        require(
            allowedAddresses[allowedAddress] == address(0),
            'Address is already allowed'
        );
        allowedAddresses[allowedAddress] = allowedAddresses[SENTINEL_ADDRESS];
        allowedAddresses[SENTINEL_ADDRESS] = allowedAddress;
        allowedAddressesCount++;
        emit AddedAllowedAddress(allowedAddress);
    }

    function removeAllowedAddress(address prevAllowedAddress, address allowedAddress)
        public
        onlyOwner
    {
        // Validate allowedAddress address and check that it corresponds to allowedAddress index.
        require(
            allowedAddress != address(0) && allowedAddress != SENTINEL_ADDRESS,
            'Invalid address provided'
        );
        require(
            allowedAddresses[prevAllowedAddress] == allowedAddress,
            'Invalid prevAddress and address provided'
        );
        allowedAddresses[prevAllowedAddress] = allowedAddresses[allowedAddress];
        allowedAddresses[allowedAddress] = address(0);
        allowedAddressesCount--;
        emit RemovedAllowedAddress(allowedAddress);
    }

    function getAllowedAddresses() public view returns (address[] memory) {
        address[] memory array = new address[](allowedAddressesCount);
        uint256 index = 0;
        address currentAllowedAddress = allowedAddresses[SENTINEL_ADDRESS];
        while (currentAllowedAddress != SENTINEL_ADDRESS) {
            array[index] = currentAllowedAddress;
            currentAllowedAddress = allowedAddresses[currentAllowedAddress];
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
        require(to != SENTINEL_ADDRESS && allowedAddresses[to] != address(0) , 'Destination address is not allowed');
    }

    function checkAfterExecution(bytes32 txHash, bool success) external override {}
}
