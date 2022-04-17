const HOME = "home";

const HACK_MANUAL = ["CSEC", "avmnite-02h"]

const MOTD = `
.        .  .
|     o _|_ |
|.-.  .  |  |.-. .  . .--..--. .-. .--.
|   ) |  |  |   )|  | |   |  |(.-' |
'\`-'-' \`-\`-''\`-' \`--\`-'   '  \`-\`--''

`

export async function main(ns) {

    ns.tprint(MOTD)

    if (ns.fileExists("Formulas.exe", HOME)) {
        ns.tprint("formulas: " + Object.keys(ns.formulas))
    }
    ns.tprint("factions: " + ns.getPlayer().factions)

    ns.tprint("starting: tor.js")
    await spawn_proc("tor.js", HOME)
    await ns.sleep(1000)

    ns.tprint("starting: augmentations.js")
    await spawn_proc("augmentations.js", HOME)
    await ns.sleep(1000)

    let hacknet_production = 0
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        hacknet_production = hacknet_production + ns.hacknet.getNodeStats(i).production
    }
    if (hacknet_production < 100000) {
        ns.tprint("starting: upgrade-hacknet.script")
        await spawn_proc("upgrade-hacknet.script", HOME)
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
            await spawn_proc(script, server, threads)
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
        else ns.tprint("ERROR: failed buying worker: " + worker_name + " (" + mem + "GB)")
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
        // TODO: link worker slaves
    }

    for (let server of targets.filter(t => HACK_MANUAL.includes(t))) {
        ns.tprint("manual-hack: " + server)
        ns.connect(server)
        await ns.singularity.manualHack()
        ns.connect(HOME)
    }

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

    async function spawn_proc(script, server, threads = 1) {
        ns.kill(script, server)
        if (server !== HOME) await ns.scp(script, HOME, server);
        if (ns.exec(script, server, threads) === 0) {
            ns.tprint("ERROR: pid 0 " + script + " on " + server + " with " + threads + " threads")
        }
    }

}
