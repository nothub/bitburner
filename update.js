const url = "https://api.github.com/repos/nothub/bitburner/contents/scripts";

export async function main(ns) {
    let files = await (await download(url)).json()
    for (const file of files) {
        if (file.type === "file" && (file.name.endsWith(".script") || file.name.endsWith(".ns") || file.name.endsWith(".js"))) {
            ns.tprint("Downloading: " + file.name)
            await ns.kill(file.name, "home");
            await ns.rm(file.name)
            await ns.wget(file.download_url, file.name)
        } else {
            ns.tprint("Skipping: " + file.name + " (" + file.type + ")")
        }
    }
}

async function download(url) {
    let response = await fetch(url)
    if (!response.ok) {
        ns.tprint("Download error! Response status: " + response.status + " " + response.statusText);
        exit()
    }
    return response
}
