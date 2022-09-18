import { AddressZero } from '@ethersproject/constants'
import { utils } from 'ethers'
import { GnosisSafe } from '../../typechain/GnosisSafe'
import { Account } from './accounts'

export async function createTransaction(
  safe: GnosisSafe,
  to: string,
  value: number,
  data: string
): Promise<any> {
  const safeTransaction = {
    to,
    value,
    data,
    operation: 0,
    safeTxGas: AddressZero,
    baseGas: AddressZero,
    gasPrice: AddressZero,
    gasToken: AddressZero,
    refundReceiver: AddressZero,
    nonce: await safe.nonce()
  }
  return safeTransaction
}

export async function getTransactionHash(safe: GnosisSafe, safeTx: any): Promise<string> {
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
  return safeTxHash
}

export async function signMessage(safeOwner: Account, safeTxHash: string): Promise<string> {
  const signature = await safeOwner.signer.signMessage(utils.arrayify(safeTxHash))
  const adjustedSignatures = signature.replace(/1b$/, '1f').replace(/1c$/, '20')
  return adjustedSignatures
}

export async function execTransaction(
  safe: GnosisSafe,
  safeTx: any,
  signatures: string
): Promise<any> {
  const txResponse = await safe.execTransaction(
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
  return txResponse
}
