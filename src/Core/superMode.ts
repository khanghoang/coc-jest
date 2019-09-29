import { ProjectWorkspace, JestTotalResults, JestFileResults } from "jest-editor-support";
import {
  CodeLens,
  CancellationToken,
  Diagnostic,
  Range
} from "vscode-languageserver-protocol";
import { CodeLensProvider, diagnosticManager } from "coc.nvim";
import { resolve } from "path";
import { VimJest } from '../VimJest'

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
  vimJest.handler = () => {
    // noop
  };

  let collection = diagnosticManager.create('test')

  vimJest.startProcess();

  return {
    provideCodeLenses: (doc): Promise<CodeLens[]> => {
      return new Promise(resolve => {
        vimJest.handler = (data: JestTotalResults) => {
          let codeLens = [];
          let diagnostics = [];
          let uri = doc.uri;
          collection.set(uri, []);
          data.testResults.forEach(objAssertionResults => {
            objAssertionResults.assertionResults.forEach(test => {
              if (test.status === 'failed') {
                const range = {
                  start: {
                    line: test.location.line,
                    character: test.location.column + 1
                  },
                  end: {
                    line: test.location.line,
                    character: test.location.column + 1
                  }
                };
                let diagnostic = { message: test.failureMessages[0], range };
                diagnostics.push(diagnostic);
              }
            })
          });
          collection.set(uri, diagnostics)
          vimJest.handler = () => {};
          resolve(codeLens);
        }
      });
    },
    resolveCodeLens: (codeLens: CodeLens, token: CancellationToken): ProviderResult<CodeLens> => {
      return Promise.resolve(codeLens)
    }
  }
}
