"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.types = exports.RecorderProperties = exports.FXSettings = exports.StripProperties = exports.InterfaceTypes = exports.BusProperties = exports.Voicemeeter = void 0;
const VoicemeeterConnector_1 = __importDefault(require("./lib/VoicemeeterConnector"));
exports.Voicemeeter = VoicemeeterConnector_1.default;
const constants = __importStar(require("./lib/VoicemeeterConsts"));
const types = __importStar(require("./types/VoicemeeterTypes"));
exports.types = types;
const { BusProperties, InterfaceTypes, StripProperties, FXSettings, RecorderProperties } = constants;
exports.BusProperties = BusProperties;
exports.InterfaceTypes = InterfaceTypes;
exports.StripProperties = StripProperties;
exports.FXSettings = FXSettings;
exports.RecorderProperties = RecorderProperties;
//# sourceMappingURL=index.js.map