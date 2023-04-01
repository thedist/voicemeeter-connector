import Voicemeeter from "./lib/VoicemeeterConnector";
import * as constants from "./lib/VoicemeeterConsts";
import * as types from "./types/VoicemeeterTypes";
declare const BusProperties: typeof constants.BusProperties, InterfaceTypes: {
    strip: number;
    bus: number;
}, StripProperties: typeof constants.StripProperties, FXSettings: typeof constants.FXSettings, RecorderProperties: typeof constants.RecorderProperties;
export { Voicemeeter, BusProperties, InterfaceTypes, StripProperties, FXSettings, RecorderProperties, types };
