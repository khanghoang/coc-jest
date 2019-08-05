import path, { resolve } from "path";
import { VimJest } from "../VimJest";
import {ProjectWorkspace} from 'jest-editor-support';
import {addToOutput} from './addToOutput';

export function superMode(filename: string): void {
  addToOutput('fooo')
  const jestWorkspace: ProjectWorkspace = new ProjectWorkspace(
    resolve(__dirname, "../../"),
    // resolve(__dirname, "../../node_modules/jest/bin/jest.js"),
    resolve('/usr/local/bin/jest'),
    resolve(__dirname, "../../jest.config.js"),
    20,
    "foo",
    null,
    false
  );

  const vimjest = new VimJest(jestWorkspace);
  vimjest.startProcess();
}
