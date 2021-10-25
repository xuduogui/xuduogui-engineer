"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installDemo = void 0;
const execa_1 = __importDefault(require("execa"));
const installDemo = async () => {
    try {
        const subprocessRes = await execa_1.default.command('yarn install  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx -d');
        console.log(subprocessRes);
    }
    catch (error) {
        console.error(error);
    }
    ;
};
exports.installDemo = installDemo;
//# sourceMappingURL=demo.js.map