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
import { createTestLensProvider } from "./superMode";
import { setupErrorHandler } from "./addToOutput";
import { createStore } from 'redux';

let bufferNumber: number;
let { nvim } = workspace;

const store = createStore(r => r, {});

export async function activate(context: ExtensionContext): Promise<void> {
  let { subscriptions } = context;

  // subscriptions.push(commands.registerCommand("jest.superMode", superMode));

  const codeLensProviderDisposable = languages.registerCodeLensProvider(
    [
      { language: "typescript" },
      { language: "typescript.tsx" },
      { language: "typescriptreact" },
      { language: "javascript" },
      { language: "javascript.jsx" },
      { language: "javascriptreact" }
    ],

    await createTestLensProvider()
  );

  context.subscriptions.push(setupErrorHandler());
  context.subscriptions.push(codeLensProviderDisposable);
}

async function resolveConfig(): Promise<string> {
  let args = [];
  let names = [
    "enabled",
    "pathToJest",
    "pathToConfig"
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
