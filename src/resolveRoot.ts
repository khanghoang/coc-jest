import {Uri, workspace} from 'coc.nvim';
import path from 'path';
import {findUp} from './Core/util';

export async function resolveRoot(): Promise<string> {
  let document = await workspace.document;
  let cwd: string;
  if (document) {
    let u = Uri.parse(document.uri);
    cwd = u.scheme == "file" ? path.dirname(u.fsPath) : workspace.cwd;
  } else {
    cwd = workspace.cwd;
  }
  let dir = await findUp(["package.json"], cwd);
  return dir || cwd;
}
