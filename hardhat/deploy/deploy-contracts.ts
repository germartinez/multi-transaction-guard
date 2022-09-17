import { HardhatRuntimeEnvironment } from 'hardhat/types'

const deploy = async (hre: HardhatRuntimeEnvironment): Promise<void> => {
  const { deployments, getNamedAccounts } = hre
  const { deployer } = await getNamedAccounts()
  const { deploy } = deployments

  await deploy('GnosisSafe', {
    from: deployer,
    args: [],
    log: true,
    deterministicDeployment: true
  })

  await deploy('GnosisSafeProxyFactory', {
    from: deployer,
    args: [],
    log: true,
    deterministicDeployment: true
  })

  await deploy('MultiGuard', {
    from: deployer,
    args: [],
    log: true,
    deterministicDeployment: true
  })
}

module.exports = deploy
