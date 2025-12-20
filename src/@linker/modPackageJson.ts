import {CodeGenWriter, ModuleDirProcessor} from "./engine.ts";
import * as jk_fs from "jopi-toolkit/jk_fs";
import {JopiModuleInfo, updateWorkspaces} from "jopijs/modules";

/**
 * Create the modules package.json file.
 * Add them to the main package.json workspace.
 */
export default class ModPackageJson extends ModuleDirProcessor {
    private allModules = new Set<string>();

    override async onBeginModuleProcessing(_writer: CodeGenWriter, module: JopiModuleInfo): Promise<void> {
        this.allModules.add(jk_fs.basename(module.fullPath));
        await module.checkPackageInfo();
    }

    override async generateCode(writer: CodeGenWriter): Promise<void> {
        updateWorkspaces();
    }
}