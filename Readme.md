# inline-coc-jest

Best Jest plugin for [coc.nvim](https://github.com/khanghoang/coc.nvim).

## Features

* [x] Display failed test cases on gitter.
* [x] Navigate between list of failed test cases. (Using :CocList diagnostics)
* [] Custom failed tests icon.
* [] Zero configuration.

## Installation

In your vim/neovim, run the command:

```vim
:CocInstall coc-inline-jest
```

## Usage

- TBD

## Configuration

- `inlineJjest.enabled`: Enable or disable the plugin, default is `true`.
- `inlineJest.pathToJest`: detect memory leaks, default `./node_modules/.bin/jest`.
- `inlineJest.pathToConfig`: detect memory leaks, default `./jest.config.js`.
- `inlineJest.pathToRoot`: detect memory leaks, default `./`.

## LICENSE

License what??? Just kidding, it's MIT.
