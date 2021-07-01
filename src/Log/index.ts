import { workspace, OutputChannel } from "coc.nvim";

let logChannel: OutputChannel | undefined;

export const createLogChannel = () => {
  logChannel = workspace.createOutputChannel("inline-jest");
  return logChannel;
};

export const getLogChannel = () => logChannel;
