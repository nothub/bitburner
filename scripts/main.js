export async function main(ns) {

    let servers_known = ["home"];

    let scanning = true
    while (scanning) {
        let countInitial = servers_known.length
        for (let server of servers_known) {
            hack(server);
            servers_known = servers_known.concat(ns.scan(server)
                .filter(s => !servers_known.includes(s))
                .filter(s => !ns.getPurchasedServers().includes(s)))
        }
        if (countInitial === servers_known.length) {
            scanning = false
        }
    }

    let servers_pwned = servers_known
        .filter(s => s !== "home")
        .filter(s => ns.hasRootAccess(s))

    //ns.tprint("total network (" + servers_known.length + ") : " + servers_known)
    //ns.tprint("pwned targets (" + servers_pwned.length + ") : " + servers_pwned)

    for (let server of servers_pwned) {
        ns.killall(server)
        let attack_memory = 0.18 + 0.18 + 0.175
        attack_memory = 5.35 // TODO: fix thread calculation
        const threads = Math.trunc(ns.getServerMaxRam(server) / attack_memory)
        if (threads <= 0) continue
        for (let script of ["self-grow.script", "self-hack.script", "self-weak.script"]) {
            await ns.scp(script, "home", server);
            if (ns.exec(script, server, threads) === 0) {
                ns.tprint("ERROR: pid 0 " + script + " on " + server + " @ " + threads + " threads")
            }
        }
        ns.tprint("utilized server: " + server + " (" + ns.getServerUsedRam(server) + "/" + ns.getServerMaxRam(server) + " GB @ " + threads + " threads)")
    }

    function hack(host) {
        let exploits = 0
        if (ns.fileExists("BruteSSH.exe", "home")) {
            ns.brutessh(host)
            exploits++
        }
        if (ns.fileExists("FTPCrack.exe", "home")) {
            ns.ftpcrack(host)
            exploits++
        }
        if (ns.fileExists("RelaySMTP.exe", "home")) {
            ns.relaysmtp(host)
            exploits++
        }
        if (ns.fileExists("HTTPWorm.exe", "home")) {
            ns.httpworm(host)
            exploits++
        }
        if (ns.fileExists("SQLInject.exe", "home")) {
            ns.sqlinject(host)
            exploits++
        }
        if (exploits >= ns.getServerNumPortsRequired(host)) {
            ns.nuke(host)
        }
    }

}
