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
        let threads = Math.trunc(ns.getServerMaxRam(server) / (0.18 + 0.18 + 0.175))
        threads = Math.trunc(ns.getServerMaxRam(server) / 5.35) // TODO: fix thread calculation
        if (threads <= 0) continue
        await ns.scp(["self-grow.script", "self-hack.script", "self-weak.script"], "home", server);
        const process_id_grow = ns.exec("self-grow.script", server, threads)
        if (process_id_grow === 0) ns.tprint("failed starting self-grow.script on " + server)
        const process_id_hack = ns.exec("self-hack.script", server, threads)
        if (process_id_hack === 0) ns.tprint("failed starting self-hack.script on " + server)
        const process_id_weaken = ns.exec("self-weak.script", server, threads)
        if (process_id_weaken === 0) ns.tprint("failed starting self-weak.script on " + server)
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
