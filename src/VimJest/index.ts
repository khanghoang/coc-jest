import { ProjectWorkspace, JestTotalResults } from "jest-editor-support";
import { TestResultProvider } from "../TestResults";
import { JestProcess, JestProcessManager } from "../JestProcessManagement";
import { WatchMode } from "../Jest";
type Handler = (data: JestTotalResults) => void;

class VimJest {
  public testResultProvider: TestResultProvider;
  private jestWorkspace: ProjectWorkspace;
  private jestProcessManager: JestProcessManager;
  private jestProcess: JestProcess;
  public handler: Handler;

  constructor(jestWorkspace: ProjectWorkspace) {
    this.jestWorkspace = jestWorkspace;
    this.testResultProvider = new TestResultProvider(false);

    this.jestProcessManager = new JestProcessManager({
      projectWorkspace: jestWorkspace,
      runAllTestsFirstInWatchMode: true,
    });
  }

  public startProcess(): void {
    this.jestProcess = this.jestProcessManager.startJestProcess({
      watchMode: WatchMode.WatchAll,
      keepAlive: true,
      exitCallback: (_, jestProcessInWatchMode) => {
        if (jestProcessInWatchMode) {
          this.jestProcess = jestProcessInWatchMode;
          this.assignHandlers(this.jestProcess, this.handler);
        } else {
          // noop
        }
      },
    });

    this.assignHandlers(this.jestProcess, this.handler);
  }

  private assignHandlers(jestProcess: JestProcess, handler: Handler): void {
    jestProcess
      .onJestEditorSupportEvent("executableJSON", (data: JestTotalResults) => {
        this.handler(data);
      })
      .onJestEditorSupportEvent("executableOutput", (output: string) => {
        // noop
      })
      .onJestEditorSupportEvent("executableStdErr", (error: Buffer) => {
        // noop
      })
      .onJestEditorSupportEvent("nonTerminalError", (error: string) => {
        // noop
      })
      .onJestEditorSupportEvent("exception", (result) => {
        // noop
      })
      .onJestEditorSupportEvent("terminalError", (error: string) => {
        // noop
      });
  }
}

export { VimJest };
