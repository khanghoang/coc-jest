# coc-jest

Jest extension for [coc.nvim](https://github.com/neoclide/coc.nvim).

## Features

- Use current terminal buffer for jest commands.
- Highlight failed tests.
- Contributes to useful coc commands.
- Options for customization.

## Installation

In your vim/neovim, run the command:

```vim
:CocInstall coc-jest
```

## Usage

```vim
" Run jest for current project
command! -nargs=0 Jest :call  CocAction('runCommand', 'jest.projectTest')

" Run jest for current file
command! -nargs=0 JestCurrent :call  CocAction('runCommand', 'jest.fileTest', ['%'])

" Run jest for current test
nnoremap <leader>te :call CocAction('runCommand', 'jest.singleTest')<CR>

" Init jest in current cwd, require global jest command exists
command! JestInit :call CocAction('runCommand', 'jest.init')
```

## Configuration

- `jest.watch` Watch files for changes and rerun tests related to changed files,
  default `true`.
- `jest.detectLeaks`: detect memory leaks, default `false`.
- `jest.watchman`: use watchman, default `false`.
- `jest.detectOpenHandles`: detect open handles, default `false`.
- `jest.forceExit`: force jest exit on test finish, default `false`.
- `jest.noStackTrace`: disable stack trace, default `false`.
- `jest.terminalPosition`: position of terminal, default `right`.

## LICENSE

Copyright 2018 chemzqm@gmail.com

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
