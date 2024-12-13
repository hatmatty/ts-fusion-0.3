# Fusion 0.3 JSX Typings  

Fork from @rbxts/hotfusion and @rbxts/fusion

Install this fork with your preferred package manager of choice:

```bash
# npm
npm i @rbxts/fusion-0.3-temp
```

## JSX

Configure the `jsx` option in your `tsconfig.json`:

```json
"compilerOptions": {
  "jsx": "react",
  "jsxFactory": "Fusion.jsx",
}
```

### Scopes

For limitations with JSX, you need to pass a scope as the `Scope` property for
all instances & components. 
For components, the scope should be defined as the 2nd argument since jsx interprets the 1st argument as the props (is there a workaround?)

```ts
declare function Counter(props: {
  number: UsedAs<number>
}, scope: Scope<typeof Hotfusion>): Child

<Counter scope={scope} number={1}>
```

### SpecialKeys

Given this code, how do we translate it into `JSX` syntax?

```lua
local OnHover: SpecialKey = {
  type = "SpecialKey",
  kind = "OnHover",
  stage = "observer",
  apply = function(scope, value, applyTo)
    -- do something with applyTo
  end
}
return scope:New "Frame" {
  [Children] = scope:New "TextLabel" {
    [OnHover] = true,
    [OnEvent "Activated"] = print()
  }
}
```

JSX disallows using objects as keys. Therefore, SpecialKeys cannot be specified
as property keys. For this, Hotfusion implements the `Uses` property allowing
you to use special keys.

Either pass in a tuple of `[SpecialKey, value]`, or an `Array<[SpecialKey,
value]>`:

```tsx
const OnHover: SpecialKey = {
  type: "SpecialKey",
  kind: "OnHover",
  stage: "observer",
  apply(scope, value, applyTo) {
    // do something with applyTo
  }
}
return (
  <frame>
    <textbutton Uses={[OnHover, true]} />
    <textbutton
      Uses={[
        [OnEvent("Activated"), () => print("clicked")],
        [OnHover, true],
      ]}
    />
  </frame>
)
```

Some built-in special keys can be specified directly:

- `OnEvent("eventName") = function` can be written as `OnEvent:eventName={() =>
  {}}`
- `OnChange("propertyName") = function` can be written as
  `OnChange:propertyName={() => {}}`
- `Out("propertyName") = setValue` can be written as `Out:propertyName={setValue}`

## Original README

<img align="left" src="./gh-assets/logo-dark-theme.svg#gh-dark-mode-only" alt="Fusion"><img align="left" src="./gh-assets/logo-light-theme.svg#gh-light-mode-only" alt="Fusion"><a href="https://elttob.uk/Fusion/latest"><img align="right" src="./gh-assets/link-docs.svg" alt="Docs"></a><a href="https://github.com/Elttob/Fusion/releases"><img align="right" src="./gh-assets/link-download.svg" alt="Download"></a><img src="./gh-assets/clearfloat.svg">

**Rediscover the joy of coding.**

Code is more dynamic, complex and intertwined than ever before. Errors cascade
out of control, things update in the wrong order, and it's all connected by
difficult, unreadable spaghetti.

No longer. Fusion introduces modern 'reactive' concepts for managing code, so
you can spend more time getting your logic right, and less time implementing
buggy boilerplate code connections.

Starting from simple roots, concepts neatly combine and build up with very little
learning curve. At every stage, you can robustly guarantee what your code will
do, and when you come back in six months, your code is easy to pick back up.

Piqued your interest? [Get going in minutes with our on-rails tutorial.](https://elttob.uk/Fusion/latest/tutorials)

## Issues & contributions

Have you read [our contribution guide](/CONTRIBUTING.md)? It's a real page turner!

We highly recommend reading it before opening an issue or pull request.

## License

Fusion is licensed freely under MIT. Go do cool stuff with it, and if you feel
like it, give us a shoutout!
