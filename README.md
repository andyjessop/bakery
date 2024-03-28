<p align="center">
  <img src="./assets/bakery2.png" />
</p>

# Bakery

Bakery is a monorepo task runner that allows you to efficiently run scripts across multiple packages in your repository. It provides commands to run tasks on all packages or only on affected packages based on changes since a specified commit.

## Usage

To use Bakery, navigate to your monorepo's root directory and run the following commands:

### Running a script on all packages

To run a script on all packages in the monorepo, use the run command followed by the --script flag:

```bash
bun command run --script=<script-name>
```

Replace <script-name> with the name of the script you want to run, such as test or build. For example:

```bash
bun command run --script=test
bun command run --script=build
```

### Running a script on affected packages

To run a script only on packages affected by changes since a specific commit, use the affected command followed by the --script flag:

```bash
bun command affected --script=<script-name>
```

Replace <script-name> with the name of the script you want to run. Bakery will automatically determine which packages have been affected by changes and run the specified script only on those packages. For example:

```bash
bun command affected --script=test
```

### Running a script on specific packages

To run a script on specific packages, use the run command with the --script flag and the packages flag followed by a comma-separated list of package names:

```bash
bun command run --script=<script-name> packages=<package1>,<package2>,...
```

Replace <script-name> with the name of the script you want to run, and <package1>,<package2>,... with the names of the packages you want to include. For example:

```bash
bun command run --script=test packages=pkg-a,pkg-b
```

## Configuration

Bakery looks for a bakery.json file in the root directory of your monorepo to configure task dependencies. The bakery.json file should have the following structure:

```json
{
  "tasks": {
    "<script-name>": {
      "dependsOn": ["<dependency1>", "<dependency2>", ...]
    }
  }
}
```

Replace <script-name> with the name of the script, and <dependency1>, <dependency2>, etc., with the names of the packages that the script depends on.

## How it works

Bakery uses a graph-based approach to determine the affected packages and the order in which tasks should be executed. It analyzes the dependencies between packages and builds a task pipeline based on the specified script and the affected packages.

The task runner then executes the tasks in the pipeline, ensuring that dependencies are respected and that tasks are run in parallel when possible.

## Requirements

Bun runtime environment.

## Limitations

Bakery is currently designed to be used within the monorepo and is not published as a standalone package.
