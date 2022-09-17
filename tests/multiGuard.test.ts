import { AddressZero } from '@ethersproject/constants'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { utils } from 'ethers'
import { deployments } from 'hardhat'
import { getAccounts } from './utils/accounts'
import { getMultiGuard, getSafeWithOwners } from './utils/contracts'

chai.use(chaiAsPromised)

describe('GnosisSafe', () => {
  const setupTests = deployments.createFixture(async ({ deployments }) => {
    await deployments.fixture()
    const accounts = await getAccounts()
    return {
      safe: await getSafeWithOwners([accounts[0].address]),
      multiGuard: await getMultiGuard(),
      accounts
    }
  })

  describe('setGuard', async () => {
    it('should enable the MultiGuard', async () => {
      const { safe, multiGuard, accounts } = await setupTests()
      const [safeOwner] = accounts
      const provider = safeOwner.signer.provider
      const guardSlot = '0x4a204f620c8c5ccdca3fd54d003badd85ba500436a431f0cbda4f558c93c34c8'

      const encodedPreviousGuard = await provider?.getStorageAt(safe.address, guardSlot)
      const previousGuard = new utils.AbiCoder().decode(['address'], encodedPreviousGuard!)[0]
      await chai.expect(AddressZero).to.be.eq(previousGuard)

      const safeTx = {
        to: safe.address,
        value: 0,
        data: safe.interface.encodeFunctionData('setGuard', [multiGuard.address]),
        operation: 0,
        safeTxGas: AddressZero,
        baseGas: AddressZero,
        gasPrice: AddressZero,
        gasToken: AddressZero,
        refundReceiver: AddressZero,
        nonce: await safe.nonce()
      }
      const safeTxHash = await safe.getTransactionHash(
        safeTx.to,
        safeTx.value,
        safeTx.data,
        safeTx.operation,
        safeTx.safeTxGas,
        safeTx.baseGas,
        safeTx.gasPrice,
        safeTx.gasToken,
        safeTx.refundReceiver,
        safeTx.nonce
      )
      const signatures = (await safeOwner.signer.signMessage(utils.arrayify(safeTxHash)))
        .replace(/1b$/, '1f')
        .replace(/1c$/, '20')
      await safe.execTransaction(
        safeTx.to,
        safeTx.value,
        safeTx.data,
        safeTx.operation,
        safeTx.safeTxGas,
        safeTx.baseGas,
        safeTx.gasPrice,
        safeTx.gasToken,
        safeTx.refundReceiver,
        signatures
      )

      const encodedCurrentGuard = await provider?.getStorageAt(safe.address, guardSlot)
      const currentGuard = new utils.AbiCoder().decode(['address'], encodedCurrentGuard!)[0]
      await chai.expect(multiGuard.address).to.be.eq(currentGuard)
    })
  })
})
