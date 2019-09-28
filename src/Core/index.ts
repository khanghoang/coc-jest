import {
  languages,
  Uri,
  ExtensionContext,
  workspace,
  commands
} from "coc.nvim";
import path from 'path';
import which from "which";
import { findUp, existAsync } from "./util";
import { superMode, TestCodeLensProvider } from "./superMode";
import { setupErrorHandler } from "./addToOutput";

let bufnr: number;
let { nvim } = workspace;

export async function activate(context: ExtensionContext): Promise<void> {
  let { subscriptions } = context;

  // subscriptions.push(commands.registerCommand('jest.init', initJest))
  // subscriptions.push(commands.registerCommand('jest.projectTest', jestProject))
  // subscriptions.push(commands.registerCommand('jest.fileTest', jestFile, null, true))
  // subscriptions.push(commands.registerCommand('jest.singleTest', jestSingle))
  subscriptions.push(commands.registerCommand("jest.superMode", superMode));

  const codeLensProviderDisposable = languages.registerCodeLensProvider(
    [
      { language: "typescript" },
      { language: "typescript.tsx" },
      { language: "typescriptreact" },
      { language: "javascript" },
      { language: "javascript.jsx" },
      { language: "javascriptreact" }
    ],
    new TestCodeLensProvider()
  );

  context.subscriptions.push(setupErrorHandler());
  context.subscriptions.push(codeLensProviderDisposable);
}

async function initJest(): Promise<void> {
  let { cwd } = workspace;
  workspace.runTerminalCommand("jest --init", cwd);
}

async function jestFile(filename: string): Promise<void> {
  let { cwd } = workspace;
  if (filename == "%") {
    let document = await workspace.document;
    filename = Uri.parse(document.uri).fsPath.toString();
  }
  if (!path.isAbsolute(filename)) {
    filename = path.join(cwd, filename);
  }
  let exists = await existAsync(filename);
  if (!exists) {
    workspace.showMessage(`${filename} not found`, "error");
    return;
  }
  let root = await resolveRoot();
  let cmd = await resolveJest();
  let configfile = await resolveConfigFile();
  if (configfile) cmd = `${cmd} -c ${path.relative(root, configfile)}`;
  let opts = await resolveConfig();
  if (opts) cmd = `${cmd} ${opts}`;
  cmd = `${cmd} ${path.relative(root, filename)}`;
  await runJestCommand(root, cmd);
}

async function jestSingle(): Promise<void> {
  let document = await workspace.document;
  if (!document) return;
  let u = Uri.parse(document.uri);
  if (u.scheme != "file") return;
  let root = await resolveRoot();
  let cmd = await resolveJest();
  let configfile = await resolveConfigFile();
  if (configfile) cmd = `${cmd} -c ${path.relative(root, configfile)}`;
  let opts = await resolveConfig();
  if (opts) cmd = `${cmd} ${opts}`;
  let lnum: number = (await nvim.call("line", ".")) - 1;
  let name: string;
  while (lnum > 0) {
    let line = document.getline(lnum);
    let ms = line.match(/^\s*(?:it|test)\((["'])(.+)\1/);
    if (ms) {
      name = ms[2];
      break;
    }
    lnum = lnum - 1;
  }
  if (!name) return;
  name = name.replace(/'/g, "\\'");
  cmd = `${cmd} ${path.relative(root, u.fsPath)} -t '${name}'`;
  await runJestCommand(root, cmd);
}

async function jestProject(): Promise<void> {
  let root = await resolveRoot();
  let cmd = await resolveJest();
  let configfile = await resolveConfigFile();
  if (configfile) {
    cmd = `${cmd} -c ${path.relative(root, configfile)}`;
  }
  let opts = await resolveConfig();
  if (opts) cmd = `${cmd} ${opts}`;
  await runJestCommand(root, cmd);
}

async function runJestCommand(cwd: string, cmd: string): Promise<void> {
  if (bufnr) {
    await nvim.command(`silent! bd! ${bufnr}`);
  }
  let document = await workspace.document;
  let config = workspace.getConfiguration(
    "jest",
    document ? document.uri : undefined
  );
  let position = config.get<string>("terminalPosition");
  bufnr = await nvim.call("coc#util#open_terminal", {
    autoclose: 0,
    keepfocus: 1,
    position,
    cwd,
    cmd
  });
}

async function resolveConfig(): Promise<string> {
  let args = [];
  let names = [
    "watch",
    "detectLeaks",
    "watchman",
    "detectOpenHandles",
    "forceExit",
    "noStackTrace"
  ];
  let document = await workspace.document;
  let config = workspace.getConfiguration(
    "jest",
    document ? document.uri : undefined
  );
  for (let name of names) {
    if (config.get<boolean>(name)) {
      args.push(`--${name}`);
    }
  }
  return args.join(" ");
}

async function resolveRoot(): Promise<string> {
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

async function resolveConfigFile(): Promise<string> {
  let document = await workspace.document;
  let config = workspace.getConfiguration(
    "jest",
    document ? document.uri : undefined
  );
  let filename = config.get<string>("configFileName");
  let u = Uri.parse(document.uri);
  let cwd = u.scheme == "file" ? path.dirname(u.fsPath) : workspace.cwd;
  return await findUp([filename], cwd);
}

async function resolveJest(): Promise<string> {
  let root = await resolveRoot();
  if (root) {
    for (let name of ["jest", "jest.cmd"]) {
      let exists = await existAsync(
        path.join(root, `node_modules/.bin/${name}`)
      );
      if (exists) return `./node_modules/.bin/${name}`;
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
