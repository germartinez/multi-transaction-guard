# Check Mate

Check Mate allows to compose and setup a suite of multiple on-chain transaction checks in your smart contract account.

![cover image](https://user-images.githubusercontent.com/6764315/190893347-2c3ac87b-5119-4881-84a9-93743dab4107.png)

## The problem it solves

The *Safe* (formerly *Gnosis Safe*) allows to setup a transaction guard that performs some checks before and after the state changes when executing a transaction. *Check Mate* allows to set up a transaction guard that manages multiple guards, composing and ordering by priority all the on-chain transaction checks that are performed.

This adds some benefits to the initial solution:

- Only devs who can write smart contracts can use a one-guard solution that is customized to fit their needs.

- Having all the transaction checks in just one guard implies that it has to be updated every time the checked conditions change increasing the risk of introducing new bugs.

- A modular solution allows to easily add and remove specific checks and build a customized check suite for your smart contract account in a no-code way for the user.

- Creating small and specific checks as public goods that can be easily reused and composed by the community will increase the adoption of transaction guards, allowing a lot more people to benefit from them.

## Installation

Install the project with:

```
yarn install
```

## Build

Compile the contracts and generate the corresponding types with:

```
yarn build
```

## Deployment

Deploy the contracts with:

```
yarn deploy --network goerli
```

## Testing

Run the test with:

```
yarn test
```

## Security and Liability

All contracts are WITHOUT ANY WARRANTY and are only meant as a development tool and example.
