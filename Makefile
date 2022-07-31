NS_DEF := ns.d.ts
NS_URL := https://raw.githubusercontent.com/danielyxie/bitburner/master/src/ScriptEditor/NetscriptDefinitions.d.ts

REQUIRED_BINS := curl npm npx
$(foreach bin,$(REQUIRED_BINS),\
    $(if $(shell command -v $(bin) 2> /dev/null),$(),\
    $(error Please install missing build requirement: `$(bin)`)))

lint: node-modules $(NS_DEF)
	npx eslint *.js scripts/*.js

node-modules:
	npm install

$(NS_DEF):
	curl --location --output $(NS_DEF) $(NS_URL)

.PHONY: lint node-modules
