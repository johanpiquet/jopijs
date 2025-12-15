import {CodeGenWriter, ModuleDirProcessor} from "./engine.ts";
import * as jk_fs from "jopi-toolkit/jk_fs";
import * as jk_term from "jopi-toolkit/jk_term";

/**
 * Create the modules package.json file.
 * Add them to the main package.json workspace.
 */
export default class ModPackageJson extends ModuleDirProcessor {
    private allModules = new Set<string>();

    override async onBeginModuleProcessing(_writer: CodeGenWriter, moduleDir: string): Promise<void> {
        let packageJsonFile = jk_fs.join(moduleDir, "package.json");
        this.allModules.add(jk_fs.basename(moduleDir));

        if (!await jk_fs.isFile(packageJsonFile)) {
            const template = {
                dependencies: {},
                devDependencies: {}
            };

            await jk_fs.writeTextToFile(packageJsonFile, JSON.stringify(template, null, 4));
        }
    }

    override async generateCode(writer: CodeGenWriter): Promise<void> {
        if (this.allModules.size === 0) return;

        let pkgJsonFilePath = jk_fs.join(writer.dir.project, "package.json");
        let pkjJson = await jk_fs.readJsonFromFile<{workspaces: string[]}>(pkgJsonFilePath);

        let mustSave = false;
        let ws = pkjJson.workspaces;

        if (ws===undefined) {
            mustSave = true;
            pkjJson.workspaces = ws = [];
        }

        for (let modName of this.allModules) {
            const key = "src/" + modName;

            if (!ws.includes(key)) {
                mustSave = true;
                ws.push(key);
            }
        }

        if (mustSave) {
            await jk_fs.writeTextToFile(pkgJsonFilePath, JSON.stringify(pkjJson, null, 4));
            console.log(`${jk_term.textBgRed("\n!!!!!! Warning - Dependencies has been added !!!!!!")}\n!!!!!! You must run ${jk_term.textBlue("npm install")} to install them.`);
        }
    }
}