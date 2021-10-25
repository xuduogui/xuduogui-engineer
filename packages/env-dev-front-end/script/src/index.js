"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Listr = require("listr");
const logx_1 = require("./config/logx");
const runs_1 = __importDefault(require("./config/runs"));
logx_1.logx.info('============= 开始运行 =============');
const tasks = new Listr(runs_1.default, { concurrent: 3 });
tasks
    .run()
    .then((subprocessRes) => {
    console.log(subprocessRes);
})
    .catch(err => console.error(err));
//# sourceMappingURL=index.js.map