const crime_names = [
    "Assassination",
    "Bond Forgery",
    "Deal Drugs",
    "Grand Theft Auto",
    "Heist",
    "Homicide",
    "Kidnap",
    "Larceny",
    "Mug",
    "Rob Store",
    "Shoplift",
    "Traffick Arms",
]

function smoothCriminal(ns) {
    let crimes = crime_names.map(ns.getCrimeStats)
        .sort((a, b) => (b.money / b.time) * ns.getCrimeChance(b.name) - (a.money / a.time) * ns.getCrimeChance(a.name))
    if (crimes.length > 0) ns.commitCrime(crimes[0].name)
}

export async function main(ns) {
    while (true) {
        if (ns.getPlayer().isBusy) continue
        smoothCriminal(ns);
        await ns.sleep(1000)
    }
}
