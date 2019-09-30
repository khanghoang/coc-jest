import {workspace} from 'coc.nvim';
import path from 'path';
import {existAsync} from './Core/util';
import {resolveRoot} from './resolveRoot';

import which = require('which');

export async function resolveJest(): Promise<string> {
  let root = await resolveRoot();
  if (root) {
    for (let name of ["jest", "jest.cmd"]) {
      let exists = await existAsync(
        path.join(root, `node_modules/.bin/${name}`)
      );
      if (exists) return path.join(root, `node_modules/.bin/${name}`);
    }
  }
  try {
    which.sync("jest");
    return "jest";
  } catch (e) {
    workspace.showMessage("jest executable not found!", "error");
    return "";
  }
}
