export async function main(ns) {
    for (let faction of ns.getPlayer().factions) {
        let augs = ns.getAugmentationsFromFaction(faction)
            .filter(a => !ns.getOwnedAugmentations().includes(a))
            .filter(a => {
                for (let prereq of ns.getAugmentationPrereq(a)) {
                    if (!ns.getOwnedAugmentations().includes(prereq)) return false
                }
                return true
            })
        for (let aug of augs) {
            if (ns.getAugmentationPrice(aug) <= ns.getServerMoneyAvailable("home")) {
                ns.tprint("buying augmentation: " + aug + " from " + faction)
                ns.purchaseAugmentation(faction, aug)
            }
        }
    }
}
