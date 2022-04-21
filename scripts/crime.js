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

function smoothCriminal(ns) {
    let crimes = crime_names.map(ns.getCrimeStats)
        .sort((a, b) => (b.money / b.time) * ns.getCrimeChance(b.name) - (a.money / a.time) * ns.getCrimeChance(a.name))
    if (crimes.length > 0) {
        const bestCrime = crimes[0].name;
        ns.commitCrime(bestCrime)
    }
}

export async function main(ns) {
    /* eslint-disable-next-line no-constant-condition */
    while (true) {
        if (!ns.isBusy()) smoothCriminal(ns);
        await ns.sleep(1000)
    }
}
