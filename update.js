const url = "https://api.github.com/repos/nothub/bitburner/contents/scripts";

export async function main(ns) {

    let response = await fetch(url).catch(error => ns.tprint("Fetch Error: " + error))
    if (!response.ok) {
        ns.tprint("Response Status: " + response.status + " " + response.statusText);
        return;
    }

    let files = await response.json()
    files.forEach(file => {
        if (file.type === "file" && (file.name.endsWith(".script") || file.name.endsWith(".ns") || file.name.endsWith(".js"))) {
            ns.tprint(file.download_url)
            // TODO: kill local file, delete local file, download remote file
        } else {
            ns.tprint("Skipping: " + file.name + " (" + file.type + ")")
        }
    })

}
