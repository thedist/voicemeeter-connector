import Voicemeeter from "./lib/VoicemeeterConnector";
import * as constants from "./lib/VoicemeeterConsts";
import * as types from "./types/VoicemeeterTypes";
declare const BusProperties: typeof constants.BusProperties, InterfaceTypes: {
    strip: number;
    bus: number;
}, StripProperties: typeof constants.StripProperties, FXSettings: typeof constants.FXSettings, RecorderProperties: typeof constants.RecorderProperties, CommandActions: typeof constants.CommandActions, CommandButtons: typeof constants.CommandButtons, CommandEqs: typeof constants.CommandEqs, VBAN: typeof constants.VBAN, VBANInstream: typeof constants.VBANInstream, VBANOutstream: typeof constants.VBANOutstream;
export { Voicemeeter, BusProperties, InterfaceTypes, StripProperties, FXSettings, RecorderProperties, CommandActions, CommandButtons, CommandEqs, VBAN, VBANInstream, VBANOutstream, types };
