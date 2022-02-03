REQUIRED_BINS := curl npx
$(foreach bin,$(REQUIRED_BINS),\
    $(if $(shell command -v $(bin) 2> /dev/null),$(),$(error please install missing build requirement: `$(bin)`)))

.PHONY: all
all: clean defs lint

.PHONY: clean
clean:
	-rm -f "ns.d.ts"

.PHONY: defs
defs:
	curl --location "https://raw.githubusercontent.com/danielyxie/bitburner/dev/src/ScriptEditor/NetscriptDefinitions.d.ts" --output "ns.d.ts"

.PHONY: lint
lint:
	npx eslint *.js scripts/*.js
