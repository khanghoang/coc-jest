import { ProjectWorkspace, JestTotalResults, JestFileResults } from "jest-editor-support";
import {
  CodeLens,
  CancellationToken
} from "vscode-languageserver-protocol";
import { CodeLensProvider } from "coc.nvim";
import { resolve } from "path";

import { VimJest } from '../VimJest'

import { addToOutput } from "./addToOutput";

export const createTestLensProvider = (): CodeLensProvider => {
  const jestWorkspace: ProjectWorkspace = new ProjectWorkspace(
    resolve(__dirname, "../../"),
    resolve(__dirname, "../../node_modules/jest/bin/jest.js"),
    resolve(__dirname, "../../jest.config.js"),
    20,
    "foo",
    null,
    false
  );

  const vimJest = new VimJest(jestWorkspace);
  vimJest.handler = () => {};

  vimJest.startProcess();

  return {
    provideCodeLenses: (): Promise<CodeLens[]> => {
      return new Promise(resolve => {
        vimJest.handler = (data: JestTotalResults) => {
          let codeLens = [];
          data.testResults.forEach(objAssertionResults => {
            objAssertionResults.assertionResults.forEach(test => {
              codeLens.push({
                command: { title: test.status, command: 'echo "bar"' },
                range: {
                  start: {
                    line: test.location.line,
                    character: test.location.column
                  },
                  end: {
                    line: test.location.line,
                    character: test.location.column
                  }
                }
              })
            })
          });
          vimJest.handle = () => {};
          resolve(codeLens);
        }
      });
    },
    resolveCodeLens: (codeLens: CodeLens, token: CancellationToken): ProviderResult<CodeLens> => {
      return Promise.resolve(codeLens)
    }
  }
}
