import { execSync } from 'child_process'

const typechainVersion = 'ethers-v5'
const outDir = './typechain'

const contracts = [
  './artifacts/@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol/GnosisSafe.json',
  './artifacts/@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxyFactory.sol/GnosisSafeProxyFactory.json',
  './artifacts/contracts/MultiGuard.sol/MultiGuard.json',
  './artifacts/contracts/exampleGuards/AllowListGuard.sol/AllowListGuard.json',
  './artifacts/contracts/exampleGuards/DenyListGuard.sol/DenyListGuard.json'
]

function generateTypechainFiles(contractPath: string): void {
  console.log(`typechain --target ${typechainVersion} --out-dir ${outDir} "${contractPath}"`)
  execSync(`typechain --target ${typechainVersion} --out-dir ${outDir} "${contractPath}"`)
}

contracts.map((contract) => generateTypechainFiles(contract))
