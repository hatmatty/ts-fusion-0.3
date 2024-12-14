import Fusion, { peek, ScopeFusion, UsedAs } from "../../src";
import { CreateFusionStory, InferFusionProps } from "@rbxts/ui-labs";

const controls = {};

const COLOUR_BLACK = new Color3(0, 0, 0);
const COLOUR_WHITE = new Color3(1, 1, 1);

const COLOUR_TEXT = COLOUR_WHITE;
const COLOUR_BG_REST = Color3.fromHex("0085FF");
const COLOUR_BG_HOVER = COLOUR_BG_REST.Lerp(COLOUR_WHITE, 0.25);
const COLOUR_BG_HELD = COLOUR_BG_REST.Lerp(COLOUR_BLACK, 0.25);
const COLOUR_BG_DISABLED = Color3.fromHex("CCCCCC");

const BG_FADE_SPEED = 40; // spring speed units

const ROUNDED_CORNERS = new UDim(0, 4);
const PADDING = UDim2.fromOffset(6, 4);

function Button(
	props: {
		Name?: UsedAs<string>;
		Layout: {
			LayoutOrder?: UsedAs<number>;
			Position?: UsedAs<UDim2>;
			AnchorPoint?: UsedAs<Vector2>;
			ZIndex?: UsedAs<number>;
			Size?: UsedAs<UDim2>;
			AutomaticSize?: UsedAs<Enum.AutomaticSize>;
		};
		Parent?: UsedAs<Instance>;
		Text?: UsedAs<string>;
		Disabled?: UsedAs<boolean>;
		OnClick: () => void;
	},
	scope: ScopeFusion,
): Fusion.Child {
	const isHovering = scope.Value(false);
	const isHeldDown = scope.Value(false);

	return (
		<textbutton
			scope={scope}
			Parent={props.Parent}
			Name={props.Name}
			LayoutOrder={props.Layout.LayoutOrder}
			Position={props.Layout.Position}
			AnchorPoint={props.Layout.AnchorPoint}
			ZIndex={props.Layout.ZIndex}
			Size={props.Layout.Size}
			AutomaticSize={props.Layout.AutomaticSize}
			Text={props.Text}
			TextColor3={COLOUR_TEXT}
			BackgroundColor3={scope.Spring(
				scope.Computed((use) => {
					return use(props.Disabled)
						? COLOUR_BG_DISABLED
						: use(isHeldDown)
							? COLOUR_BG_HELD
							: use(isHovering)
								? COLOUR_BG_HOVER
								: COLOUR_BG_REST;
				}),
				BG_FADE_SPEED,
			)}
			OnEvent:Activated={(input, clickCount) => {
				if (props.OnClick !== undefined && !peek(props.Disabled)) {
					props.OnClick();
				}
			}}
			OnEvent:MouseButton1Down={() => {
				isHeldDown.set(true);
			}}
			OnEvent:MouseButton1Up={() => isHeldDown.set(false)}
			OnEvent:MouseEnter={() => isHovering.set(true)}
			OnEvent:MouseLeave={() => {
				isHeldDown.set(false);
				isHovering.set(false);
			}}
		>
			<uicorner scope={scope} CornerRadius={ROUNDED_CORNERS} />
			<uipadding
				scope={scope}
				PaddingTop={PADDING.Y}
				PaddingBottom={PADDING.Y}
				PaddingLeft={PADDING.X}
				PaddingRight={PADDING.X}
			/>
		</textbutton>
	);
}

const story = CreateFusionStory(
	{
		fusion: Fusion,
		controls: controls,
	},
	(props: InferFusionProps<typeof controls>) => {
		const scope = props.scope as ScopeFusion;

		<Button
			scope={scope}
			Parent={props.target}
			Layout={{
				AnchorPoint: new Vector2(0.5, 0.5),
				Position: UDim2.fromScale(0.5, 0.5),
				Size: UDim2.fromScale(0.4, 0.4),
			}}
			OnClick={() => {
				print("CLICKED!");
			}}
		/>;
	},
);

export = story;
