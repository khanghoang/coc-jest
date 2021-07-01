import {
  ProjectWorkspace,
  JestTotalResults,
  JestAssertionResults,
  Location,
} from "jest-editor-support";
import { getLogChannel } from "../Log";
import { CodeLens } from "vscode-languageserver-protocol";
import SignManager, {
  TestResult,
  TestPassFail,
  AllResults,
} from "../sign-manager";
import { CodeLensProvider, diagnosticManager, workspace } from "coc.nvim";
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
  const log = getLogChannel();

  log.appendLine(`Creating codelens provider`);
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

  const signs = new SignManager(workspace.nvim);

  await signs.defineSigns();

  vimJest.startProcess();

  return {
    provideCodeLenses: (): Promise<CodeLens[]> => {
      return new Promise((resolve) => {
        vimJest.handler = async (data: JestTotalResults) => {
          let codeLens = [];
          const allResultsForSignManager: AllResults = {};
          data.testResults.forEach((objAssertionResults) => {
            const uri = "file://" + objAssertionResults.name;
            let diagnostics = [];
            const signManagerResults: TestResult[] = [];
            collection.set(uri, []);
            objAssertionResults.assertionResults.forEach((test) => {
              if (hasLocationInfo(test)) {
                const result =
                  test.status === "failed"
                    ? TestPassFail.Fail
                    : TestPassFail.Pass;

                signManagerResults.push({
                  result,
                  line: test.location.line,
                });
              }

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
            allResultsForSignManager[uri] = signManagerResults;
            collection.set(uri, diagnostics);
          });
          vimJest.handler = () => {};
          resolve(codeLens);
          await signs.storeNewTestResults(allResultsForSignManager);
        };
      });
    },
  };
};
