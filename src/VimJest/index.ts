import { ProjectWorkspace, JestTotalResults } from "jest-editor-support";
import { TestResultProvider } from "../TestResults";
import { getLogChannel } from "../Log";
import { workspace, StatusBarItem } from "coc.nvim";
import { JestProcess, JestProcessManager } from "../JestProcessManagement";
import { WatchMode } from "../Jest";
type Handler = (data: JestTotalResults) => void;

class VimJest {
  public testResultProvider: TestResultProvider;
  private jestProcessManager: JestProcessManager;
  private jestProcess: JestProcess;
  private testRunInProgressStatusMessage: StatusBarItem;
  public handler: Handler;

  constructor(jestWorkspace: ProjectWorkspace) {
    this.testResultProvider = new TestResultProvider(false);

    this.jestProcessManager = new JestProcessManager({
      projectWorkspace: jestWorkspace,
      runAllTestsFirstInWatchMode: true,
    });
    this.testRunInProgressStatusMessage = workspace.createStatusBarItem(9999, {
      progress: true,
    });
    this.testRunInProgressStatusMessage.text = "Running tests";
    this.testRunInProgressStatusMessage.show();
  }

  public startProcess(): void {
    this.jestProcess = this.jestProcessManager.startJestProcess({
      watchMode: WatchMode.WatchAll,
      keepAlive: true,
      exitCallback: (_, jestProcessInWatchMode) => {
        if (jestProcessInWatchMode) {
          this.jestProcess = jestProcessInWatchMode;
          this.assignHandlers(this.jestProcess);
        } else {
          // noop
        }
      },
    });

    this.assignHandlers(this.jestProcess);
  }

  private assignHandlers(jestProcess: JestProcess): void {
    jestProcess
      .onJestEditorSupportEvent("executableJSON", (data: JestTotalResults) => {
        this.handler(data);
        this.testRunInProgressStatusMessage.hide();
      })
      .onJestEditorSupportEvent("executableOutput", () => {
        // noop
      })
      .onJestEditorSupportEvent("executableStdErr", () => {
        this.testRunInProgressStatusMessage.text =
          "Change detected, re-running tests";
        this.testRunInProgressStatusMessage.show();
      })
      .onJestEditorSupportEvent("terminalError", () => {
        // noop
      });
  }
}

export { VimJest };
