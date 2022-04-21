const HOME = "home";

const HACK_MANUAL = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"]

const MOTD = `
▄▄▄▄· ▪  ▄▄▄▄▄▄▄▄▄·             • ▌ ▄ ·. ▄▄▄ .▄▄▄
▐█ ▀█▪██ •██  ▐█ ▀█▪▪  .  ▪   . ·██ ▐███▪▀▄.▀·▀▄ █·
▐█▀▀█▄▐█· ▐█.▪▐█▀▀█▄ ▄█▀▄  ▄█▀▄ ▐█ ▌▐▌▐█·▐▀▀▪▄▐▀▀▄
██▄▪▐█▐█▌ ▐█▌·██▄▪▐█▐█▌ ▐▌▐█▌.▐▌██ ██▌▐█▌▐█▄▄▌▐█•█▌
·▀▀▀▀ ▀▀▀ ▀▀▀ ·▀▀▀▀  ▀█▄▀▪ ▀█▄▀▪▀▀  █▪▀▀▀ ▀▀▀ .▀  ▀
`

export async function main(ns) {

    ns.tprint(MOTD)

    if (ns.fileExists("Formulas.exe", HOME)) {
        ns.tprint("formulas: " + Object.keys(ns.formulas))
    }
    ns.tprint("factions: " + ns.getPlayer().factions)

    ns.tprint("karma: " + ns.heart.break().toFixed(2))

    ns.tprint("starting: tor.js")
    await spawn_proc("tor.js", HOME, true)

    ns.tprint("starting: augmentations.js")
    await spawn_proc("augmentations.js", HOME, true)

    // eslint-disable-next-line no-undef
    let hacknet_production = _.range(0, ns.hacknet.numNodes())
        .map(i => ns.hacknet.getNodeStats(i).production)
        .reduce((a, b) => a + b, 0)
    ns.tprint("hacknet production: " + hacknet_production.toFixed(2) + "$ / sec")
    if (hacknet_production < 100000) {
        ns.tprint("starting: upgrade-hacknet.script")
        await spawn_proc("upgrade-hacknet.script", HOME, false)
    }

    const network = await scan()
    const targets = network
        .filter(s => s !== HOME)
        .filter(s => !ns.getPurchasedServers().includes(s))
        .filter(s => ns.hasRootAccess(s))
        .filter(s => ns.getServerRequiredHackingLevel(s) <= ns.getPlayer().hacking)

    ns.tprint("known network (" + network.length + "): " + network)
    ns.tprint("pwned targets (" + targets.length + "): " + targets)

    function spacer(host) {
        const spacers = targets.reduce((a, b) => a.length >= b.length ? a : b).length + 1
        let spacer = ""
        for (let i = 0; i < spacers - host.length; i++) {
            spacer = spacer + " "
        }
        return spacer
    }

    for (let server of targets) {
        ns.killall(server)
        let attack_memory = 0.18 + 0.18 + 0.175
        attack_memory = 5.35 // TODO: fix thread calculation
        const threads = Math.trunc(ns.getServerMaxRam(server) / attack_memory)
        if (threads <= 0) continue
        for (let script of ["self-grow.script", "self-hack.script", "self-weak.script"]) {
            await spawn_proc(script, server, false, threads)
        }
        ns.tprint("self-pwn: " + server + spacer(server) + ns.getServerUsedRam(server) + "/" + ns.getServerMaxRam(server) + " GB with " + threads + " threads")
    }

    function worker_memory_range() {
        let range = []
        let current = 2
        while (current <= 1048576) {
            range.push(current)
            current = current * 2
        }
        return range
    }

    function buy_worker(memory_minimum) {
        let memory_range = worker_memory_range()
            .filter(m => m >= memory_minimum)
            .filter(m => ns.getServerMoneyAvailable(HOME) >= m * 55000);
        if (memory_range.length <= 0) {
            ns.tprint("insufficient funds for new worker!")
            return
        }
        let mem = memory_range.reduce((a, b) => a >= b ? a : b)
        const worker_name = ns.purchaseServer("worker", mem)
        if (worker_name.length > 0) ns.tprint("bought worker: " + worker_name + " (" + mem + "GB)")
        else ns.tprint("ERROR: failed buying worker: " + mem + "GB")
    }

    // workers
    if (ns.getPurchasedServers().length > 0) {
        let best_worker = ns.getPurchasedServers().reduce((a, b) => ns.getServerMaxRam(a) >= ns.getServerMaxRam(b) ? a : b)
        const worst_worker = ns.getPurchasedServers().reduce((a, b) => ns.getServerMaxRam(a) < ns.getServerMaxRam(b) ? a : b)
        ns.tprint("workers: " + ns.getPurchasedServers().length + "/" + ns.getPurchasedServerLimit() + " min=" + ns.getServerMaxRam(worst_worker) + "GB max=" + ns.getServerMaxRam(best_worker) + "GB")
        // if workers full
        if (ns.getPurchasedServers().length >= ns.getPurchasedServerLimit()) {
            if (ns.getServerMaxRam(best_worker) > ns.getServerMaxRam(worst_worker)) {
                ns.tprint("deleting worker: " + worst_worker + " (" + ns.getServerMaxRam(worst_worker) + "GB)")
                ns.deleteServer(worst_worker)
            }
        }
        if (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
            buy_worker(ns.getServerMaxRam(best_worker));
        }
    } else {
        buy_worker(2);
    }
    for (let worker of ns.getPurchasedServers()) {
        ns.tprint("worker: " + worker + " (" + ns.getServerMaxRam(worker) + "GB)")
        // TODO: link worker slaves (see botnet-linker.script)
    }

    for (let server of targets.filter(t => HACK_MANUAL.includes(t))) {
        ns.tprint("manual-hack: " + server)
        ns.connect(server)
        await ns.singularity.installBackdoor()
        await ns.singularity.manualHack()
        ns.connect(HOME)
    }

    // http to outside world
    //await httpbin();

    async function scan() {
        let network = [HOME];
        let scanned = []
        let scanning = true
        while (scanning) {
            let countInitial = network.length
            for (let server of network) {
                if (scanned.includes(server)) continue
                await hack(server);
                network = network.concat(ns.scan(server).filter(s => !network.includes(s)))
                scanned.push(server)
            }
            if (countInitial === network.length) {
                scanning = false
            }
        }
        return network;
    }

    function hack(host) {
        let exploits = 0
        if (ns.fileExists("BruteSSH.exe", HOME)) {
            ns.brutessh(host)
            exploits++
        }
        if (ns.fileExists("FTPCrack.exe", HOME)) {
            ns.ftpcrack(host)
            exploits++
        }
        if (ns.fileExists("RelaySMTP.exe", HOME)) {
            ns.relaysmtp(host)
            exploits++
        }
        if (ns.fileExists("HTTPWorm.exe", HOME)) {
            ns.httpworm(host)
            exploits++
        }
        if (ns.fileExists("SQLInject.exe", HOME)) {
            ns.sqlinject(host)
            exploits++
        }
        if (exploits >= ns.getServerNumPortsRequired(host)) {
            ns.nuke(host)
        }
    }

    async function spawn_proc(script, server, blocking, threads = 1) {
        ns.kill(script, server)
        if (server !== HOME) await ns.scp(script, HOME, server);
        const pid = ns.exec(script, server, threads)
        if (pid === 0) {
            ns.tprint("ERROR: pid 0 " + script + " on " + server + " with " + threads + " threads")
            return
        }
        if (blocking) {
            ns.tprint("blocking: waiting for " + script + " on " + server)
            const timestamp_pre = Date.now();
            while (ns.ps(server).map(p => p.pid).filter(p => p === pid).length > 0) {
                await ns.sleep(1)
            }
            ns.tprint("blocking: " + script + " on " + server + " took " + (Date.now() - timestamp_pre) + "ms")
        }
    }

    async function httpbin() {
        for (let host of network) {
            const server = ns.getServer(host)
            let infos = {
                hostname: server.hostname,

                home: server.hostname === HOME,
                worker: ns.getPurchasedServers().includes(server.hostname),

                ip: server.ip,
                organization: server.organizationName,

                requiredHackingLevel: server.requiredHackingSkill,
                rootAccess: server.hasAdminRights,
                backdoorInstalled: server.backdoorInstalled,

                portsOpen: server.openPortCount,
                portsRequired: server.numOpenPortsRequired,

                portOpenFtp: server.ftpPortOpen,
                portOpenHttp: server.httpPortOpen,
                portOpenSmtp: server.smtpPortOpen,
                portOpenSql: server.sqlPortOpen,
                portOpenSsh: server.sshPortOpen,

                cores: server.cpuCores,

                ramUsed: server.ramUsed,
                ramMax: server.maxRam,

                money: server.moneyAvailable,
                moneyMax: server.moneyMax,

                growthFactor: server.serverGrowth,

                securityLevel: server.hackDifficulty,
                securityLevelMin: server.minDifficulty,
            };

            await fetch("https://httpbin.org/anything", {
                method: "post",
                headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
                body: JSON.stringify(infos)
            })
                .then(res => res.json())
                .then((json) => ns.tprint(json))
                .catch(err => ns.tprint(err))

            break
        }
    }

}
