import { Scope } from "Types";
import Fusion, { Children, peek, scoped } from "../../src";
import { CreateFusionStory, InferFusionProps } from "@rbxts/ui-labs";

const TWEEN_INFO = new TweenInfo(0.5, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut);

const controls = {};

const story = CreateFusionStory(
	{
		fusion: Fusion,
		controls: controls,
	},
	(props: InferFusionProps<typeof controls>) => {
		print("YO RANN!");
		const scope = props.scope as Scope<typeof Fusion>;

		// You can set this at any time to indicate where The Thing should be.
		const showTheThing = scope.Value(false);

		<frame
			scope={scope}
			Parent={props.target}
			Name={"The Thing"}
			Size={UDim2.fromOffset(200, 200)}
			AnchorPoint={new Vector2(0.5,0.5)}
			Position={scope.Tween(
				scope.Computed((use) => {
					const CENTRE = UDim2.fromScale(0.5, 0.5);
					const OFFSCREEN = UDim2.fromScale(-0.5, 0.5);
					return use(showTheThing) ? CENTRE : OFFSCREEN;
				}),
				TWEEN_INFO,
			)}
		/>;
        
        let enabled = true;
        scope.push(() => (enabled = false))

		// Without toggling the value, you won't see it animate.
		task.defer(() => {
			while (enabled) {
				task.wait(1);
                if (!enabled) return;
				showTheThing.set(!peek(showTheThing));
			}
		});
	},
);

export = story;
