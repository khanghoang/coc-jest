import path from "path";
import fs from "fs";
import util from "util";

export async function findUp(
  filenames: string[],
  cwd: string
): Promise<string> {
  const { root } = path.parse(cwd);
  while (cwd != root) {
    for (let file of filenames) {
      let p = path.join(cwd, file);
      let exists = await existAsync(p);
      if (exists) return cwd;
      cwd = path.dirname(cwd);
    }
  }
  return null;
}

export async function existAsync(filepath: string): Promise<boolean> {
  let stat: fs.Stats = null;
  try {
    stat = await util.promisify(fs.stat)(filepath);
  } catch (e) {
    return false;
  }
  return stat && stat.isFile();
}
