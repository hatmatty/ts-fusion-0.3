import { Scope } from "Types";
import Fusion, { Child, Children, peek, SpecialKey } from "../src";
import { CreateFusionStory, InferFusionProps } from "@rbxts/ui-labs";

const controls = {};

function NoChildComponent(
	props: {
		// Parent: Instance;
	},
	scope: Scope<typeof Fusion>,
): Fusion.Child {
	return (
		<frame
			scope={scope}
			Name="PlayerList"
			Position={UDim2.fromScale(1,0)}
			AnchorPoint={new Vector2(1, 0)}
			Size={UDim2.fromOffset(300, 0)}
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={0.5}
			BackgroundColor3={new Color3(0, 0, 0)}
			// Parent={props.Parent}
		>
			
		</frame>
	);
}

function ChildedComponent(
	props: {
		Parent: Instance;
		[Children]?: Child
	},
	scope: Scope<typeof Fusion>,
): Fusion.Child {
	return (
		<frame
			scope={scope}
			Name="PlayerList"
			Position={UDim2.fromScale(1,0)}
			AnchorPoint={new Vector2(1, 0)}
			Size={UDim2.fromOffset(300, 100)}
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={0.5}
			BackgroundColor3={new Color3(0, 0, 0)}
			Parent={props.Parent}
		>
			{props[Children]}
		</frame>
	);
}

const story = CreateFusionStory(
	{
		fusion: Fusion,
		controls: controls,
	},
	(props: InferFusionProps<typeof controls>) => {
		const scope: Scope<typeof Fusion> = props.scope;

		// EXPECT TO ERROR!

		// const comp = <NoChildComponent scope={scope}>
		// 	<frame></frame>
		// </NoChildComponent>

		// SHOULD RUN WELL
		const comp2 = <ChildedComponent Parent={props.target} scope={scope}>
			<frame scope={scope} BackgroundColor3={new Color3(1,0,1)} Size={UDim2.fromScale(0.5,0.5)}/>
		</ChildedComponent>

		// HYDRATION
		print("----- NEW ------");

		const message = scope.Value("Hello there!");

		const ui = (
			<textlabel
				scope={scope}
				Name="Greeting"
				Parent={props.target}
				Position={UDim2.fromScale(0.5, 0.5)}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Size={UDim2.fromScale(0.1, 0.1)}
				Text={message}
			/>
		) as TextLabel;

		print(ui.Name); // --> Greeting
		print(ui.Text); // --> Hello there!

		message.set("Goodbye friend!");
		print(ui.Text); // --> Goodbye friend!

		// EVENTS -  NEED AUTOCOMPLETE

		const numClicks = scope.Value(0);

		<textbutton
			scope={scope}
			Parent={props.target}
			Position={UDim2.fromScale(0.75, 0.5)}
			AnchorPoint={new Vector2(0.5, 0.5)}
			Size={UDim2.fromScale(0.1, 0.1)}
			Text="message"
			OnEvent:Activated={() => {
				numClicks.set(peek(numClicks) + 1);
				print("The button was pressed", peek(numClicks), "time(as)!");
			}}
		/>;

		const OnTextChange: SpecialKey<() => void> = {
			type: "SpecialKey",
			kind: "OnHover",
			stage: "observer",
			apply(scope, value, applyTo) {
				const conn = (applyTo as TextBox).GetPropertyChangedSignal("Text").Connect(() => {
					value();
				})
				scope.push(conn);
			},
		}

		// ON CHANGE - NEED AUTOCOMPLETE

		const text = scope.Value(undefined);
		<textbox
			scope={scope}
			Parent={props.target}
			Position={UDim2.fromScale(0.75, 0.25)}
			AnchorPoint={new Vector2(0.5, 0.5)}
			Size={UDim2.fromScale(0.1, 0.1)}
			Text={"type here"}
			Out:Text={text}
			// OnChange:Text={(text) => {
			// 	print("onchange", text);
			// }}
			Uses={[OnTextChange, (text: string) => {
					print("onchange", text);
			}]}
		/>;
		scope.Observer(text).onChange(() => {
			print("observed", peek(text));
		});		
	},
);

export = story;
