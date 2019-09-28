import { ProjectWorkspace, JestTotalResults, JestFileResults } from "jest-editor-support";
import {
  CodeLens,
  CancellationToken
} from "vscode-languageserver-protocol";
import { CodeLensProvider } from "coc.nvim";
import { resolve } from "path";

import { VimJest } from '../VimJest'

import { addToOutput } from "./addToOutput";

export class TestCodeLensProvider implements CodeLensProvider {
  constructor() {
    superMode('foo');
  }
  public provideCodeLenses(): Promise<CodeLens[]> {
    const codeLen = {
      command: { title: "Test failed", command: 'echo "bar"' },
      range: {
        start: {
          line: 0,
          character: 1
        },
        end: {
          line: 0,
          character: 20
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
  const jestWorkspace: ProjectWorkspace = new ProjectWorkspace(
    resolve(__dirname, "../../"),
    resolve(__dirname, "../../node_modules/jest/bin/jest.js"),
    resolve(__dirname, "../../jest.config.js"),
    20,
    "foo",
    null,
    false
  );

  const vimJest = new VimJest(jestWorkspace, (data: JestTotalResults) => {
    // data.testResults.map(test: JestFileResults => {
    //   test.asset
    // })
  });
  vimJest.startProcess();
}
