"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logx = void 0;
const log = __importStar(require("log4js"));
const path = __importStar(require("path"));
const timeNow = new Date().getTime();
const logConfigDefault = {
    appenders: {
        console: { type: 'console' },
        file: { type: 'file', filename: path.join(__dirname, `../logs/time-${timeNow}.log`) }
    },
    categories: {
        default: { appenders: ['file', 'console'], level: 'debug' },
    }
};
log.configure(logConfigDefault);
const logx = log.getLogger();
exports.logx = logx;
function createLogProxy(logLevel, logger = logx) {
    return (messeage, ...arg) => {
        switch (logLevel) {
            case 'debug':
                return logger.debug(messeage, ...arg);
            case 'info':
                return logger.debug(messeage, ...arg);
            case 'warn':
                return logger.debug(messeage, ...arg);
            case 'error':
                return logger.debug(messeage, ...arg);
            default:
                break;
        }
    };
}
console.log = createLogProxy('debug');
console.info = createLogProxy('info');
console.warn = createLogProxy('warn');
console.error = createLogProxy('error');
//# sourceMappingURL=logx.js.map