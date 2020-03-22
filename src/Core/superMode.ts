import { ProjectWorkspace, JestTotalResults, JestFileResults } from "jest-editor-support";
import {
  CodeLens,
  CancellationToken,
  Diagnostic,
  Range
} from "vscode-languageserver-protocol";
import { workspace, CodeLensProvider, diagnosticManager } from "coc.nvim";
import { VimJest } from '../VimJest'
import {resolveRoot} from '../resolveRoot';
import {resolveJest} from '../resolveJest';
import {resolveConfigFile} from '../resolveConfigFile';

interface Settings {
  enabled?: boolean,
  pathToJest?: string,
  pathToConfig?: string
}

export const createTestLensProvider = async (): CodeLensProvider => {
  const root = await resolveRoot();
  const jest = await resolveJest();
  const configFile = await resolveConfigFile();
  const jestWorkspace: ProjectWorkspace = new ProjectWorkspace(
    root,
    jest,
    configFile,
    20,
    "jest",
    null,
    false
  );

  const config = workspace.getConfiguration().get<any>('jest', {}) as Settings

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
          data.testResults.forEach(objAssertionResults => {
            const uri = 'file://' + objAssertionResults.name;
            let diagnostics = [];
            collection.set(uri, []);
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
            collection.set(uri, diagnostics)
          });
          vimJest.handler = () => {};
          resolve(codeLens);
        }
      });
    }
  }
}
