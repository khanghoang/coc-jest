import {
  Document,
  workspace,
  Neovim,
  WorkspaceConfiguration,
  events,
} from "coc.nvim";
import semver from "semver";
import { getLogChannel } from "./Log";

const PREFIX = "CocJest";

export enum TestPassFail {
  Pass = "Pass",
  Fail = "Fail",
}

export interface TestResult {
  line: number;
  result: TestPassFail;
}

export interface AllResults {
  [file: string]: TestResult[];
}

export default class SignManager {
  private config: WorkspaceConfiguration;
  constructor(private nvim: Neovim, private allResults: AllResults = {}) {
    this.config = workspace.getConfiguration("inlineJest");
    this.registerDocumentChangeListener();
  }

  registerDocumentChangeListener() {
    const log = getLogChannel();
    events.on("BufEnter", async () => {
      log.appendLine(`BufEnter detected - updating test results`);
      await this.updateCurrentBufferResults();
    });
  }

  async defineSigns() {
    const signcolumnSetting = await this.nvim.eval("&signcolumn");

    const canHighlightNumberColumn =
      signcolumnSetting == "number" &&
      workspace.isNvim &&
      semver.gte(workspace.env.version, "v0.3.2");

    this.nvim.pauseNotification();

    this.defineSign("Passed", canHighlightNumberColumn, "✅");
    this.defineSign("Failed", canHighlightNumberColumn, "❌");

    await this.nvim.resumeNotification();
  }

  private defineSign(
    name: string,
    canHighlightNumberColumn: boolean,
    defaultText: string
  ) {
    const signName = `${name}Sign`;
    const text = this.config.get<string>(`${signName}.text`, defaultText);
    const hlGroup = this.config.get<string>(`${signName}.hlGroup`, PREFIX);

    const extra = canHighlightNumberColumn
      ? ` numhl=${PREFIX}${signName}`
      : ` texthl=${PREFIX}${signName}`;

    this.nvim.command(
      `sign define ${PREFIX}${name} text=${text}${extra}`,
      true
    );

    this.nvim.command(
      `highlight default link ${PREFIX}${signName} ${hlGroup}`,
      true
    );
  }

  async storeNewTestResults(results: AllResults) {
    this.allResults = { ...results };
    await this.updateCurrentBufferResults();
  }

  async updateBufferResults(document: Document) {
    const { uri, bufnr: bufferNumber } = document;
    const log = getLogChannel();

    log.appendLine(
      `Updating results for buffer ${uri} (buffer: ${bufferNumber})`
    );

    if (!this.allResults[uri]) {
      log.appendLine(`No results found`);
      return;
    }

    this.nvim.pauseNotification();
    const signGroup = PREFIX;

    log.appendLine(`Clearing signs`);
    this.nvim.call("sign_unplace", [signGroup, { buffer: bufferNumber }], true);
    const priority = this.config.get<number>("priority", 1000);
    this.allResults[uri].forEach((result) => {
      const signName =
        result.result === TestPassFail.Pass
          ? `${PREFIX}Passed`
          : `${PREFIX}Failed`;

      log.appendLine(`Placing '${signName}' result on line ${result.line}`);
      const args = [
        0,
        signGroup,
        signName,
        bufferNumber,
        { lnum: result.line, priority },
      ];
      this.nvim.call("sign_place", args, true);
      log.appendLine(`Place complete`);
    });

    await this.nvim.resumeNotification();
  }

  async updateCurrentBufferResults() {
    return this.updateBufferResults(await workspace.document);
  }
}
