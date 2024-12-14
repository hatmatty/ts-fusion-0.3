import Fusion from "../src";
import { CreateFusionStory, InferFusionProps } from "@rbxts/ui-labs";

const controls = {};

const story = CreateFusionStory(
	{
		fusion: Fusion,
		controls: controls,
	},
	(props: InferFusionProps<typeof controls>) => {
		print("YO RANN!");
	},
);

export = story;
