import fs from "node:fs/promises";
import path from "node:path";

const myPlugin = {
    name: "jopi-replace-text",

    setup(build) {
        build.onLoad({filter: /\.(tsx|ts|js|jsx)$/}, async ({path: p2}) => {
            const oldContent = await fs.readFile(p2, 'utf8');
            let newContent = oldContent.replaceAll("jBundler_ifServer", "jBundler_ifBrowser");
            const loader = path.extname(p2).toLowerCase().substring(1);
            return {contents: newContent, loader: loader};
        });

        // Note: this is not working since it's executed only once at the first start
        //       and not after each rebuild.

        /*build.onStart(async () => {
            //console.log("Jopi - Bun static compiler loader - beforeRebuild");
            //await timer(3000);
            //await compile(import.meta, getDefaultLinkerConfig());
        });*/
    }
}

export default myPlugin;