# Bun Playground

Welcome to Bun Playground, a starter kit designed for developers looking to explore Bun, the incredibly fast JavaScript runtime, bundler, test runner, and package manager all in one. This starter kit simplifies the process of setting up a Bun project, complete with a pre-configured environment for Biome, and IDE setups for both Visual Studio Code (VSCode) and Zed.

## Features

- Bun: It's fast.
- Biome Linter/Editor: Simple code formatting and linting.
- IDE Support: Pre-configured settings for VSCode and Zed to get you up and running with no hassle.
- Simple Setup: A minimalistic approach to get you started with Bun without the overhead.

## Installation

To get started with Bun Playground, clone this repository:

```bash
git clone https://github.com/andyjessop/bun-playground.git
```

After cloning, navigate into the project directory and install the necessary dependencies:

```bash
cd bun-playground
bun install
```

## IDE Setup

### Visual Studio Code (VSCode)

Ensure you have the official Biome extension installed for linting and formatting.
The .vscode directory contains pre-configured settings for Bun and Biome.

### Zed

Zed automatically recognizes the .zed configuration file for Bun and Biome settings.

### Usage

```bash
bun serve
```

This will run the `src/index.ts` file.
