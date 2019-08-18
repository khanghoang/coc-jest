import { ProjectWorkspace } from "jest-editor-support";

import {
  CodeLens,
  Position,
  Range,
  CancellationToken
} from "vscode-languageserver-protocol";
import { CodeLensProvider, ExtensionContext, languages, commands } from "coc.nvim";
import { resolve } from "path";

import { VimJest } from "../VimJest";
import { addToOutput } from "./addToOutput";

export class TestCodeLensProvider implements CodeLensProvider {
  public provideCodeLenses(): Promise<CodeLens[]> {
    const codeLen = {
      command: { title: "foo", command: 'bar' },
      range: {
        start: {
          line: 1,
          character: 1
        },
        end: {
          line: 2,
          character: 1
        }
      }
    };

    return Promise.resolve([codeLen]);
  }

  public resolveCodeLens(
    codeLens: CodeLens,
    token: CancellationToken
  ): Promise<CodeLens> {
    return Promise.resolve(codeLens);
  }
}

export function superMode(filename: string): void {

  languages.registerCodeLensProvider(
    [
      {language: 'typescript'},
      {language: 'typescript.tsx'},
      {language: 'typescriptreact'},
      {language: 'javascript'},
      {language: 'javascript.jsx'},
      {language: 'javascriptreact'}
    ],
    new TestCodeLensProvider()
  );

  addToOutput("fooo");
  const jestWorkspace: ProjectWorkspace = new ProjectWorkspace(
    resolve(__dirname, "../../"),
    // resolve(__dirname, "../../node_modules/jest/bin/jest.js"),
    resolve("/usr/local/bin/jest"),
    resolve(__dirname, "../../jest.config.js"),
    20,
    "foo",
    null,
    false
  );

  const vimjest = new VimJest(jestWorkspace);
  vimjest.startProcess();
}
