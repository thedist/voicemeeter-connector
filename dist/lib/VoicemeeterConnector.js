"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-control-regex */
const ffi_napi_1 = __importDefault(require("ffi-napi"));
const ref_array_napi_1 = __importDefault(require("ref-array-napi"));
const DLLHandler_1 = __importDefault(require("./DLLHandler"));
/**
 * @ignore
 */
const CharArray = (0, ref_array_napi_1.default)("char");
/**
 * @ignore
 */
const LongArray = (0, ref_array_napi_1.default)("long");
/**
 * @ignore
 */
const FloatArray = (0, ref_array_napi_1.default)("float");
/**
 * @ignore
 */
let libVM;
/**
 * @ignore
 */
let instance;
class Voicemeeter {
    /**
     * Initializes the voice meeter dll connection.
     * This call is neccessary to use the api. It returns a promise with a VoiceMeeter instance
     */
    static async init() {
        const dllPath = await DLLHandler_1.default.getDLLPath();
        return new Promise((resolve) => {
            if (!instance) {
                instance = new Voicemeeter();
            }
            libVM = ffi_napi_1.default.Library(`${dllPath}/VoicemeeterRemote64.dll`, {
                VBVMR_Login: ["long", []],
                VBVMR_Logout: ["long", []],
                VBVMR_RunVoicemeeter: ["long", ["long"]],
                VBVMR_IsParametersDirty: ["long", []],
                VBVMR_GetParameterFloat: ["long", [CharArray, FloatArray]],
                VBVMR_GetParameterStringA: ["long", [CharArray, CharArray]],
                VBVMR_SetParameters: ["long", [CharArray]],
                VBVMR_Output_GetDeviceNumber: ["long", []],
                VBVMR_Output_GetDeviceDescA: ["long", ["long", LongArray, CharArray, CharArray]],
                VBVMR_Input_GetDeviceNumber: ["long", []],
                VBVMR_Input_GetDeviceDescA: ["long", ["long", LongArray, CharArray, CharArray]],
                VBVMR_GetVoicemeeterType: ["long", [LongArray]],
                VBVMR_GetVoicemeeterVersion: ["long", [LongArray]],
            });
            instance.isInitialised = true;
            resolve(instance);
        });
    }
    isInitialised = false;
    isConnected = false;
    outputDevices = [];
    inputDevices = [];
    version = "";
    type;
    eventPool = [];
    /**
     * Starts a connection to VoiceMeeter
     */
    connect = () => {
        if (!this.isInitialised) {
            throw new Error("Await the initialisation before connect");
        }
        if (this.isConnected) {
            return;
        }
        if (libVM.VBVMR_Login() === 0) {
            this.isConnected = true;
            this.type = this.getVoicemeeterType();
            this.version = this.getVoicemeeterVersion();
            setInterval(this.checkPropertyChange, 10);
            return;
        }
        this.isConnected = false;
        throw new Error("Connection failed");
    };
    /**
     * Getter $outputDevices
     * @return {Device[] }
     */
    get $outputDevices() {
        return this.outputDevices;
    }
    /**
     * Getter $inputDevices
     * @return {Device[] }
     */
    get $inputDevices() {
        return this.inputDevices;
    }
    /**
     * Getter $version
     * @return {string }
     */
    get $version() {
        return this.version;
    }
    /**
     * Getter $type
     * @return {VoiceMeeterTypes}
     */
    get $type() {
        return this.type;
    }
    /**
     * Terminates the connection to VoiceMeeter
     */
    disconnect = () => {
        if (!this.isConnected) {
            throw new Error("Not connected ");
        }
        try {
            if (libVM.VBVMR_Logout() === 0) {
                this.isConnected = false;
                return;
            }
            throw new Error("Disconnect failed");
        }
        catch {
            throw new Error("Disconnect failed");
        }
    };
    /**
     * Updates all input and ouput devices
     */
    updateDeviceList = () => {
        if (!this.isConnected) {
            throw new Error("Not connected ");
        }
        this.outputDevices = [];
        this.inputDevices = [];
        const outputDeviceNumber = libVM.VBVMR_Output_GetDeviceNumber();
        for (let i = 0; i < outputDeviceNumber; i++) {
            const hardwareIdPtr = new CharArray(256);
            const namePtr = new CharArray(256);
            const typePtr = new LongArray(1);
            libVM.VBVMR_Output_GetDeviceDescA(i, typePtr, namePtr, hardwareIdPtr);
            this.outputDevices.push({
                name: String.fromCharCode(...namePtr.toArray()).replace(/\u0000+$/g, ""),
                hardwareId: String.fromCharCode(...hardwareIdPtr.toArray()).replace(/\u0000+$/g, ""),
                type: typePtr[0],
            });
        }
        const inputDeviceNumber = libVM.VBVMR_Input_GetDeviceNumber();
        for (let i = 0; i < inputDeviceNumber; i++) {
            const hardwareIdPtr = new CharArray(256);
            const namePtr = new CharArray(256);
            const typePtr = new LongArray(1);
            libVM.VBVMR_Input_GetDeviceDescA(i, typePtr, namePtr, hardwareIdPtr);
            this.inputDevices.push({
                name: String.fromCharCode(...namePtr.toArray()).replace(/\u0000+$/g, ""),
                hardwareId: String.fromCharCode(...hardwareIdPtr.toArray()).replace(/\u0000+$/g, ""),
                type: typePtr[0],
            });
        }
    };
    /**
     * Returns wheter a parameter has been changed
     */
    isParametersDirty = () => {
        return libVM.VBVMR_IsParametersDirty();
    };
    /**
     * Gets a bus parameter.
     * @param  {number} index Index of the bus
     * @param  {BusProperties} property Property which should be get
     */
    getBusParameter = (index, property) => {
        return this.getParameter("Bus", index, property);
    };
    /**
     * Sets a parameter of a bus.
     * @param  {number} index Bus number
     * @param  {StripProperties} property Propertyname which should be changed
     * @param  {any} value Property value
     */
    setBusParameter = (index, property, value) => {
        return this.setParameter("Bus", index, property, value);
    };
    /**
     * Get a recorder parameter.
     * @param {RecorderProperties} property Property which should be get
     */
    getRecorderParameter = (property) => {
        return this.getParameter("Recorder", 0, property);
    };
    /**
     * Set a recorder parameter.
     * @param {RecorderProperties} property PropertyName which should be changed
     * @param {any} value Property value
     */
    setRecorderParameter = (property, value) => {
        return this.setParameter("Recorder", 0, property, value);
    };
    /**
     * Gets a strip parameter
     * @param  {number} index Index of the strip
     * @param  {StripProperties} property Property which should be get
     */
    getStripParameter = (index, property) => {
        return this.getParameter("Strip", index, property);
    };
    /**
     * Sets a parameter of a strip.
     * @param  {number} index Strip number
     * @param  {StripProperties} property Propertyname which should be changed
     * @param  {any} value Property value
     */
    setStripParameter = (index, property, value) => {
        return this.setParameter("Strip", index, property, value);
    };
    /**
     * @param  {()=>any} fn Function which should be called if something changes
     */
    attachChangeEvent = (fn) => {
        this.eventPool.push(fn);
    };
    /**
     * Sets an option.
     * @param {string} option Option to set
     */
    setOption = (option) => {
        const script = Buffer.alloc(option.length + 1);
        script.fill(0).write(option);
        libVM.VBVMR_SetParameters(script);
        return new Promise((resolve) => setTimeout(resolve, 200));
    };
    /**
     * Checks whether properties has been changed and calls all event listeners
     */
    checkPropertyChange = () => {
        if (this.isParametersDirty() === 1) {
            this.eventPool.forEach((eventListener) => {
                eventListener();
            });
        }
    };
    /**
     * Gets installed voicemeeter type.
     * Means Voicemeeter(normal,banana,potato)
     */
    getVoicemeeterType = () => {
        const typePtr = new LongArray(1);
        if (libVM.VBVMR_GetVoicemeeterType(typePtr) !== 0) {
            throw new Error("running failed");
        }
        switch (typePtr[0]) {
            case 1: // Voicemeeter
                return "voicemeeter";
            case 2: // Voicemeeter Banana
                return "voicemeeterBanana";
            case 3: // Voicemeeter Potato
                return "voicemeeterPotato";
            default:
                throw new Error("Voicemeeter seems not to be installed");
        }
    };
    /**
     * Returns the installed voicemeeter version
     */
    getVoicemeeterVersion = () => {
        const versionPtr = new LongArray(1);
        if (libVM.VBVMR_GetVoicemeeterVersion(versionPtr) !== 0) {
            throw new Error("running failed");
        }
        return versionPtr;
    };
    /**
     * Gets a parameter of voicemeeter
     * @param  {'Strip'|'Bus'} selector Strip or Bus
     * @param  {number} index Number of strip or bus
     * @param  {StripProperties|BusProperties} property Property which should be read
     */
    getParameter = (selector, index, property) => {
        const parameterName = selector !== 'Recorder' ? `${selector}[${index}].${property}` : `Recorder.${property}`;
        if (!this.isConnected) {
            throw new Error("Not correct connected ");
        }
        const hardwareIdPtr = Buffer.alloc(parameterName.length + 1);
        hardwareIdPtr.write(parameterName);
        let namePtr = null;
        if (["Label", "FadeTo", "FadeBy", "AppGain", "AppMute", "device.name"].indexOf(property) > -1) {
            namePtr = new CharArray(512);
            libVM.VBVMR_GetParameterStringA(hardwareIdPtr, namePtr);
            return String.fromCharCode
                .apply(null, namePtr)
                .split("")
                .filter((e) => {
                return e !== "\0";
            })
                .join("");
        }
        namePtr = new FloatArray(1);
        libVM.VBVMR_GetParameterFloat(hardwareIdPtr, namePtr);
        return namePtr[0];
    };
    /**
     * Sets a parameter of a bus or Strip
     * @param  {'Strip'|'Bus'} selector
     * @param  {number} index Number of strip or bus
     * @param  {StripProperties|BusProperties} property Propertyname which should be changed
     * @param  {any} value Property value
     */
    setParameter = (selector, index, property, value) => {
        if (!this.isConnected) {
            throw new Error("Not connected ");
        }
        const scriptString = selector !== 'Recorder' ? `${selector}[${index}].${property}=${value};` : `Recorder.${property}=${value};`;
        return this.setOption(scriptString);
    };
}
exports.default = Voicemeeter;
//# sourceMappingURL=VoicemeeterConnector.js.map