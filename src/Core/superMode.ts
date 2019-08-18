import { ProjectWorkspace } from "jest-editor-support";
import {
  CodeLens,
  CancellationToken
} from "vscode-languageserver-protocol";
import { CodeLensProvider } from "coc.nvim";
import { resolve } from "path";

import { VimJest } from "../VimJest";
import { addToOutput } from "./addToOutput";

export class TestCodeLensProvider implements CodeLensProvider {
  public provideCodeLenses(): Promise<CodeLens[]> {
    const codeLen = {
      command: { title: "Test failed", command: 'echo "bar"' },
      range: {
        start: {
          line: 0,
          character: 1
        },
        end: {
          line: 0,
          character: 20
        }
      }
    };

    return Promise.resolve([codeLen]);
  }

  public resolveCodeLens(
    codeLens: CodeLens,
    token: CancellationToken
  ): Promise<CodeLens> {
    return Promise.resolve(codeLens);
  }
}

export function superMode(filename: string): void {
  addToOutput("fooo");
  const jestWorkspace: ProjectWorkspace = new ProjectWorkspace(
    resolve(__dirname, "../../"),
    // resolve(__dirname, "../../node_modules/jest/bin/jest.js"),
    resolve("/usr/local/bin/jest"),
    resolve(__dirname, "../../jest.config.js"),
    20,
    "foo",
    null,
    false
  );

  const vimjest = new VimJest(jestWorkspace);
  vimjest.startProcess();
}
