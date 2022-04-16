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
        for (let a of augs) {
            if (ns.getAugmentationPrice(a) <= ns.getServerMoneyAvailable("home")) {
                ns.tprint("buying augmentation: " + a + " from " + faction)
                ns.purchaseAugmentation(faction, a)
            }
        }
    }
}
