export async function main(ns) {
    for (let faction of ns.getPlayer().factions) {
        let augs = ns.singularity.getAugmentationsFromFaction(faction)
            .filter(a => !ns.singularity.getOwnedAugmentations().includes(a))
            .filter(a => {
                for (let prereq of ns.singularity.getAugmentationPrereq(a)) {
                    if (!ns.singularity.getOwnedAugmentations().includes(prereq)) return false
                }
                return true
            })
        for (let aug of augs) {
            if (ns.singularity.getAugmentationPrice(aug) <= ns.getServerMoneyAvailable("home")) {
                ns.tprint("buying augmentation: " + aug + " from " + faction)
                ns.singularity.purchaseAugmentation(faction, aug)
            }
        }
    }
}
