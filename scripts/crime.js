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
        let crimes = crime_names.map(ns.getCrimeStats)
            .sort((a, b) => (b.money / b.time) * ns.getCrimeChance(b.name) - (a.money / a.time) * ns.getCrimeChance(a.name))
        if (crimes.length > 0) {
            const bestCrime = crimes[0].name
            await ns.sleep(ns.commitCrime(bestCrime))
        }
        await ns.sleep(1000)
    }
}
