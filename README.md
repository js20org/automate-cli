# README

This CLI will automate common tasks such as package versioning, releases, updating packages etc.

## Install CLI / Update CLI

Install with:
`yarn global add emp-automate-cli`

Update with:
`yarn global upgrade emp-automate-cli`

## CLI Usage

### Version & Release

In a package that you want to version and release. Add this option to your package.json:

```json
{
    "emp": {
        "release": true
    }
}
```

Now run `emp release` to create a new version and release it locally on your own computer.

### Build release

If you have an existing release of a package that is not installed in your repository you can build it and install it with this command.

`emp build-release`

### Install / Upgrade

`emp install` should be used if you want to install a local emp package (you need to release it locally first). The install command is ran on a single project where you want the package to be installed.

The `emp upgrade` command can be ran on a root level and will upgrade local dependencies of all packages found by recursive search. If there are no local changes and you are on the master branch it will also push a commit with the package update.

### Verify

All the other commands that loads and reads your package.json will check the validity of the package.json file. But if you want to verify it manually you can run `emp verify` on a specific repo.

### New

To generate a new project scaffold you can run `emp new` in the directory where you want the files outputted. The prompts will guide you to the correct project.

### Status

Checks the status of all packages found in a recursive search. Status includes checking for local changes, outdated own packages, running tests, reporting coverage and audit issues.
