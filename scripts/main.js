export async function main(ns) {

    let servers = ["home"];

    let scanning = true
    while (scanning) {
        let countInitial = servers.length
        for (let server of servers) {
            hack(server);
            servers = servers.concat(ns.scan(server)
                .filter(s => !servers.includes(s))
                .filter(s => !ns.getPurchasedServers().includes(s)))
        }
        if (countInitial === servers.length) {
            scanning = false
            ns.tprint("total network: " + servers.length + " -> " + servers)
            ns.tprint("pwned targets: " + servers.filter(s => ns.hasRootAccess(s)).length + " -> " + servers.filter(s => ns.hasRootAccess(s)))
        }
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
