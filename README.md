# README

This CLI will automate common tasks such as package versioning, releases, updating packages etc. and place it in a local registry on your machine. This is useful if you have libraries used between several applications but don't want to push them to public NPM or pay for a private repository.

## Install CLI / Update CLI

Install with:
`yarn global add emp-automate-cli`

Update with:
`yarn global upgrade emp-automate-cli`

## Commands

Add flag `--help` to list all commands.
Add flag `--debug` to debug things like writing files with the `new` command.

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

### emp new & emp template-setup

The `emp new` command is designed to help you automatically create new project templates for when creating a new coding repository. A project template is basically a boilerplate with a collection of relevant files to quickly get started with a new project (think create-react-app but for any project). A project templates can contain any files and you can make many templates for different use cases. For instance if you want a template for a node app you can fill the template with files like webpack, babel, package.json and some basic code files with hello world logic.

The first step to use templates is to setup one or more "template roots", which is a directory where your templates are located. Each template root can have any file structure, but it is required that you have a file called "templates.json" in the root of the directory.

So for instance if I want my project templates in a folder like `~/development/templates` I have to provide a file `~/development/templates/templates.json`.

The templates.json file provides all info about different questions and choices the user can do when installing the template.

The templates.json file should be an array of ITemplate objects. The specification for the ITemplate object is found in `src/types.ts`.

Here is an example of a template:

```json
[
    {
        "name": "backend",
        "questions": [
            {
                "type": "string",
                "question": "What is your project name?",
                "variable": "$projectName$"
            },
            {
                "type": "boolean",
                "question": "Do you want user authentication?",
                "variable": "$shouldUseAuth$"
            }
        ],
        "files": [
            {
                "path": "./backend/general"
            },
            {
                "path": "./backend/auth",
                "includeIf": "$shouldUseAuth$"
            }
        ]
    }
]
```

File structure:

```
templates
    backend
        auth
            src
                > auth.js
        general
            src
                > index.js
            > _.env
            > _.gitignore
            > _tsconfig.json
            > package.json
            > webpack-dev.config.js
    > templates.json
```

If the user answers yes to auth, the final file structure for the new project will be:

```
    src
        > auth.js
        > index.js
    > .env
    > .gitignore
    > package.json
    > tsconfig.json
    > webpack-dev.config.js
```

#### User questions

You can ask any questions to the user while installing the template to make different decisions. We can choose whether to ask for a string or yes/no boolean. We define the questions, and define what the variable name should be. You can choose any format of variable names, e.g. `$projectName$` or `###projectName` or whatever format you want.

#### Different files depending on answers

As you can see in the example above we can add multiple paths in the "files" array. The first one with only a path will always be included and all the files in that directory will be added to your new project. The second one with "includeIf" will only add the included files if the answer to the auth question `$shouldUseAuth$` is true.

#### Replacing values in files

You can use any variable inside the files of your template, and the system will automatically replace all the variables with the value the user chose. So for instance we ask for the name of the package, and in the package.json file we can then reference the variable like this:

```json
{
    "name": "$projectName$"
}
```

If the user answers "test" the package.json will automatically be:

```json
{
    "name": "test"
}
```

#### Hidden files

If you add an underscore at the start of a file name it will always be removed. So `_.gitignore` will become `.gitignore`, `_tsconfig.json` will become `tsconfig.json` etc. This is to allow you to prevent these files from having any effect on your templates, for instance if you push the template to git and want to prevent the gitignore behaviour.

### If statements

Inside files you can at any point do if statements based on answers. You can start an if statement with the following format:

`-- if [variable] === [value] --`

The `[variable]` should reference one of your variables, and the `[value]` should be `true` or `false`. You then end the if statement with the following:

`-- endif --`

You can put the start and end of if statement anywhere on a line in your file, so you can put it in a comment for JS files, which will prevent errors in the file:

```ts
const otherLogic = () => {};

//-- if $shouldUseAuth$ === true --

const login = () => {
    //Auth logic
};

//-- endif --

const moreLogic = () => {};
```

But it can also work for JSON files:

```json
{
    "somethingElse": true,
    "-- if $shouldUseAuth$ === true --": "",
    "addThisPart": "Auth!!!",
    "-- endif --": ""
}
```

The lines containing the if start or if end will always be removed, so the results will be like this if shoulldUseAuth is true:

The JS file:

```ts
const otherLogic = () => {};

const login = () => {
    //Auth logic
};

const moreLogic = () => {};
```

And the JSON:

```json
{
    "somethingElse": true,
    "addThisPart": "Auth!!!"
}
```

If the answer was false, the result will be:

The JS file:

```ts
const otherLogic = () => {};

const moreLogic = () => {};
```

And the JSON:

```json
{
    "somethingElse": true
}
```

**Note:** For JSON files any trailing commas will automatically be removed. So we don't get a broken JSON file `"somethingElse": true,` with a trailing comma because the system has automatically fixed that error for us.
