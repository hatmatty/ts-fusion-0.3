/* eslint-disable @typescript-eslint/no-explicit-any */
import Fusion from ".";
import jsx from "./TS/jsx";

export type Error = {
	type: "Error";
	raw: string;
	message: string;
	trace: string;
	context?: string;
};

/** Types that can be expressed as vectors of numbers, and so can be animated. */
export type Animatable =
	| number
	| CFrame
	| Color3
	| ColorSequenceKeypoint
	| DateTime
	| NumberRange
	| NumberSequenceKeypoint
	| PhysicalProperties
	| Ray
	| Rect
	| Region3
	| Region3int16
	| UDim
	| UDim2
	| Vector2
	| Vector2int16
	| Vector3
	| Vector3int16;

/** A task which can be accepted for cleanup. */

// export type Task =
// 	| Instance
// 	| Callback
// 	| RBXScriptConnection
// 	| { Connected: boolean; Disconnect(): void }
// 	| thread
// 	| Promise<unknown>
// 	| { destroy(): void }
// 	| { Destroy(): void }
// 	| { disconnect(): void }
// 	| { Disconnect(): void }
// 	| Task[];

export type Task =
	| Instance
	| RBXScriptConnection
	| (() => void)
	| { destroy: () => void }
	| { Destroy: () => void }
	| Task[];

/** A scope of tasks to clean up. */
export type Scope<Constructors = unknown> = Task[] & ConvertToMethod<Constructors>;

type ConvertToMethod<T> = {
	[K in keyof T]: ToScopeConstructor<K> extends never ? T[K] : ToScopeConstructor<K>;
};

/** An object which uses a scope to dictate how long it lives. */
export interface ScopedObject {
	scope?: Scope<unknown>;
	oldestTask: unknown;
}

/** Script-readable version information. */
export type Version = {
	major: number;
	minor: number;
	isRelease: boolean;
};

/** An object which stores a value scoped in time. */
export type Contextual<T> = {
	type: "Contextual";
	now(): T;
	is(value: UsedAs<T>): ContextualIsMethods;
};

type ContextualIsMethods = {
	during<R, A extends unknown[]>(callback: (...args: A) => R, ...args: A): R;
};

export type GraphObject = ScopedObject & {
	createdAt: number;
	dependencySet: Map<GraphObject, unknown>;
	dependentSet: Map<GraphObject, unknown>;
	lastChange?: number;
	timeliness: "lazy" | "eager";
	validity: "valid" | "invalid" | "busy";
	_evaluate: (obj: GraphObject) => boolean;
};

/** An object which stores a piece of reactive state. */
export interface StateObject<T> extends GraphObject {
	type: "State";
	kind: string;
	_EXTREMELY_DANGEROUS_usedAsValue: T;
}

/** Passing values of this type to `Use` returns `T`. */
export type UsedAs<T> = StateObject<T> | T;

/** Function signature for use callbacks. */
export type Use = <T>(target: UsedAs<T>) => T;

/** A state object whose value can be set at any time by the user. */
export type Value<T, S = T> = StateObject<T> & {
	kind: "State";
	timeliness: "lazy";
	set(newValue: S, force?: boolean): S;
	____phantom_setType: (v: never) => S; // phantom data so this contains S
};

// :D
type ToScopeConstructor<T> = T extends "Value"
	? ValueConstructorScoped
	: T extends "Computed"
		? ComputedConstructorScoped
		: T extends "ForKeys"
			? ForKeysConstructorScoped
			: T extends "ForValues"
				? ForValuesConstructorScoped
				: T extends "ForPairs"
					? ForPairsConstructorScoped
					: T extends "Tween"
						? TweenConstructorScoped
						: T extends "Spring"
							? SpringConstructorScoped
							: T extends "Hydrate"
								? HydrateConstructorScoped
								: T extends "New"
									? NewConstructorScoped
									: T extends "innerScope"
										? DeriveScopeConstructorScoped
										: T extends "deriveScope"
											? DeriveScopeConstructorScoped
											: T extends "Observer"
												? ObserverConstructorScoped
												: T extends "doCleanup"
													? doCleanupScoped
													: never;

