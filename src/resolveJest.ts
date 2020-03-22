import {workspace} from 'coc.nvim';
import path from 'path';
import {existAsync} from './Core/util';
import {resolveRoot} from './resolveRoot';
import {existsSync} from 'fs';
import which from 'which';
import { platform } from 'os';

const checkCreateReactApp = async () => {
  let root = await resolveRoot();
  const defaultCreateReactPath = "node_modules/react-scripts/node_modules/.bin/jest";
  const defaultCreateReactPathWindows = "node_modules/react-scripts/node_modules/.bin/jest.cmd";

  for (let p of [defaultCreateReactPathWindows, defaultCreateReactPath]) {
    let exists = await existAsync(
      path.join(root, p)
    );
    if (exists) {
      return 'npm test --';
    }
  }

  return null;
}

export async function resolveJest(): Promise<string> {
  let root = await resolveRoot();

  const isCreateReactApp = await checkCreateReactApp();
  if (isCreateReactApp) {
    return isCreateReactApp;
  }

  let pathToJest;
  if (root) {
    for (let name of ["jest", "jest.cmd"]) {
      let exists = await existAsync(
        path.join(root, `node_modules/.bin/${name}`)
      );
      if (exists) {
        pathToJest = path.join(root, `node_modules/.bin/${name}`);
      }
    }
  }

  return pathToJest;
}
