import { AddressZero } from '@ethersproject/constants'
import { deployments, ethers } from 'hardhat'
import { GnosisSafe } from '../../typechain/GnosisSafe'
import { GnosisSafeProxyFactory } from '../../typechain/GnosisSafeProxyFactory'
import { MultiGuard } from '../../typechain/MultiGuard'

export const getSafeSingleton = async (): Promise<GnosisSafe> => {
  const SafeDeployment = await deployments.get('GnosisSafe')
  const Safe = await ethers.getContractFactory('GnosisSafe')
  return Safe.attach(SafeDeployment.address) as GnosisSafe
}

export const getSafeProxyFactory = async (): Promise<GnosisSafeProxyFactory> => {
  const FactoryDeployment = await deployments.get('GnosisSafeProxyFactory')
  const Factory = await ethers.getContractFactory('GnosisSafeProxyFactory')
  return Factory.attach(FactoryDeployment.address) as GnosisSafeProxyFactory
}

export const getSafeTemplate = async (): Promise<GnosisSafe> => {
  const singleton = await getSafeSingleton()
  const factory = await getSafeProxyFactory()
  const template = await factory.callStatic.createProxy(singleton.address, '0x')
  await factory.createProxy(singleton.address, '0x').then((tx: any) => tx.wait())
  const Safe = await ethers.getContractFactory('GnosisSafe')
  return Safe.attach(template) as GnosisSafe
}

export const getSafeWithOwners = async (
  owners: string[],
  threshold?: number
): Promise<GnosisSafe> => {
  const template = await getSafeTemplate()
  await template.setup(
    owners,
    threshold || owners.length,
    AddressZero,
    '0x',
    AddressZero,
    AddressZero,
    0,
    AddressZero
  )
  return template as GnosisSafe
}

export const getMultiGuard = async (): Promise<MultiGuard> => {
  const MultiGuard = await ethers.getContractFactory('MultiGuard')
  const multiGuard = await MultiGuard.deploy()
  await multiGuard.deployed()
  return multiGuard as MultiGuard
}

export const getAllowListGuard = async (): Promise<AllowListGuard> => {
  const FactoryDeployment = await deployments.get('AllowListGuard')
  const Factory = await ethers.getContractFactory('AllowListGuard')
  return Factory.attach(FactoryDeployment.address) as AllowListGuard
}

export const getDenyListGuard = async (): Promise<DenyListGuard> => {
  const FactoryDeployment = await deployments.get('DenyListGuard')
  const Factory = await ethers.getContractFactory('DenyListGuard')
  return Factory.attach(FactoryDeployment.address) as DenyListGuard
}