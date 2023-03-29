"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winreg_1 = __importDefault(require("winreg"));
const DLLHandler = {
    getDLLPath: async () => {
        const regKey = new winreg_1.default({
            hive: winreg_1.default.HKLM,
            key: "\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\VB:Voicemeeter {17359A74-1236-5467}",
        });
        return new Promise((resolve) => {
            regKey.values((err, items) => {
                if (err) {
                    throw new Error(err);
                }
                const unistallerPath = items.find((i) => i.name === "UninstallString").value;
                const fileNameIndex = unistallerPath.lastIndexOf("\\");
                resolve(unistallerPath.slice(0, fileNameIndex));
            });
        });
    },
};
exports.default = DLLHandler;
//# sourceMappingURL=DLLHandler.js.map