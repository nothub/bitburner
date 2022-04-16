export async function main(ns) {
    ns.singularity.purchaseTor()
    for (let p of ["BruteSSH.exe", "FTPCrack.exe", "RelaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"]) {
        ns.singularity.purchaseProgram(p)
    }
}
