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

    await spawn_proc("augmentations.js", HOME)
    await spawn_proc("upgrade-hacknet.script", HOME)

    let servers_known = [HOME];

    let scanning = true
    while (scanning) {
        let countInitial = servers_known.length
        for (let server of servers_known) {
            await hack(server);
            servers_known = servers_known.concat(ns.scan(server)
                .filter(s => !servers_known.includes(s))
                .filter(s => !ns.getPurchasedServers().includes(s)))
        }
        if (countInitial === servers_known.length) {
            scanning = false
        }
    }

    let servers_pwned = servers_known
        .filter(s => s !== HOME)
        .filter(s => ns.hasRootAccess(s))

    //ns.tprint("total network (" + servers_known.length + ") : " + servers_known)
    //ns.tprint("pwned targets (" + servers_pwned.length + ") : " + servers_pwned)

    const spacers = servers_pwned.reduce((a, b) => a.length >= b.length ? a : b).length + 1

    function spacer(host) {
        let spacer = ""
        for (let i = 0; i < spacers - host.length; i++) {
            spacer = spacer + " "
        }
        return spacer
    }

    for (let server of servers_pwned) {
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

    // TODO: purchase servers

    for (let worker of ns.getPurchasedServers()) {
        ns.tprint("worker: " + worker)
        // TODO: link worker botnet
    }

    for (let server of HACK_MANUAL.filter(s => ns.hasRootAccess(s))) {
        ns.tprint("manual-hack: " + server)
        ns.connect(server)
        await ns.singularity.manualHack()
        ns.connect(HOME)
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
        ns.tprint("spawning process: " + script + " on " + server + " with " + threads + " threads")
        ns.kill(script, server)
        if (server !== HOME) await ns.scp(script, HOME, server);
        if (ns.exec(script, server, threads) === 0) {
            ns.tprint("ERROR: pid 0 " + script + " on " + server + " with " + threads + " threads")
        }
    }

}