// below is laggy
// type ToScopeConstructor<T> = T extends ValueConstructor
// 		? ValueConstructorScoped
// 	: T extends ComputedConstructor
// 		? ComputedConstructorScoped
// 	: T extends ForKeysConstructor
// 		? ForKeysConstructorScoped
// 	: T extends ForValuesConstructor
// 		? ForValuesConstructorScoped
// 	: T extends ForPairsConstructor
// 		? ForPairsConstructorScoped
// 	: T extends TweenConstructor
// 		? TweenConstructorScoped
// 	: T extends SpringConstructor
// 		? SpringConstructorScoped
// 	:  T extends HydrateConstructor
// 		? HydrateConstructorScoped
// 	: never;

// export type ValueConstructor = <T>(scope: Scope<unknown>, initialValue: T) => LuaTuple<[Value<T, any>, ValueSetter]>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ValueConstructor = <T>(scope: Scope<unknown>, initialValue: T) => Value<T, any>;
export type ValueConstructorScoped = <T>(this: Scope<unknown>, initialValue: T) => Value<T, any>;

/** A state object whose value is derived from other objects using a callback. */
export type Computed<T> = StateObject<T> & {
	kind: "Computed";
	timeliness: "lazy";
};

export type ComputedConstructor = <T, S>(scope: Scope<S>, callback: (use: Use, scope: Scope<S>) => T) => Computed<T>;
export type ComputedConstructorScoped = <T, S>(
	this: Scope<S>,
	callback: (use: Use, scope: Scope<S>) => T,
) => Computed<T>;

/** Extracts scoped constructors to implicitly pass in the scope */ // @NOT NEEDED
// export type ConstructorsOfConstructor = <Constructors extends object>(
// 	scope: Scope<unknown>,
// 	constructors: Constructors,
// ) => {
// 	[key in keyof Constructors]: Constructors[key] extends (scope: Scope<unknown>, ...args: infer P) => infer R
// 		? (...args: P) => R
// 		: Constructors[key];
// };

/** A state object which maps over keys and/or values in another table. */
export type For<Out> = StateObject<Out> & {
	kind: "For";
};

export type ForPairsConstructor = <In, KO, VO, S>(
	scope: Scope<S>,
	inputTable: UsedAs<In>,
	processor: (use: Use, scope: Scope<S>, key: Key<In>, value: Val<In>) => LuaTuple<[KO, VO]>,
) => For<Map<KO, VO>>;
export type ForPairsConstructorScoped = <In, KO, VO, S>(
	this: Scope<S>,
	inputTable: UsedAs<In>,
	processor: (use: Use, scope: Scope<S>, key: Key<In>, value: Val<In>) => LuaTuple<[KO, VO]>,
) => For<Map<KO, VO>>;

// oldInput: UsedAs<Map<KI, VI>>

type Key<In> =
	In extends Array<any>
		? number
		: In extends Map<infer K, any>
			? K
			: In extends Set<infer K>
				? K
				: In extends Record<infer K, any>
					? K
					: never;
type Val<In> =
	In extends Array<infer V>
		? V
		: In extends Map<any, infer V>
			? V
			: In extends Set<any>
				? true
				: In extends Record<any, infer V>
					? V
					: never;
type Reconstruct<In, K, V> =
	In extends Array<any>
		? Array<V>
		: In extends Map<any, any>
			? Map<K, V>
			: In extends Set<any>
				? Set<K>
				: In extends Record<any, any>
					? K extends string | number | symbol
						? Record<K, V>
						: never
					: Map<K, V>;

export type ForKeysConstructor = <In, KO, S>(
	scope: Scope<S>,
	inputTable: UsedAs<In>,
	processor: (use: Use, scope: Scope<S>, key: Key<In>) => KO,
) => For<Reconstruct<In, KO, Val<In>>>;
export type ForKeysConstructorScoped = <In, KO, S>(
	this: Scope<S>,
	inputTable: UsedAs<In>,
	processor: (use: Use, scope: Scope<S>, key: Key<In>) => KO,
) => For<Reconstruct<In, KO, Val<In>>>;

