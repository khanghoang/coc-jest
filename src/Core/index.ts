import { languages, ExtensionContext } from "coc.nvim";
import { createTestLensProvider } from "./superMode";
import { createLogChannel } from "../Log";

export async function activate(context: ExtensionContext): Promise<void> {
  let { subscriptions } = context;
  const logChannel = createLogChannel();

  logChannel.appendLine(`Activating coc-jest`);
  const codeLensProviderDisposable = languages.registerCodeLensProvider(
    [
      { language: "typescript" },
      { language: "typescript.tsx" },
      { language: "typescriptreact" },
      { language: "javascript" },
      { language: "javascript.jsx" },
      { language: "javascriptreact" },
    ],

    await createTestLensProvider()
  );

  subscriptions.push(logChannel);

  subscriptions.push(codeLensProviderDisposable);
}
