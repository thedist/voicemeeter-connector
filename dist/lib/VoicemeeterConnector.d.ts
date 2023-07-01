import { Device, VoiceMeeterTypes } from "../types/VoicemeeterTypes";
import { BusProperties, RecorderProperties, StripProperties, CommandActions, CommandButtons, CommandEqs } from "./VoicemeeterConsts";
export default class Voicemeeter {
    /**
     * Initializes the voice meeter dll connection.
     * This call is neccessary to use the api. It returns a promise with a VoiceMeeter instance
     */
    static init(): Promise<Voicemeeter>;
    private isInitialised;
    private isConnected;
    private outputDevices;
    private inputDevices;
    private version;
    private type;
    private eventPool;
    /**
     * Starts a connection to VoiceMeeter
     */
    connect: () => void;
    /**
     * Getter $outputDevices
     * @return {Device[] }
     */
    get $outputDevices(): Device[];
    /**
     * Getter $inputDevices
     * @return {Device[] }
     */
    get $inputDevices(): Device[];
    /**
     * Getter $version
     * @return {string }
     */
    get $version(): string;
    /**
     * Getter $type
     * @return {VoiceMeeterTypes}
     */
    get $type(): VoiceMeeterTypes;
    /**
     * Terminates the connection to VoiceMeeter
     */
    disconnect: () => void;
    /**
     * Updates all input and ouput devices
     */
    updateDeviceList: () => void;
    /**
     * Returns wheter a parameter has been changed
     */
    isParametersDirty: () => any;
    /**
     * Gets a bus parameter.
     * @param  {number} index Index of the bus
     * @param  {BusProperties} property Property which should be get
     */
    getBusParameter: (index: number, property: BusProperties) => any;
    /**
     * Sets a parameter of a bus.
     * @param  {number} index Bus number
     * @param  {BusProperties} property Propertyname which should be changed
     * @param  {any} value Property value
     */
    setBusParameter: (index: number, property: BusProperties, value: any) => Promise<any>;
    /**
     * Gets input or output levels
     * @param {0 | 1 | 2 | 3} type 0 = pre fader input | 1 = post fader input | 2 = post Mute input | 3 = Output
     * @param {number} id 0 indexed level ID, Physical inputs have 2 levels, virutal inputs and all outputs have 8 levels
     */
    getLevel: (type: 0 | 1 | 2 | 3, id: number) => unknown;
    /**
     * Get a recorder parameter.
     * @param {RecorderProperties} property Property which should be get
     */
    getRecorderParameter: (property: RecorderProperties) => any;
    /**
     * Set a recorder parameter.
     * @param {RecorderProperties} property PropertyName which should be changed
     * @param {any} value Property value
     */
    setRecorderParameter: (property: RecorderProperties, value: any) => Promise<any>;
    /**
     * Gets a strip parameter
     * @param  {number} index Index of the strip
     * @param  {StripProperties} property Property which should be get
     */
    getStripParameter: (index: number, property: StripProperties) => any;
    /**
     * Sets a parameter of a strip.
     * @param  {number} index Strip number
     * @param  {StripProperties} property Propertyname which should be changed
     * @param  {any} value Property value
     */
    setStripParameter: (index: number, property: StripProperties, value: any) => Promise<any>;
    /**
     * Execute a global action
     * @param  {CommandActions} property Action which should be called
     * @param  {any} value Property value
     */
    executeGlobalAction: (property: CommandActions, value: any) => Promise<any>;
    /**
     * Execute button action
     * @param  {CommandButtons} property Action which should be called
     * @param  {any} value Property value
     */
    executeButtonAction: (index: number, property: CommandButtons, value: any) => Promise<any>;
    /**
     * Execute EQ action
     * @param  {CommandEqs} property Action which should be called
     * @param  {any} value Property value
     */
    executeEqAction: (index: number, property: CommandEqs, value: any) => Promise<any>;
    /**
     * Gets global state
     * @param  {CommandActions.Lock} property Property which should be get
     */
    getGlobalState: (property: CommandActions.Lock) => any;
    /**
     * Gets a button parameter
     * @param  {number} index Index of the strip
     * @param  {CommandButtons} property Property which should be get
     */
    getButtonParameter: (index: number, property: CommandButtons) => any;
    /**
     * @param  {()=>any} fn Function which should be called if something changes
     */
    attachChangeEvent: (fn: () => any) => void;
    /**
     * Sets an option.
     * @param {string} option Option to set
     */
    setOption: (option: string) => Promise<unknown>;
    /**
     * Checks whether properties has been changed and calls all event listeners
     */
    private checkPropertyChange;
    /**
     * Gets installed voicemeeter type.
     * Means Voicemeeter(normal,banana,potato)
     */
    private getVoicemeeterType;
    /**
     * Returns the installed voicemeeter version
     */
    private getVoicemeeterVersion;
    /**
     * Gets a parameter of voicemeeter
     * @param  {'Strip'|'Bus'|'Recorder'|'Command'} selector Strip, Bus, Recorder or
     * @param  {number} index Number of strip or bus
     * @param  {StripProperties|BusProperties|RecorderProperties|CommandActions.Lock|CommandButtons} property Property which should be read
     */
    private getParameter;
    /**
     * Sets a parameter of a Bus, Strip, Recorder or Command
     * @param  {'Strip'|'Bus'|'Recorder'|'Command'} selector
     * @param  {number} index Number of strip or bus
     * @param  {StripProperties|BusProperties|RecorderProperties|CommandActions|CommandButtons|CommandEqs} property Propertyname which should be changed
     * @param  {any} value Property value
     */
    private setParameter;
}
