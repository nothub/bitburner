const crime_names = [
    "Shoplift",
    "Rob Store",
    "Mug",
    "Larceny",
    "Deal Drugs",
    "Bond Forgery",
    "Traffick Arms",
    "Homicide",
    "Grand Theft Auto",
    "Kidnap",
    "Assassination",
    "Heist",
]

export async function main(ns) {
    /* eslint-disable-next-line no-constant-condition */
    while (true) {
        let crimes = crime_names.map(ns.singularity.getCrimeStats)
            .sort((a, b) => (b.money / b.time) * ns.singularity.getCrimeChance(b.name) - (a.money / a.time) * ns.singularity.getCrimeChance(a.name))
        if (crimes.length > 0) {
            const bestCrime = crimes[0].name
            await ns.sleep(ns.singularity.commitCrime(bestCrime))
        }
        await ns.sleep(1000)
    }
}
