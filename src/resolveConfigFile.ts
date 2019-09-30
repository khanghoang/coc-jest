import {Uri, workspace} from 'coc.nvim';
import path from 'path';
import {findUp} from './Core/util';

export async function resolveConfigFile(): Promise<string> {
  let document = await workspace.document;
  let config = workspace.getConfiguration(
    "jest",
    document ? document.uri : undefined
  );
  let filename = config.get<string>("configFileName") || 'jest.config.js';
  let u = Uri.parse(document.uri);
  let cwd = u.scheme == "file" ? path.dirname(u.fsPath) : workspace.cwd;
  return path.join(await findUp([filename], cwd), filename);
}
