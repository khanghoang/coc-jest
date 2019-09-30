import { ProjectWorkspace } from 'jest-editor-support'
import { JestProcess } from './JestProcess'
import { WatchMode } from '../Jest'

export type ExitCallback = (exitedJestProcess: JestProcess, jestProcessInWatchMode?: JestProcess) => void

export class JestProcessManager {
  private projectWorkspace: ProjectWorkspace
  private jestProcesses: JestProcess[] = []
  private runAllTestsFirstInWatchMode: boolean

  constructor({
    projectWorkspace,
    runAllTestsFirstInWatchMode = true,
  }: {
    projectWorkspace: ProjectWorkspace
    runAllTestsFirstInWatchMode?: boolean
  }) {
    this.projectWorkspace = projectWorkspace
  }

  public startJestProcess({
    exitCallback = () => {},
    watchMode = WatchMode.None,
    keepAlive = false,
  }: {
    exitCallback?: ExitCallback
    watchMode?: WatchMode
    keepAlive?: boolean
  } = {}): JestProcess {
    if (watchMode !== WatchMode.None && this.runAllTestsFirstInWatchMode) {
      return this.runAllTestsFirst(exitedJestProcess => {
        const jestProcessInWatchMode = this.run({
          watchMode: WatchMode.Watch,
          keepAlive,
          exitCallback,
        })
        exitCallback(exitedJestProcess, jestProcessInWatchMode)
      })
    } else {
      return this.run({
        watchMode,
        keepAlive,
        exitCallback,
      })
    }
  }

  private runJest({
    watchMode,
    keepAlive,
    exitCallback,
  }: {
    watchMode: WatchMode
    keepAlive: boolean
    exitCallback: ExitCallback
  }) {
    const jestProcess = new JestProcess({
      projectWorkspace: this.projectWorkspace,
      watchMode,
      keepAlive,
    })

    this.jestProcesses.unshift(jestProcess)

    jestProcess.onExit(exitCallback)
    return jestProcess
  }

  private run({
    watchMode,
    keepAlive,
    exitCallback,
  }: {
    watchMode: WatchMode
    keepAlive: boolean
    exitCallback: ExitCallback
  }) {
    return this.runJest({
      watchMode,
      keepAlive,
      exitCallback: (exitedJestProcess: JestProcess) => {
        // noop
      },
    })
  }

  private runAllTestsFirst(onExit: ExitCallback) {
    return this.runJest({
      watchMode: WatchMode.None,
      keepAlive: false,
      exitCallback: onExit,
    })
  }
}
