import Fusion from "../../src";
import { CreateFusionStory, InferFusionProps } from "@rbxts/ui-labs";

const controls = {};

// local RunService = game:GetService("RunService")

// local Fusion = -- initialise Fusion here however you please!
// local scoped = Fusion.scoped
// local Children = Fusion.Children
// type UsedAs<T> = Fusion.UsedAs<T>

// local SPIN_DEGREES_PER_SECOND = 180
// local SPIN_SIZE = 50

// local function Spinner(
//     scope: Fusion.Scope,
//     props: {
//         Layout: {
//             LayoutOrder: UsedAs<number>?,
//             Position: UsedAs<UDim2>?,
//             AnchorPoint: UsedAs<Vector2>?,
//             ZIndex: UsedAs<number>?
//         },
//         CurrentTime: UsedAs<number>,
//     }
// ): Fusion.Child
//     return scope:New "ImageLabel" {
//         Name = "Spinner",

//         LayoutOrder = props.Layout.LayoutOrder,
//         Position = props.Layout.Position,
//         AnchorPoint = props.Layout.AnchorPoint,
//         ZIndex = props.Layout.ZIndex,

//         Size = UDim2.fromOffset(SPIN_SIZE, SPIN_SIZE),

//         BackgroundTransparency = 1,
//         Image = "rbxassetid://your-loading-spinner-image", -- replace this!

//         Rotation = scope:Computed(function(use)
//             return (use(props.CurrentTime) * SPIN_DEGREES_PER_SECOND) % 360
//         end)
//     }
// end

// -- Don't forget to pass this to `doCleanup` if you disable the script.
// local scope = scoped(Fusion, {
//     Spinner = Spinner
// })

// local currentTime = scope:Value(os.clock())
// table.insert(scope,
//     RunService.RenderStepped:Connect(function()
//         currentTime:set(os.clock())
//     end)
// )

// local spinner = scope:Spinner {
//     Layout = {
//         Position = UDim2.fromScale(0.5, 0.5),
//         AnchorPoint = Vector2.new(0.5, 0.5),
//         Size = UDim2.fromOffset(50, 50)
//     },
//     CurrentTime = currentTime
// }

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