export type ForValuesConstructor = <In, VO, S>(
	scope: Scope<S>,
	inputTable: UsedAs<In>,
	processor: (use: Use, scope: Scope<S>, value: Val<In>) => VO,
) => For<Reconstruct<In, Key<In>, VO>>;
export type ForValuesConstructorScoped = <In, VO, S>(
	this: Scope<S>,
	inputTable: UsedAs<In>,
	processor: (use: Use, scope: Scope<S>, value: Val<In>) => VO,
) => For<Reconstruct<In, Key<In>, VO>>;

/** An object which can listen for updates on another state object. */
export type Observer = GraphObject & {
	type: "Observer";
	timeliness: "eager";
	onChange(callback: () => void): () => void;
	onBind(callback: () => void): () => void;
};

export type ObserverConstructor = (scope: Scope<unknown>, watching: unknown) => Observer;
export type ObserverConstructorScoped = (this: Scope<unknown>, watching: unknown) => Observer;

/** A state object which follows another state object using tweens. */
export type Tween<T> = StateObject<T> & {
	kind: "Tween";
};

export type TweenConstructor = <T>(
	scope: Scope<unknown>,
	goalState: UsedAs<T>,
	tweenInfo?: UsedAs<TweenInfo>,
) => Tween<T>;
export type TweenConstructorScoped = <T>(
	this: Scope<unknown>,
	goalState: UsedAs<T>,
	tweenInfo?: UsedAs<TweenInfo>,
) => Tween<T>;

/** A state object which follows another state object using spring simulation. */
export type Spring<T> = StateObject<T> & {
	kind: "Spring";
	setPosition(newPosition: T): void;
	setVelocity(newVelocity: T): void;
	addVelocity(deltaVelocity: T): void;
};

export type SpringConstructor = <T>(
	scope: Scope<unknown>,
	goalState: UsedAs<T>,
	speed?: UsedAs<number>,
	damping?: UsedAs<number>,
) => Spring<T>;
export type SpringConstructorScoped = <T>(
	this: Scope<unknown>,
	goalState: UsedAs<T>,
	speed?: UsedAs<number>,
	damping?: UsedAs<number>,
) => Spring<T>;

/** Defines a custom operation to apply to a Roblox instance. */
export interface SpecialKey<V = unknown> {
	type: "SpecialKey";
	kind: string;
	stage: "self" | "descendants" | "ancestor" | "observer";
	apply(scope: Scope<unknown>, value: V, applyTo: Instance): void;
}

/** A collection of instances that may be parented to another instance. */
export type Child =
	| Instance
	// specified StateObject as to avoid a circular reference
	// | (Dependency & {
	// 		type: "State";
	// 		kind: string;
	// 		____phantom_peekType: (arg0: never) => Child;
	//   }) // @NOT NEEDED
	| undefined
	| StateObject<Child>
	| Child[];

// @NOT NEEDED BELOW FULL
export type Children = SpecialKeyType<"Children">;
export type OnChangeKey<T> = SpecialKeyType<"OnChange", T>;
export type OutKey<T> = SpecialKeyType<"Out", T>;
export type OnEventKey<T> = SpecialKeyType<"OnEvent", T>;
type SpecialKeyType<Kind extends string, Subtype = ""> = Subtype extends
	| string
	| number
	| bigint
	| boolean
	| undefined
	| undefined
	? `${Kind}:${Subtype}`
	: never;

/** A table that defines an instance's properties, handlers and children. */
export type PropertyTable<T extends Instance> = Partial<
	{
		[K in keyof WritableInstanceProperties<T>]: UsedAs<WritableInstanceProperties<T>[K]>;
	} & {
		[K in InstancePropertyNames<T> as OnChangeKey<K>]: (newValue: T[K]) => void;
	} & {
		[K in InstancePropertyNames<T> as OutKey<K>]: Value<T[K] | undefined>;
	} & {
		[K in InstanceEventNames<T> as OnEventKey<K>]: T[K] extends RBXScriptSignal<infer C>
			? (...args: Parameters<C>) => void
			: never;
	} & Record<Children, Child> &
		Map<SpecialKey, unknown>
