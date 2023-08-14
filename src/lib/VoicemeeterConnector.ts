/* eslint-disable no-control-regex */
import ffi from "ffi-napi";
import refArray from "ref-array-napi";
import DLLHandler from "./DLLHandler";
import { Device, VMLibrary, VoiceMeeterTypes } from "../types/VoicemeeterTypes";
import { BusProperties, RecorderProperties, StripProperties, CommandActions, CommandButtons, CommandEqs } from "./VoicemeeterConsts";

/**
 * @ignore
 */
const CharArray = refArray("char");
/**
 * @ignore
 */
const LongArray = refArray("long");
/**
 * @ignore
 */
const FloatArray = refArray("float");
/**
 * @ignore
 */
let libVM: VMLibrary;
/**
 * @ignore
 */
let instance: Voicemeeter;

export default class Voicemeeter {
	/**
	 * Initializes the voice meeter dll connection.
	 * This call is neccessary to use the api. It returns a promise with a VoiceMeeter instance
	 */
	public static async init(): Promise<Voicemeeter> {
		const dllPath = await DLLHandler.getDLLPath();

		return new Promise((resolve: (instance: Voicemeeter) => any) => {
			if (!instance) {
				instance = new Voicemeeter();
			}
			libVM = ffi.Library(`${dllPath}/VoicemeeterRemote64.dll`, {
				VBVMR_Login: ["long", []],
				VBVMR_Logout: ["long", []],
				VBVMR_RunVoicemeeter: ["long", ["long"]],
				VBVMR_IsParametersDirty: ["long", []],
				VBVMR_GetLevel: ["long", ["long", "long", FloatArray]],
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

	private isInitialised = false;
	private isConnected = false;
	private outputDevices: Device[] = [];
	private inputDevices: Device[] = [];
	private version = "";
	private type: VoiceMeeterTypes;
	private eventPool = [] as Array<() => void>;

	/**
	 * Starts a connection to VoiceMeeter
	 */
	public connect = () => {
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
	public get $outputDevices(): Device[] {
		return this.outputDevices;
	}

	/**
	 * Getter $inputDevices
	 * @return {Device[] }
	 */
	public get $inputDevices(): Device[] {
		return this.inputDevices;
	}

	/**
	 * Getter $version
	 * @return {string }
	 */
	public get $version(): string {
		return this.version;
	}

	/**
	 * Getter $type
	 * @return {VoiceMeeterTypes}
	 */
	public get $type(): VoiceMeeterTypes {
		return this.type;
	}

	/**
	 * Terminates the connection to VoiceMeeter
	 */
	public disconnect = () => {
		if (!this.isConnected) {
			throw new Error("Not connected ");
		}
		try {
			if (libVM.VBVMR_Logout() === 0) {
				this.isConnected = false;
				return;
			}
			throw new Error("Disconnect failed");
		} catch {
			throw new Error("Disconnect failed");
		}
	};

	/**
	 * Updates all input and ouput devices
	 */
	public updateDeviceList = () => {
		if (!this.isConnected) {
			throw new Error("Not connected ");
		}
		this.outputDevices = [];
		this.inputDevices = [];
		const outputDeviceNumber = libVM.VBVMR_Output_GetDeviceNumber();
		for (let i = 0; i < outputDeviceNumber; i++) {
			const hardwareIdPtr = new CharArray(256) as any;
			const namePtr = new CharArray(256) as any;
			const typePtr = new LongArray(1) as any;

			libVM.VBVMR_Output_GetDeviceDescA(i, typePtr, namePtr, hardwareIdPtr);
			this.outputDevices.push({
				name: String.fromCharCode(...namePtr.toArray()).replace(/\u0000+$/g, ""),
				hardwareId: String.fromCharCode(...hardwareIdPtr.toArray()).replace(/\u0000+$/g, ""),
				type: typePtr[0],
			});
		}

		const inputDeviceNumber = libVM.VBVMR_Input_GetDeviceNumber();
		for (let i = 0; i < inputDeviceNumber; i++) {
			const hardwareIdPtr = new CharArray(256) as any;
			const namePtr = new CharArray(256) as any;
			const typePtr = new LongArray(1) as any;

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
	public isParametersDirty = () => {
		return libVM.VBVMR_IsParametersDirty();
	};

	/**
	 * Gets a bus parameter.
	 * @param  {number} index Index of the bus
	 * @param  {BusProperties} property Property which should be get
	 */

	public getBusParameter = (index: number, property: BusProperties) => {
		return this.getParameter("Bus", index, property);
	};

	/**
	 * Sets a parameter of a bus.
	 * @param  {number} index Bus number
	 * @param  {BusProperties} property Propertyname which should be changed
	 * @param  {any} value Property value
	 */
	public setBusParameter = (index: number, property: BusProperties, value: any) => {
		return this.setParameter("Bus", index, property, value);
	};

	/**
	 * Gets input or output levels
	 * @param {0 | 1 | 2 | 3} type 0 = pre fader input | 1 = post fader input | 2 = post Mute input | 3 = Output
	 * @param {number} id 0 indexed level ID, Physical inputs have 2 levels, virutal inputs and all outputs have 8 levels
	 */
	public getLevel = (type: 0 | 1 | 2 | 3, id: number) => {
		if (!this.isConnected) {
			throw new Error("Not correct connected ");
		}

		let namePtr = new FloatArray(1);
		libVM.VBVMR_GetLevel(type, id, namePtr);
		return namePtr[0];
	}

	/**
	 * Get a recorder parameter.
	 * @param {RecorderProperties} property Property which should be get
	 */
	public getRecorderParameter = (property: RecorderProperties) => {
		return this.getParameter("Recorder", 0, property);
	}

	/**
	 * Set a recorder parameter.
	 * @param {RecorderProperties} property PropertyName which should be changed
	 * @param {any} value Property value
	 */
	public setRecorderParameter = (property: RecorderProperties, value: any) => {
		return this.setParameter("Recorder", 0, property, value);
	}

	/**
	 * Gets a strip parameter
	 * @param  {number} index Index of the strip
	 * @param  {StripProperties} property Property which should be get
	 */
	public getStripParameter = (index: number, property: StripProperties) => {
		return this.getParameter("Strip", index, property);
	};

	/**
	 * Sets a parameter of a strip.
	 * @param  {number} index Strip number
	 * @param  {StripProperties} property Propertyname which should be changed
	 * @param  {any} value Property value
	 */
	public setStripParameter = (index: number, property: StripProperties, value: any) => {
		return this.setParameter("Strip", index, property, value);
	};

	/**
	 * Execute a Command Action
	 * @param  {CommandActions} property Action which should be called
	 * @param  {any} value Property value
	 */
	public executeCommandAction = (property: CommandActions, value: any) => {
		return this.setParameter("Command", 0, property, value);
	};

	/**
	 * Execute button action
	 * @param  {CommandButtons} property Action which should be called
	 * @param  {any} value Property value
	 */
	public executeButtonAction = (index: number, property: CommandButtons, value: any) => {
		return this.setParameter("Command", index, property, value);
	};

	/**
	 * Execute EQ action
	 * @param  {CommandEqs} property Action which should be called
	 * @param  {any} value Property value
	 */
	public executeEqAction = (index: number, property: CommandEqs, value: any) => {
		return this.setParameter("Command", index, property, value);
	};

	/**
	 * Gets Voicemeeter state
	 * @param  {CommandActions.Lock} property Property which should be get
	 */
	public getVMState = (property: CommandActions.Lock | CommandActions.Show) => {
		return this.getParameter("Command", 0, property);
	};

	/**
	 * Gets a button parameter
	 * @param  {number} index Index of the strip
	 * @param  {CommandButtons} property Property which should be get
	 */
	public getButtonParameter = (index: number, property: CommandButtons) => {
		return this.getParameter("Command", index, property);
	};

	/**
	 * @param  {()=>any} fn Function which should be called if something changes
	 */
	public attachChangeEvent = (fn: () => any) => {
		this.eventPool.push(fn);
	};

	/**
	 * Sets an option.
	 * @param {string} option Option to set
	 */
	public setOption = (option: string) => {
		const script = Buffer.alloc(option.length + 1);
		script.fill(0).write(option);
		libVM.VBVMR_SetParameters(script);
		return new Promise((resolve) => setTimeout(resolve, 200));
	};

	/**
	 * Checks whether properties has been changed and calls all event listeners
	 */
	private checkPropertyChange = () => {
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
	private getVoicemeeterType = (): VoiceMeeterTypes => {
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
	private getVoicemeeterVersion = () => {
		const versionPtr = new LongArray(1) as any;
		if (libVM.VBVMR_GetVoicemeeterVersion(versionPtr) !== 0) {
			throw new Error("running failed");
		}
		return versionPtr;
	};

	/**
	 * Gets a parameter of voicemeeter
	 * @param  {'Strip'|'Bus'|'Recorder'|'Command'} selector Strip, Bus, Recorder or Command
	 * @param  {number} index Number of strip or bus
	 * @param  {StripProperties|BusProperties|RecorderProperties|CommandActions.Lock|CommandActions.Show|CommandButtons} property Property which should be read
	 */
	private getParameter = (selector: "Strip" | "Bus" | "Recorder" | "Command", index: number, property: StripProperties | BusProperties | RecorderProperties | CommandActions.Lock | CommandActions.Show | CommandButtons) => {
		let parameterName = '';
		switch (selector) {
			case "Strip":
			case "Bus":
				parameterName = `${selector}[${index}].${property}`;
				break;
			case "Command":
				switch (property) {
					case CommandButtons.State:
						parameterName = `Command.Button[${index}].State`;
					case CommandButtons.StateOnly:
						parameterName = `Command.Button[${index}].StateOnly`;
					case CommandButtons.Trigger:
						parameterName = `Command.Button[${index}].Trigger`;
					case CommandButtons.Color:
						parameterName = `Command.Button[${index}].Color`;
					default:
						parameterName = `Command.${property}`;
				}
				break;
			default:
				parameterName = `${selector}.${property}`;
		}

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
				.filter((e: string) => {
					return e !== "\0";
				})
				.join("");
		}

		namePtr = new FloatArray(1);
		libVM.VBVMR_GetParameterFloat(hardwareIdPtr, namePtr);
		return namePtr[0];
	};

	/**
	 * Sets a parameter of a Bus, Strip, Recorder, or Command
	 * @param  {'Strip'|'Bus'|'Recorder'|'Command'} selector
	 * @param  {number} index Number of strip or bus
	 * @param  {StripProperties|BusProperties|RecorderProperties|CommandActions|CommandButtons|CommandEqs} property Propertyname which should be changed
	 * @param  {any} value Property value
	 */
	private setParameter = (
		selector: "Strip" | "Bus" | "Recorder" | "Command",
		index: number,
		property: StripProperties | BusProperties | RecorderProperties | CommandActions | CommandButtons | CommandEqs,
		value: any
	): Promise<any> => {
		if (!this.isConnected) {
			throw new Error("Not connected ");
		}

		let scriptString = '';

		switch (selector) {
			case "Strip":
			case "Bus":
				scriptString = `${selector}[${index}].${property}=${value};`;
				break;
			case "Command":
				switch (property) {
					case CommandButtons.State:
						scriptString = `Command.Button[${index}].State=${value};`;
					case CommandButtons.StateOnly:
						scriptString = `Command.Button[${index}].StateOnly=${value};`;
					case CommandButtons.Trigger:
						scriptString = `Command.Button[${index}].Trigger=${value};`;
					case CommandButtons.Color:
						scriptString = `Command.Button[${index}].Color=${value};`;
					case CommandEqs.SaveBus:
						scriptString = `Command.SaveBUSEQ[${index}]=${value};`;
					case CommandEqs.LoadBus:
						scriptString = `Command.LoadBUSEQ[${index}]=${value};`;
					case CommandEqs.SaveStrip:
						scriptString = `Command.SaveStripEQ[${index}]=${value};`;
					case CommandEqs.LoadStrip:
						scriptString = `Command.LoadStripEQ[${index}]=${value};`;
					default:
						scriptString = `Command.${property}=${value};`;
				}
				break;
			default:
				scriptString = `${selector}.${property}=${value};`;
		}

		return this.setOption(scriptString);
	};
}
