# RISC Zero Foundry for Eth Garage

This module in Eth Garage implements a decentralized application on Ethereum utilizing RISC Zero as a [coprocessor] to the smart contract application.

Prove computation with the [RISC Zero zkVM] and verify the results in your Ethereum contract.

## Overview

1. Run your application logic in the [RISC Zero zkVM]. The provided [publisher] app sends an off-chain proof request to the [Bonsai] proving service.
2. [Bonsai] generates the program result, written to the [journal], and a SNARK proof of its correctness.
3. The [publisher] app submits this proof and journal on-chain to your app contract for validation.
4. Your app contract calls the [RISC Zero Verifier] to validate the proof. If the verification is successful, the journal is deemed trustworthy and can be safely used.

## Dependencies

First, [install Rust] and [Foundry], and then restart your terminal.

```sh
# Install Rust
curl https://sh.rustup.rs -sSf | sh
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
```

Next, you will need to install the `cargo risczero` tool.
We'll use [`cargo binstall`][cargo-binstall] to get `cargo-risczero` installed, and then install the `risc0` toolchain.
See [RISC Zero installation] for more details.

```sh
cargo install cargo-binstall
cargo binstall cargo-risczero
cargo risczero install
```

Now you have all the tools you need to develop and deploy an application with [RISC Zero].

## Quick Start

First, install the RISC Zero toolchain using the [instructions above](#dependencies).

Now, you can initialize a new RISC Zero project at a location of your choosing:

```sh
forge init -t risc0/bonsai-foundry-template ./my-project
```

Congratulations! You've just started your first RISC Zero project.

Your new project consists of:

- a [zkVM program] (written in Rust), which specifies a computation that will be proven;
- a [app contract] (written in Solidity), which uses the proven results;
- a [publisher] which makes proving requests to [Bonsai] and posts the proof to Ethereum.
  We provide an example implementation, but your dApp interface or application servers could act as the publisher.

### Build the Code

- Builds for zkVM program, the publisher app, and any other Rust code.

  ```sh
  cargo build
  ```

- Build your Solidity smart contracts

  > NOTE: `cargo build` needs to run first to generate the `ImageID.sol` contract.

  ```sh
  forge build
  ```

### Run the Tests

- Tests your zkVM program.

  ```sh
  cargo test
  ```

- Test your Solidity contracts, integrated with your zkVM program.

  ```sh
  RISC0_DEV_MODE=true forge test -vvv 
  ```

## Develop Your Application

To build your application, you'll need to make changes in three folders:

- write the code you want proven in the [methods/guest](./methods/guest/) folder.
- write the on-chain part of your project in the [contracts](./contracts/) folder.
- adjust the publisher example in the [apps](./apps/) folder.

### Configuring Bonsai

***Note:*** *To request an API key [complete the form here](https://bonsai.xyz/apply).*

With the Bonsai proving service, you can produce a [Groth16 SNARK proof] that is verifiable on-chain.
You can get started by setting the following environment variables with your API key and associated URL.

```bash
export BONSAI_API_KEY="YOUR_API_KEY" # see form linked above
export BONSAI_API_URL="BONSAI_URL" # provided with your api key
```

Now if you run `forge test` with `RISC0_DEV_MODE=false`, the test will run as before, but will additionally use the fully verifying `RiscZeroGroth16Verifier` contract instead of `MockRiscZeroVerifier` and will request a SNARK receipt from Bonsai.

```bash
RISC0_DEV_MODE=false forge test -vvv
```

### Deterministic Builds

By setting the environment variable `RISC0_USE_DOCKER` a containerized build process via Docker will ensure that all builds of your guest code, regardless of the machine or local environment, will produce the same [image ID][image-id].
The [image ID][image-id], and its importance to security, is explained in more detail in our [developer FAQ].

```bash
RISC0_USE_DOCKER=1 cargo build
```

> ***Note:*** *This requires having Docker installed and in your PATH. To install Docker see [Get Docker].*

## Deploy Your Application

When you're ready, follow the [deployment guide] to get your application running on [Sepolia].

