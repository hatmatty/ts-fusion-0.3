import { Scope } from "Types";
import Fusion, { Child, Children, peek, scoped } from "../../src";
import { CreateFusionStory, InferFusionProps } from "@rbxts/ui-labs";

const controls = {
	addGuy: true
};

const Players = game.GetService("Players");

type PlayerValue = {
	DisplayName: string;
}

type UsedAs<T> = Fusion.UsedAs<T>;

function PlayerList(
	props: {
		Players: UsedAs<PlayerValue[]>;
		Parent: Instance;
		[Children]?: Child,
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
			Parent={props.Parent}
		>
			<uicorner scope={scope} CornerRadius={new UDim(0, 8)} />
			<uilistlayout scope={scope} SortOrder={Enum.SortOrder.Name} FillDirection={Enum.FillDirection.Vertical} />
			{scope.ForValues(props.Players, (use, scope, player) => {
				print("RETURNING -V")
				print(peek(props.Players))
				return (
					<textlabel
						scope={scope}
						Name={"PlayerListRow: " + player.DisplayName}
						Size={new UDim2(1, 0, 0, 25)}
						BackgroundTransparency={1}
						Text={player.DisplayName}
						TextColor3={new Color3(1, 1, 1)}
						Font={Enum.Font.GothamMedium}
						TextSize={16}
						TextXAlignment={Enum.TextXAlignment.Right}
						TextTruncate={Enum.TextTruncate.AtEnd}
					>
						<uipadding scope={scope} PaddingLeft={new UDim(0, 10)} PaddingRight={new UDim(0, 10)} />
					</textlabel>
				);
			})}
			{ props[Children] }
		</frame>
	);
}

const story = CreateFusionStory(
	{
		fusion: Fusion,
		controls: controls,
	},
	(props: InferFusionProps<typeof controls>) => {
		const scope = (props.scope as Scope<typeof Fusion>);
		
		const players = scope.Value(Players.GetPlayers() as PlayerValue[])
		function updatePlayers() {
			players.set(Players.GetPlayers())
		}

		const addPlayer = (displayName: string) => {
			const playersV = peek(players);
			playersV.push({ DisplayName: displayName });
			players.set(playersV, true)
		}
		
		scope.push(
			Players.PlayerAdded.Connect(updatePlayers),
			Players.PlayerRemoving.Connect(updatePlayers)
		);

		scope.Observer(props.controls.addGuy).onChange(() => {
			addPlayer(tostring(math.random(1,1000)));
		})
		addPlayer("john");
		addPlayer('bob');
		
		const v = <PlayerList Parent={props.target} scope={scope} Players={players}/>
	},
);

export = story;
