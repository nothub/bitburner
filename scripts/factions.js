const factions = ["Aevum", "Bachman & Associates", "BitRunners", "Blade Industries", "Bladeburners", "Chongqing", "Church of the Machine God", "Clarke Incorporated", "CyberSec", "Daedalus", "ECorp", "Four Sigma", "Fulcrum Secret Technologies", "Illuminati", "Ishima", "KuaiGong International", "MegaCorp", "NWO", "Netburners", "New Tokyo", "NiteSec", "OmniTek Incorporated", "Sector-12", "Shadows of Anarchy", "Silhouette", "Slum Snakes", "Speakers for the Dead", "Tetrads", "The Black Hand", "The Covenant", "The Dark Army", "The Syndicate", "Tian Di Hui", "Volhaven"];

export async function main(ns) {
    ns.tprint("Missing Augmentations:")
    for (const faction of factions) {
        for (const augment of ns.getAugmentationsFromFaction(faction)) {
            if (!ns.getOwnedAugmentations(true).includes(augment)) {
                ns.tprint(faction + " -> " + augment)
            }
        }
    }
}
