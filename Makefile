NS_DEF := NetscriptDefinitions.d.ts
NS_URL := https://raw.githubusercontent.com/danielyxie/bitburner/master/src/ScriptEditor/$(NS_DEF)

REQUIRED_BINS := curl npx
$(foreach bin,$(REQUIRED_BINS),\
    $(if $(shell command -v $(bin) 2> /dev/null),$(),$(error Please install missing build requirement: `$(bin)`)))

lint: $(NS_DEF)
	npx eslint *.js scripts/*.js

$(NS_DEF):
	curl --location --output $(NS_DEF) $(NS_URL)

.PHONY: lint
