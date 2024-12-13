--!strict
--!nolint LocalUnused
--!nolint LocalShadow
local task = nil -- Disable usage of Roblox's task scheduler

--[[
	Constructs and returns a new instance, with options for setting properties,
	event handlers and other attributes on the instance right away. This
	function allows for using JSX markup and is designed to be used with
	roblox-ts.
]]

local Package = script.Parent.Parent
local Types = require(Package.Types)
local External = require(Package.External)
-- Instances
local Attribute = require(Package.Instances.Attribute)
local AttributeChange = require(Package.Instances.AttributeChange)
local AttributeOut = require(Package.Instances.AttributeOut)
local Children = require(Package.Instances.Children)
local OnChange = require(Package.Instances.OnChange)
local OnEvent = require(Package.Instances.OnEvent)
local Out = require(Package.Instances.Out)
local applyInstanceProps = require(Package.Instances.applyInstanceProps)
local defaultProps = require(Package.Instances.defaultProps)
local classNames = require(script.Parent.classNames)
-- Utility
local xtypeof = require(Package.Utility.xtypeof)

type Component = (scope: Types.Scope<unknown>, ...unknown) -> Instance
type MaybeSpecialKey = Types.SpecialKey | (string) -> Types.SpecialKey

local SPECIAL_KEYS: {[string]: MaybeSpecialKey} = {
	Attribute = Attribute,
	AttributeChange = AttributeChange,
	AttributeOut = AttributeOut,
	Children = Children,
	OnChange = OnChange,
	OnEvent = OnEvent,
	Out = Out,
}

local function jsx(
	component: string | Component,
	props: {[string]: unknown},
	...: Types.Child
): Instance
	local scope = props.scope :: Types.Scope<unknown>
	if scope == nil then
		External.logError("scopeMissing", nil, "instances using JSX-style New", `<textlabel scope=\{ myScope }/>`)
	end

	-- Handle adding children
	if (select("#", ...) > 0) then
		props = table.clone(props)

		local currentChildren = props[Children]

		local children
		if (typeof(currentChildren) == "table" and currentChildren.kind == nil and currentChildren.type == nil) then
			children = { table.unpack(props[Children]), ... }
		else 
			children = { ... }
		end

		props[Children] = children
	end

	if typeof(component) == "function" then
		return component(props, scope)
	end

	local className = classNames[component]
	local ok, instance = pcall(Instance.new, className)
	if not ok then
		External.logError("cannotCreateClass", nil, component)
	end

	local appliedProps: Types.PropertyTable = defaultProps[className] or {}
	for name, value in pairs(props) do
		if (name == "scope" or name == "Uses") then
			continue
		end

		if SPECIAL_KEYS[name] then
			local impl = SPECIAL_KEYS[name] :: Types.SpecialKey
			if typeof(impl) == "function" then
				External.logError("missingSpecialKeyValue", nil, name, name)
			end
			appliedProps[impl] = value
			continue
		end

		if (name == Children) then
			appliedProps[name] = props[name]
			continue	
		end

		if typeof(name) ~= "string" then
			return External.logError("unrecognisedPropertyKey", nil, xtypeof(name))
		end
		
		local seperator = string.find(name, ":")
		if seperator then
			local implName = string.sub(name, 1, seperator - 1)
			local impl = SPECIAL_KEYS[implName] :: (unknown) -> Types.SpecialKey
			if impl then
				appliedProps[impl(string.sub(name, seperator + 1))] = value
				continue
			end
		end

		appliedProps[name] = value
	end

	if props.Uses then
		local uses = props.Uses :: {}
		if #uses == 2 and typeof(uses[1]) == "table" and uses[1].type == "SpecialKey" then
			local specialKey, value = uses[1], uses[2]
			appliedProps[specialKey] = value
		else
			for _, pair in pairs(uses) do
				local specialKey, value = pair[1], pair[2]
				appliedProps[specialKey] = value
			end
		end
	end

	table.insert(scope, instance)
	applyInstanceProps(scope, appliedProps, instance)

	return instance
end

return jsx