>;

export type NewConstructor = <T extends keyof CreatableInstances>(
	scope: Scope<unknown>,
	className: T,
) => (propertyTable: PropertyTable<CreatableInstances[T]>) => CreatableInstances[T];
export type NewConstructorScoped = <T extends keyof CreatableInstances>(
	this: Scope<unknown>,
	className: T,
) => (propertyTable: PropertyTable<CreatableInstances[T]>) => CreatableInstances[T];

export type HydrateConstructor = <T extends Instances[keyof Instances]>(
	scope: Scope<unknown>,
	instance: T,
) => (propertyTable: PropertyTable<T>) => T;
export type HydrateConstructorScoped = <T extends Instances[keyof Instances]>(
	this: Scope<unknown>,
	instance: T,
) => (propertyTable: PropertyTable<T>) => T;

// export type NewJSXConstructor = (element: JSX.ElementType, props: defined, children: Child) => Instance;

export type DeriveScopeConstructor = (<S>(scope: Scope<S>) => Scope<S>) &
	(<S, A>(scope: Scope<S>, a: A & {}) => Scope<S & A>) &
	(<S, A, B>(scope: Scope<S>, a: A & {}, b: B & {}) => Scope<S & A & B>) &
	(<S, A, B, C>(scope: Scope<S>, a: A & {}, b: B & {}, c: C & {}) => Scope<S & A & B & C>) &
	(<S, A, B, C, D>(scope: Scope<S>, a: A & {}, b: B & {}, c: C & {}, d: D & {}) => Scope<S & A & B & C & D>) &
	(<S, A, B, C, D, E>(
		scope: Scope<S>,
		a: A & {},
		b: B & {},
		c: C & {},
		d: D & {},
		e: E & {},
	) => Scope<S & A & B & C & D & E>) &
	(<S, A, B, C, D, E, F>(
		scope: Scope<S>,
		a: A & {},
		b: B & {},
		c: C & {},
		d: D & {},
		e: E & {},
		f: F & {},
	) => Scope<S & A & B & C & D & E & F>);
export type DeriveScopeConstructorScoped = (<S>(this: Scope<S>) => Scope<S>) &
	(<S, A>(this: Scope<S>, a: A & {}) => Scope<S & A>) &
	(<S, A, B>(this: Scope<S>, a: A & {}, b: B & {}) => Scope<S & A & B>) &
	(<S, A, B, C>(this: Scope<S>, a: A & {}, b: B & {}, c: C & {}) => Scope<S & A & B & C>) &
	(<S, A, B, C, D>(this: Scope<S>, a: A & {}, b: B & {}, c: C & {}, d: D & {}) => Scope<S & A & B & C & D>) &
	(<S, A, B, C, D, E>(
		this: Scope<S>,
		a: A & {},
		b: B & {},
		c: C & {},
		d: D & {},
		e: E & {},
	) => Scope<S & A & B & C & D & E>) &
	(<S, A, B, C, D, E, F>(
		this: Scope<S>,
		a: A & {},
		b: B & {},
		c: C & {},
		d: D & {},
		e: E & {},
		f: F & {},
	) => Scope<S & A & B & C & D & E & F>);

export type ScopedConstructor = (() => Scope<{}>) &
	(<A>(a: A & {}) => Scope<A>) &
	(<A, B>(a: A & {}, b: B & {}) => Scope<A & B>) &
	(<A, B, C>(a: A & {}, b: B & {}, c: C & {}) => Scope<A & B & C>) &
	(<A, B, C, D>(a: A & {}, b: B & {}, c: C & {}, d: D & {}) => Scope<A & B & C & D>) &
	(<A, B, C, D, E>(a: A & {}, b: B & {}, c: C & {}, d: D & {}, e: E & {}) => Scope<A & B & C & D & E>) &
	(<A, B, C, D, E, F>(
		a: A & {},
		b: B & {},
		c: C & {},
		d: D & {},
		e: E & {},
		f: F & {},
	) => Scope<A & B & C & D & E & F>);

