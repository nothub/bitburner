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

    await spawn_proc("tor.js", HOME)
    await spawn_proc("augmentations.js", HOME)
    await spawn_proc("upgrade-hacknet.script", HOME)

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

    // TODO: purchase workers
    let mem = worker_memory_range()
        .filter(m => ns.getServerMoneyAvailable("home") >= m * 55000)
        .reduce((a, b) => a >= b ? a : b)
    // TODO: price wrong?
    const worker_name = ns.purchaseServer("worker", mem)
    ns.tprint("bought worker: " + worker_name + " (" + mem + "GB)")

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
