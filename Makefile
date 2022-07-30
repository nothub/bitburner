REQUIRED_BINS := curl npx tar
$(foreach bin,$(REQUIRED_BINS),\
    $(if $(shell command -v $(bin) 2> /dev/null),$(),$(error please install missing build requirement: `$(bin)`)))

NETSCRIPT_DEFS := NetscriptDefinitions.d.ts
NETSCRIPT_URL := https://raw.githubusercontent.com/danielyxie/bitburner/master/src/ScriptEditor/$(NETSCRIPT_DEFS)

# gopherjs needs this old distro
GO_DISTRO := go1.17.1
GO_DISTRO_TAR := $(GO_DISTRO).linux-amd64.tar.gz
GO_DISTRO_URL := https://dl.google.com/go/$(GO_DISTRO_TAR)
GO_DISTRO_ROOT := $(shell realpath $(GO_DISTRO)/)

transpile: export GOPHERJS_GOROOT = $(GO_DISTRO_ROOT)
transpile: $(NETSCRIPT_DEFS) $(GO_DISTRO_ROOT)
	@echo ${GOPHERJS_GOROOT}
	gopherjs build

eslint: $(NETSCRIPT_DEFS)
	npx eslint *.js scripts/*.js

govet:
	go vet

clean:
	-rm -rf $(NETSCRIPT_DEFS)
	-rm -rf $(GO_DISTRO_TAR)
	go clean
	go mod tidy

.PHONY: transpile eslint govet clean

$(NETSCRIPT_DEFS):
	curl --location --remote-name $(NETSCRIPT_URL)

$(GO_DISTRO_TAR):
	curl --location --remote-name $(GO_DISTRO_URL)

$(GO_DISTRO_ROOT)/: $(GO_DISTRO_TAR)
	tar --extract --file $(GO_DISTRO_TAR) --transform "s/go/$(GO_DISTRO)/"
