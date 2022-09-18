// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.0;

import '@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol';
import '@gnosis.pm/safe-contracts/contracts/base/GuardManager.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

/// @title MultiGuard - A guard that will allow enabling multiple Safe Guards.
/// @notice This guard is only meant as a development tool and example
/// @author Germán Martínez - <german@safe.global>
contract MultiGuard is Guard, Ownable {
    event AddedGuard(address guard);
    event RemovedGuard(address guard);

    address internal constant SENTINEL_GUARDS = address(0x1);
    mapping(address => address) internal guards;
    uint256 internal guardCount;

    constructor() {
        guards[SENTINEL_GUARDS] = SENTINEL_GUARDS;
        guardCount = 0;
    }

    function addGuard(address guard) public onlyOwner {
        // Guard address cannot be null, the sentinel or the Safe itself.
        require(
            guard != address(0) && guard != SENTINEL_GUARDS && guard != address(this),
            'Invalid guard address provided'
        );
        // No duplicate guards allowed.
        require(guards[guard] == address(0), 'Address is already a guard');
        guards[guard] = guards[SENTINEL_GUARDS];
        guards[SENTINEL_GUARDS] = guard;
        guardCount++;
        emit AddedGuard(guard);
    }

    function removeGuard(address prevGuard, address guard) public onlyOwner {
        // Validate guard address and check that it corresponds to guard index.
        require(guard != address(0) && guard != SENTINEL_GUARDS, 'Invalid guard address provided');
        require(guards[prevGuard] == guard, 'Invalid prevGuard and guard provided');
        guards[prevGuard] = guards[guard];
        guards[guard] = address(0);
        guardCount--;
        emit RemovedGuard(guard);
    }

    function getGuards() public view returns (address[] memory) {
        address[] memory array = new address[](guardCount);
        uint256 index = 0;
        address currentGuard = guards[SENTINEL_GUARDS];
        while (currentGuard != SENTINEL_GUARDS) {
            array[index] = currentGuard;
            currentGuard = guards[currentGuard];
            index++;
        }
        return array;
    }

    function checkTransaction(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation,
        uint256 safeTxGas,
        uint256 baseGas,
        uint256 gasPrice,
        address gasToken,
        address payable refundReceiver,
        bytes memory signatures,
        address msgSender
    ) external override {
        address currentGuard = guards[SENTINEL_GUARDS];
        while (currentGuard != SENTINEL_GUARDS) {
            Guard(currentGuard).checkTransaction(
                to,
                value,
                data,
                operation,
                safeTxGas,
                baseGas,
                gasPrice,
                gasToken,
                refundReceiver,
                signatures,
                msgSender
            );
            currentGuard = guards[currentGuard];
        }
    }

    function checkAfterExecution(bytes32 txHash, bool success) external override {
        address currentGuard = guards[SENTINEL_GUARDS];
        while (currentGuard != SENTINEL_GUARDS) {
            Guard(currentGuard).checkAfterExecution(txHash, success);
            currentGuard = guards[currentGuard];
        }
    }

    // solhint-disable-next-line payable-fallback
    fallback() external {
        // We don't revert on fallback to avoid issues in case of a Safe upgrade
        // E.g. The expected check method might change and then the Safe would be locked.
    }
}
