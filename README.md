# README

This CLI will automate common tasks such as package versioning, releases, updating packages etc. and place it in a local registry on your machine. This is useful if you have libraries used between several applications but don't want to push them to public NPM or pay for a private repository.

## Install CLI / Update CLI

Install with:
`yarn global add emp-automate-cli`

Update with:
`yarn global upgrade emp-automate-cli`

## Commands

### emp release

Creates a new release of a package. Runs `yarn build` and `yarn pack` and then places the zip of your project in the local registry so you can install it elsewhere. Also creates tags for the release and a changelog.

### emp install

Install one of your released packages in another application. The command will guide you through choosing between packages and then place the zip of the package in a `.dependencies` folder in your repo. It will then locally link your zip file in your package.json and run `yarn install` to add it to your node_modules.

You can commit the zip to your git repo if you want to share them with other developers in your organization or if you build with a CI/CD pipelines.

### emp upgrade

Upgrades your packages to the latest versions. It will replace the zips in `.dependencies` with new ones and add new relative paths to your package.json, and finish with `yarn install`.

### emp build-release

This interactive command lets to checkout an old release of your package and build it to your local registry. This is used if your local registry is missing a specific version that you need to use in other projects.

### emp commit

This is a utility command that makes commiting quicker. Will add files, ask for commit message and push to the branch of your choice. Can also open the Pull Request window in your browser for that specific branch.
