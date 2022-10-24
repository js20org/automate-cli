# README

This CLI will automate common tasks such as package versioning, releases, updating packages etc.

## Building

Build the tool with

- yarn build

### First time usage

Make the `bin/automate-cli.sh` file executable, e.g. `chmod +x ./bin/automate-cli.sh`.
Make an alias for the file and add the correct environment variables:

* `cd ~`
* `nano .bash_profile` (or `~/.config/fish/config.fish`)
* Add alias / variables
* Save and close
* Source the profile with `. .bash_profile`
* No the command `emp` should exist

Example `.bash_profile`:

```sh
# Defines the root directory. This will be used to save releases under root/.releases
export EMPIRISKA_RELEASE_ROOT=/Users/robin/development
# Where the bash script for the tool is located
alias emp="~/development/automate-cli/bin/automate-cli.sh"
```

## Usage

### Version & Release
In a package that you want to version and release. Add this option to your package.json:

```json
{
    "empiriska": {
        "release": true
    }
}
```

Now run `emp release` to create a new version and release it locally on your own computer.


#### Release only
If you locally want to release a specific version that has already been created then run:

`emp release-local`


### Install / Upgrade
`emp install` should be used if you want to install a local empiriska package (you need to release it locally first).
The install command is ran on a single project where you want the package to be installed.

The `emp upgrade` command can be ran on a root level and will upgrade local dependencies of all packages found by recursive search. If there are no local changes and you are on the master branch it will also push a commit with the package update.


### Verify
All the other commands that loads and reads your package.json will check the validity of the package.json file. But if you want to verify it manually you can run `emp verify` on a specific repo.


### New
To generate a new project scaffold you can run `emp new` in the directory where you want the files outputted. The prompts will guide you to the correct project.


### Status
Checks the status of all packages found in a recursive search. Status includes checking for local changes, outdated own packages, running tests, reporting coverage and audit issues.
