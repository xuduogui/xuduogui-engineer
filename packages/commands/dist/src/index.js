"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doCommand = void 0;
const execa_1 = __importDefault(require("execa"));
const doCommand = async function (cmd) {
    try {
        await execa_1.default.command(cmd);
    }
    catch (error) {
        console.error(error.stderr || error);
    }
};
exports.doCommand = doCommand;
//# sourceMappingURL=index.js.map