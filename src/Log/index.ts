import { workspace } from "coc.nvim";

let logChannel;

export const createLogChannel = () => {
  logChannel = workspace.createOutputChannel("inline-jest");
  return logChannel;
};

export const getLogChannel = () => logChannel;
