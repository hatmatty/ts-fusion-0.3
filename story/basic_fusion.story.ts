import { OnChangeKey, PropertyTable, Scope } from "Types";
import Fusion, { Computed, Contextual, OnChange, OnEvent, Out, peek, Safe, scoped, Value } from "../src";
import { CreateFusionStory, InferFusionProps } from "@rbxts/ui-labs";
import { ModuleKind } from "typescript";

const controls = {};

const story = CreateFusionStory(
	{
		fusion: Fusion,
		controls: controls,
	},
	(props: InferFusionProps<typeof controls>) => {
		// INNER SCOPES
		print("----- INNER SCOPE ------");
		const uiScope = scoped(Fusion);
		const dropdownScope = uiScope.deriveScope();

		dropdownScope.push(() => {
			print("internal was deleted");
		});

		uiScope.push(() => {
			print("external was deleted");
		});

		uiScope.doCleanup();
		/// VALUES
		print("----- VALUES ------");
		const scope: Scope<typeof Fusion> = props.scope;
		const health = scope.Value(5);
		print(peek(health)); // 5
		health.set(25);
		print(peek(health)); // 25

		/// OBSERVER
		print("----- OBSERVER ------");
		const observer = scope.Observer(health);

		print("...connecting...");
		const discconnect = observer.onChange(() => {
			print("Observed a change to: ", peek(health));
		});

		print("...setting health to 30...");
		health.set(30);
		discconnect();
		print("...setting health to 50...");
		health.set(25);

		// COMPUTED
		print("----- COMPUTED ------");
		const scope2 = scoped(Fusion);
		const number = scope2.Value(5);

		const double = scope2.Computed((use, myBrandNewScope) => {
			const current = use(number);

			print("Creating", current);
			// myBrandNewScope.push(() => {
			// 	print("Destroying", current)
			// });

			return current * 2;
		});

		print("...setting to 25...");
		number.set(25);
		print("...setting to 2...");
		number.set(2);
		print("...cleaning up...");
		scope2.doCleanup();
		//

		// FOR VALUES
		print("----- FOR VALUES ------");
		const numbers = [1, 2, 3, 4, 5];
		const factor = scope.Value(2);
		const multiplied = scope.ForValues(numbers, (use, scope, num) => {
			return num * use(factor);
		});
		const a = peek(multiplied);
		print(peek(multiplied)); // {2, 4, 6, 8, 10}
		factor.set(10);
		print(peek(multiplied)); //{1 0, 20, 30, 40, 50}

		// FOR KEYS
		print("----- FOR KEYS ------");
		const foodSet = scope.Value({ broccoli: true, chocolate: true });

		const prefixes = { chocolate: "yummy", broccoli: scope.Value("gross") };
		const renamedFoodSet = scope.ForKeys(foodSet, (use, scope, food) => {
			return use(prefixes[food]) + "_" + food;
		});

		print(peek(renamedFoodSet)); // { gross_broccoli = true, yummy_chocolate = true }
		prefixes.broccoli.set("scrumptious");
		print(peek(renamedFoodSet)); // { scrumptious_broccoli = true, yummy_chocolate = true }

		// FOR PAIRS
		print("----- FOR PAIRS ------");
		const itemColours = { shoes: "red", socks: "blue" } as const;

		const shouldSwap = scope.Value(false);
		const swapped = scope.ForPairs(itemColours, (use, scope, item, colour) => {
			if (use(shouldSwap)) {
				return [colour, item] as LuaTuple<[string, string]>;
			} else {
				return [item, colour] as LuaTuple<[string, string]>;
			}
		});

		const swped = peek(swapped);
		print(peek(swapped)); // --> { shoes = "red", socks = "blue" }
		shouldSwap.set(true);
		print(peek(swapped)); // --> { red = "shoes", blue = "socks" }

		// TWEENS
		print("----- TWEENS ------");
		const goal = scope.Value(0);
		const animated = scope.Tween(goal);
		goal.set(10);
		task.wait();
		print(peek(animated));

		// SPRINGS
		print("----- SPRINGS ------");
		{
			const goal = scope.Value(0);
			const speed = 25;
			const damping = scope.Value(0.5);
			const animated = scope.Spring(goal, speed, damping);
			goal.set(100);
			task.wait();
			task.wait();
			task.wait();
			print(peek(animated));
		}

		// HYDRATION
		print("----- HYDRATION ------");
		const frame = new Instance("Frame");
		frame.Size = UDim2.fromScale(0.1, 0.1);
		frame.BackgroundColor3 = new Color3(1, 0, 0);
		frame.Position = UDim2.fromScale(0, 0);
		scope.push(frame);

		scope.Hydrate(frame)({
			BackgroundColor3: new Color3(0, 1, 0),
			Parent: props.target,
		});
		print("GREEN RECTANGLE IN TOP LEFT!");

		const message = scope.Value("Hello there!");

		const ui = scope.New("TextLabel")({
			Name: "Greeting",
			Parent: props.target,
			Position: UDim2.fromScale(0.5, 0.5),
			AnchorPoint: new Vector2(0.5, 0.5),
			Size: UDim2.fromScale(0.1, 0.1),
			Text: message,
		});

		print(ui.Name); // --> Greeting
		print(ui.Text); // --> Hello there!

		message.set("Goodbye friend!");
		print(ui.Text); // --> Goodbye friend!

		// EVENTS -  NEED AUTOCOMPLETE

		const numClicks = scope.Value(0);
		const button = scope.New("TextButton")({
			Parent: props.target,
			Position: UDim2.fromScale(0.75, 0.5),
			AnchorPoint: new Vector2(0.5, 0.5),
			Size: UDim2.fromScale(0.1, 0.1),
			Text: "message",
			[OnEvent("Activated")]: () => {
				numClicks.set(peek(numClicks) + 1);
				print("The button was pressed", peek(numClicks), "time(s)!");
			},
		});

		// ON CHANGE - NEED AUTOCOMPLETE

		const text = scope.Value(undefined);
		const textbox = scope.New("TextBox")({
			Parent: props.target,
			Position: UDim2.fromScale(0.75, 0.25),
			AnchorPoint: new Vector2(0.5, 0.5),
			Size: UDim2.fromScale(0.1, 0.1),
			Text: "type here",
			[Out("Text")]: text,
			[OnChange("Text")]: (text) => {
				print("new text", text);
			},
		});
		scope.Observer(text).onChange(() => {
			print("observed", peek(text));
		});

		// THEME

        print("----- THEME -----")
		const Theme = {
			colours: {
				background: {
					light: Color3.fromHex("FFFFFF"),
					dark: Color3.fromHex("222222"),
				},
				text: {
					light: Color3.fromHex("FFFFFF"),
					dark: Color3.fromHex("222222"),
				},
			},
			currentTheme: Contextual("light")
		};

 
        const printTheme = () => {
            const theme = Theme.currentTheme.now();
            print(peek(theme), (typeIs(theme, "string")) ? "constant" : "state object")
        }
        
        printTheme() // --> light constant

        const override = scope.Value("light")
        Theme.currentTheme.is(override).during(() => {
            printTheme() // light state object
            override.set("dark")
            printTheme() //--> dark state object
        })
            

        printTheme() // --> light constant

        // SAFE
        print("---- SAFE -----")
        const numero = scope.Value(0);
        const doubleSafe = scope.Computed((use) => {
            return Safe({
                try: () => {
                    const numberValue = use(numero)
                    assert(numberValue !== 3, "I don't like the number 3")
                    return numberValue * 2
                },
                fallback: (err) => {
                    return "failed: " + tostring(err)
                }
            })
        })
        print(peek(doubleSafe)) 
        numero.set(3);
        print(peek(doubleSafe))

	},

);

export = story;
