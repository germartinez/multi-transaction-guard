import { AddressZero } from '@ethersproject/constants'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { utils } from 'ethers'
import { deployments } from 'hardhat'
import { getAccounts } from './utils/accounts'
import { getAllowListGuard, getDenyListGuard, getMultiGuard, getSafeWithOwners } from './utils/contracts'
import { createTransaction, execTransaction, getTransactionHash, signMessage } from './utils/transactions'

chai.use(chaiAsPromised)

describe('GnosisSafe', () => {
  const setupTests = deployments.createFixture(async ({ deployments }) => {
    await deployments.fixture()
    const accounts = await getAccounts()
    const deployer = accounts[0]
    const provider = deployer.signer.provider
    const safe = await getSafeWithOwners([deployer.address])
    const multiGuard = await getMultiGuard()
    const allowListGuard = await getAllowListGuard()
    const denyListGuard = await getDenyListGuard()

    // Safe owns the MultiGuard
    await deployer.signer.sendTransaction({
      to: multiGuard.address,
      data: multiGuard.interface.encodeFunctionData('transferOwnership', [safe.address])
    })

    console.log('SAFE ADDRESS:', safe.address)
    console.log('OWNER ADDRESS:', accounts[0].address)
    console.log('MULTIGARD ADDRESS:', multiGuard.address)
    console.log('MULTIGARD OWNER:', await multiGuard.owner())
    console.log('DEBUG TRANSACTION GUARD 1:', allowListGuard.address)
    console.log('DEBUG TRANSACTION GUARD 2:', denyListGuard.address)
    return {
      safe,
      multiGuard,
      allowListGuard,
      denyListGuard,
      accounts,
      provider
    }
  })

  describe('setGuard', async () => {
    it('should enable the MultiGuard', async () => {
      const {
        safe,
        multiGuard,
        allowListGuard,
        denyListGuard,
        accounts,
        provider
      } = await setupTests()
      const [safeOwner] = accounts
      const guardSlot = '0x4a204f620c8c5ccdca3fd54d003badd85ba500436a431f0cbda4f558c93c34c8'

      // Safe has no guard enabled
      const encodedPreviousGuard = await provider?.getStorageAt(safe.address, guardSlot)
      const previousGuard = new utils.AbiCoder().decode(['address'], encodedPreviousGuard!)[0]
      await chai.expect(AddressZero).to.be.eq(previousGuard)

      // Enabling the MultiGard
      const safeTx = await createTransaction(
        safe,
        safe.address,
        0,
        safe.interface.encodeFunctionData('setGuard', [multiGuard.address])
      )
      const safeTxHash = await getTransactionHash(safe, safeTx)
      const signatures = await signMessage(safeOwner, safeTxHash)
      await execTransaction(safe, safeTx, signatures)

      // Safe has the MultiGard enabled
      const encodedCurrentGuard = await provider?.getStorageAt(safe.address, guardSlot)
      const currentGuard = new utils.AbiCoder().decode(['address'], encodedCurrentGuard!)[0]
      await chai.expect(multiGuard.address).to.be.eq(currentGuard)

      /*
      console.log(1)
      // Add 1º guard to MultiGuard
      const safeTx1 = await createTransaction(
        safe,
        multiGuard.address,
        0,
        multiGuard.interface.encodeFunctionData('addGuard', [allowListGuard.address])
      )
      const safeTxHash1 = await getTransactionHash(safe, safeTx1)
      const signatures1 = await signMessage(safeOwner, safeTxHash1)
      await execTransaction(safe, safeTx1, signatures1)

      console.log(2)
      // Add 2º guard to MultiGuard
      const safeTx2 = await createTransaction(
        safe,
        multiGuard.address,
        0,
        multiGuard.interface.encodeFunctionData('addGuard', [denyListGuard.address])
      )
      const safeTxHash2 = await getTransactionHash(safe, safeTx2)
      const signatures2 = await signMessage(safeOwner, safeTxHash2)
      await execTransaction(safe, safeTx2, signatures2)
      */
    })
  })
})
