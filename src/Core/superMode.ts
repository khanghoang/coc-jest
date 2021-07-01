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

const getFailureLocation = (
  failureMessage: string,
  filePath: string
): Location | undefined => {
  const fileLine = failureMessage
    .split("\n")
    .find((line) => line.includes(filePath));
  if (fileLine) {
    const matchResult = /(?<line>\d+):(?<column>\d+)/.exec(fileLine);
    return {
      column: Number.parseInt(matchResult.groups.column, 10),
      line: Number.parseInt(matchResult.groups.line, 10),
    };
  }
  return undefined;
};

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
                const location = getFailureLocation(
                  test.failureMessages[0],
                  objAssertionResults.name
                );
                const line = location?.line ?? test.location.line;
                const col = location?.column ?? test.location.column;
                const range = {
                  start: {
                    line: line - 1,
                    character: col - 1,
                  },
                  end: {
                    line: line - 1,
                    character: col - 1,
                  },
                };
                let diagnostic = { message: test.failureMessages[0], range };
                diagnostics.push(diagnostic);
              }
            });
            allResultsForSignManager[uri] = signManagerResults;
            collection.set(uri, diagnostics);
          });
          await signs.storeNewTestResults(allResultsForSignManager);
          await signs.updateAllBufferResults();
          log.appendLine(JSON.stringify(allResultsForSignManager, null, 2));
          resolve(codeLens);
        };
        vimJest.clearDataQueue();
      });
    },
  };
};
