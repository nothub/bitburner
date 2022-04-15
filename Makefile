REQUIRED_BINS := curl npx
$(foreach bin,$(REQUIRED_BINS),\
    $(if $(shell command -v $(bin) 2> /dev/null),$(),$(error please install missing build requirement: `$(bin)`)))

lint: ns.d.ts
	npx eslint *.js scripts/*.js

ns.d.ts:
	curl --location "https://raw.githubusercontent.com/danielyxie/bitburner/dev/src/ScriptEditor/NetscriptDefinitions.d.ts" --output "ns.d.ts"

.PHONY: lint
