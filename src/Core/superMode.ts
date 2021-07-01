import {
  ProjectWorkspace,
  JestTotalResults,
  JestAssertionResults,
  Location,
} from "jest-editor-support";
import { CodeLens } from "vscode-languageserver-protocol";
import { CodeLensProvider, diagnosticManager } from "coc.nvim";
import { VimJest } from "../VimJest";
import { resolveRoot } from "../resolveRoot";
import { resolveJest } from "../resolveJest";
import { resolveConfigFile } from "../resolveConfigFile";

type AssertResultsWithLocation = JestAssertionResults & { location: Location };

const hasLocationInfo = (
  results: JestAssertionResults
): results is AssertResultsWithLocation =>
  typeof (results as AssertResultsWithLocation).location === "object";

export const createTestLensProvider = async (): Promise<CodeLensProvider> => {
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

  const vimJest = new VimJest(jestWorkspace);
  vimJest.handler = () => {
    // noop
  };

  let collection = diagnosticManager.create("test");

  vimJest.startProcess();

  return {
    provideCodeLenses: (): Promise<CodeLens[]> => {
      return new Promise((resolve) => {
        vimJest.handler = (data: JestTotalResults) => {
          let codeLens = [];
          data.testResults.forEach((objAssertionResults) => {
            const uri = "file://" + objAssertionResults.name;
            let diagnostics = [];
            collection.set(uri, []);
            objAssertionResults.assertionResults.forEach((test) => {
              if (test.status === "failed" && hasLocationInfo(test)) {
                const range = {
                  start: {
                    line: test.location.line,
                    character: test.location.column + 1,
                  },
                  end: {
                    line: test.location.line,
                    character: test.location.column + 1,
                  },
                };
                let diagnostic = { message: test.failureMessages[0], range };
                diagnostics.push(diagnostic);
              }
            });
            collection.set(uri, diagnostics);
          });
          vimJest.handler = () => {};
          resolve(codeLens);
        };
      });
    },
  };
};