export type ContextualConstructor = <T>(defaultValue: T) => Contextual<T>;

/** Safely runs a function and returns the value it produces. */
export type Safe = <Success, Fail>(callbacks: {
	try: () => Success;
	fallback: (err: unknown) => Fail;
}) => Success | Fail;

type doCleanup = (task: Task) => void;
type doCleanupScoped = (this: Task) => void;

export type Fusion = {
	version: Version;
	Contextual: ContextualConstructor;
	// constructorsOf: ConstructorsOfConstructor; // @NOT NEEDED
	Safe: Safe;

	doCleanup: (task: Task) => void;
	scoped: ScopedConstructor;
	deriveScope: DeriveScopeConstructor;
	innerScope: DeriveScopeConstructor;

	peek: Use;
	Value: ValueConstructor;
	Computed: ComputedConstructor;
	ForPairs: ForPairsConstructor;
	ForKeys: ForKeysConstructor;
	ForValues: ForValuesConstructor;
	Observer: ObserverConstructor;

	Tween: TweenConstructor;
	Spring: SpringConstructor;

	New: NewConstructor;
	Hydrate: HydrateConstructor;

	jsx: typeof jsx;

	Child: (x: Child[]) => Child;
	Children: Children;
	Out: <T extends string>(propertyName: T) => OnChangeKey<T>;
	OnEvent: <T extends string>(eventName: T) => OnEventKey<T>;
	OnChange: <T extends string>(propertyName: T) => OnChangeKey<T>;
	Attribute: (attributeName: string) => SpecialKey;
	AttributeChange: (attributeName: string) => SpecialKey;
	AttributeOut: (attributeName: string) => SpecialKey;
};

/** This preserves generics and omits non-scoped constructors */ // @ NOT NEEDED
// export type Constructors = {
// 	Computed: <T>(callback: (use: Use, scope: Scope<object>) => T) => Computed<T>;
// 	// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 	Value: <T>(initialValue: T) => LuaTuple<[Value<T, any>, ValueSetter]>;
// 	ForKeys: <KI, KO, V>(
// 		inputTable: UsedAs<Map<KI, V>>,
// 		processor: (use: Use, scope: Scope<object>, key: KI) => KO,
// 	) => For<KO, V>;
// 	ForPairs: <KI, KO, VI, VO>(
// 		inputTable: UsedAs<Map<KI, VI>>,
// 		processor: (use: Use, scope: Scope<object>, key: KI, value: VI) => LuaTuple<[KO, VO]>,
// 	) => For<KO, VO>;
// 	ForValues: <K, VI, VO>(
// 		inputTable: UsedAs<Map<K, VI>>,
// 		processor: (use: Use, scope: Scope<object>, value: VI) => VO,
// 	) => For<K, VO>;
// 	Tween: <T>(goalState: UsedAs<T>, tweenInfo?: UsedAs<TweenInfo>) => Tween<T>;
// 	Spring: <T>(goalState: UsedAs<T>, speed?: UsedAs<number>, damping?: UsedAs<number>) => Spring<T>;
// };

export type ExternalProvider = {
	policies: {
		allowWebLinks: boolean;
	};

	logErrorNonFatal: (errorString: string) => void;
	logWarn: (errorString: string) => void;

	doTaskImmediate: (resume: () => void) => void;
	doTaskDeferred: (resume: () => void) => void;
	startScheduler: () => void;
	stopScheduler: () => void;
};

export type ExternalDebugger = {
	startDebugging: () => void;
	stopDebugging: () => void;

	trackScope: (scope: Scope<unknown>) => void;
	untrackScope: (scope: Scope<unknown>) => void;
};
