# coc-inline-jest

Best Jest plugin for [coc.nvim](https://github.com/khanghoang/coc.nvim).

<img src="https://github.com/khanghoang/coc-jest/raw/master/coc-jest-demo.gif" alt="Screenshot of the tool" width="100%">

## Features

* [x] Starts Jest automatically when you're in a root folder project with Jest installed.
* [x] Display failed test cases on gitter.
* [x] Highlights the errors next to the expect functions.
* [x] Navigate between list of failed test cases. (Using :CocList diagnostics)
* [ ] Customize icons.
* [ ] Display passed test cases on gitter.
* [ ] Zero configuration.
* [ ] A one button update for failed snapshots.
* [ ] Show coverage information in files being tested. (requires coverage to be collected by your jest config)

## Installation

In your vim/neovim, run the command:

```vim
:CocInstall coc-inline-jest
```

## Usage

- TBD

## Configuration

- `inlineJjest.enabled`: Enable or disable the plugin, default is `true`.
- `inlineJest.pathToJest`: Path to Jest binary, default `./node_modules/.bin/jest`.
- `inlineJest.pathToConfig`: Path to Jest config file, default `./jest.config.js`.
- `inlineJest.pathToRoot`: Path to project root, default `./`.

## LICENSE

License what? Just kidding, it's MIT.
