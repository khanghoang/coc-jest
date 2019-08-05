import { VimJest } from ".";
import { ProjectWorkspace } from "jest-editor-support";
import { resolve } from "path";
(async function() {
  // const options = {
  //     projects: [__dirname],
  //     silent: true,
  // };
  //
  // const jestConfig = {
  //   roots: ['./'],
  //   testRegex: ['\\.spec\\.js$']
  // }
  // // Run the Jest asynchronously
  // const data = await runCLI(jestConfig as any, options.projects);
  // const res = data.results;
  //
  // const filePath = './__tests__/index.spec.js';
  // const testResultsProvider = new TestResultProvider();
  // testResultsProvider.getSortedResults(filePath);
  // testResultsProvider.updateTestResults(res as any);
  // const results = testResultsProvider.getSortedResults(filePath);

  const jestWorkspace: ProjectWorkspace = new ProjectWorkspace(
    resolve(__dirname, "../../"),
    resolve(__dirname, "../../node_modules/jest/bin/jest.js"),
    resolve(__dirname, "../../jest.test.config.js"),
    20,
    "foo",
    null,
    false
  );

  const vimjest = new VimJest(jestWorkspace);
  vimjest.startProcess();
})();
