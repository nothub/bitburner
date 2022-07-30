const all_factions = [
    "Aevum",
    "Bachman & Associates",
    "BitRunners",
    "Blade Industries",
    "Bladeburners",
    "Chongqing",
    "Church of the Machine God",
    "Clarke Incorporated",
    "CyberSec",
    "Daedalus",
    "ECorp",
    "Four Sigma",
    "Fulcrum Secret Technologies",
    "Illuminati",
    "Ishima",
    "KuaiGong International",
    "MegaCorp",
    "NWO",
    "Netburners",
    "New Tokyo",
    "NiteSec",
    "OmniTek Incorporated",
    "Sector-12",
    "Shadows of Anarchy",
    "Silhouette",
    "Slum Snakes",
    "Speakers for the Dead",
    "Tetrads",
    "The Black Hand",
    "The Covenant",
    "The Dark Army",
    "The Syndicate",
    "Tian Di Hui",
    "Volhaven"
];

export async function main(ns) {
    all_factions.forEach(faction => {
        ns.tprint(faction)
        ns.getAugmentationsFromFaction(faction).forEach(augment => {
            if (!ns.getOwnedAugmentations().includes(augment)) {
                ns.tprint(" - " + augment)
            }
        })
    })
}
