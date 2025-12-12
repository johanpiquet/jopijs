import {AliasType, CodeGenWriter, PriorityLevel, priorityNameToLevel} from "./engine.ts";
import * as jk_fs from "jopi-toolkit/jk_fs";

export default class TypeShadCN extends AliasType {
    extractPriority(priority: string, filePath: string): PriorityLevel {
        let priorityLevel = priorityNameToLevel(priority);

        if (priorityLevel===undefined) {
            throw this.declareError("Invalide priority level", filePath);
        }

        return priorityLevel;
    }

    createPriorityMap(dirItems: jk_fs.DirItem[]): Record<string, PriorityLevel> {
        const priorityMap: Record<string, PriorityLevel> = {};

        for (let dirItem of dirItems) {
            if (dirItem.name.endsWith(".priority")) {
                let name = dirItem.name.slice(0, -9);
                let idx = name.indexOf(".");

                let componentName = name.slice(0, idx);

                let priority = name.slice(idx + 1);
                priorityMap[componentName] = this.extractPriority(priority, dirItem.fullPath);
            }
        }

        return priorityMap;
    }

    async processDir(p: { moduleDir: string; typeDir: string; genDir: string; }): Promise<void> {
        //region shadUI

        let componentsUiDir = jk_fs.join(p.typeDir, "shadUI");

        if (await jk_fs.isDirectory(componentsUiDir)) {
            let dirItems = await jk_fs.listDir(componentsUiDir);
            const priorityMap = this.createPriorityMap(dirItems);

            for (let dirItem of dirItems) {
                if (dirItem.isFile && dirItem.name.endsWith(".tsx")) {
                    let name = dirItem.name.slice(0, -4);
                    let priority = priorityMap[name];

                    this.addLink({filePath: dirItem.fullPath, priority, name, group: "shadUI"});
                }
            }
        }

        //endregion

        //region shadHooks

        let hooksDir = jk_fs.join(p.typeDir, "shadHooks");

        if (await jk_fs.isDirectory(hooksDir)) {
            let dirItems = await jk_fs.listDir(hooksDir);
            const priorityMap = this.createPriorityMap(dirItems);

            for (let dirItem of dirItems) {
                if (dirItem.isFile) {
                    let name: string;

                    if (dirItem.name.endsWith(".ts")) {
                        name = dirItem.name.slice(0, -3);
                    } else if (dirItem.name.endsWith(".tsx")) {
                        name = dirItem.name.slice(0, -4);
                    } else {
                        continue;
                    }

                    let priority = priorityMap[name];
                    this.addLink({filePath: dirItem.fullPath, priority, name, group: "shadHooks"});
                }
            }
        }

        //endregion

        //region shadLib

        let libDir = jk_fs.join(p.typeDir, "shadLib");

        if (await jk_fs.isDirectory(libDir)) {
            let dirItems = await jk_fs.listDir(libDir);
            const priorityMap = this.createPriorityMap(dirItems);

            for (let dirItem of dirItems) {
                if (dirItem.isFile) {
                    let name: string;

                    if (dirItem.name.endsWith(".ts")) {
                        name = dirItem.name.slice(0, -3);
                    } else if (dirItem.name.endsWith(".tsx")) {
                        name = dirItem.name.slice(0, -4);
                    } else {
                        continue;
                    }

                    let priority = priorityMap[name];
                    this.addLink({filePath: dirItem.fullPath, priority, name, group: "shadLib"});
                }
            }
        }

        //endregion

        //region shadVariants

        let variantsRootDir = jk_fs.join(p.typeDir, "shadVariants");

        if (await jk_fs.isDirectory(variantsRootDir)) {
            let rootDirItems = await jk_fs.listDir(variantsRootDir);

            for (let rootDirItem of rootDirItems) {
                if (!rootDirItem.isDirectory) continue;
                if (rootDirItem.name.startsWith(".")) continue;
                if (rootDirItem.name.startsWith("_")) continue;

                let dirItems = await jk_fs.listDir(rootDirItem.fullPath);
                const priorityMap = this.createPriorityMap(dirItems);

                let groupName = jk_fs.join("shadVariants", rootDirItem.name);

                for (let dirItem of dirItems) {
                    if (dirItem.isFile && dirItem.name.endsWith(".tsx")) {
                        let name = dirItem.name.slice(0, -4);
                        let priority = priorityMap[name];

                        this.addLink({filePath: dirItem.fullPath, priority, name, group: groupName});
                    }
                }
            }
        }

        //endregion
    }

    private addLink(item: ItemToLink) {
        let group = this.registry[item.group];
        if (!group) this.registry[item.group] = group = {};

        if (item.priority===undefined) item.priority = 0;

        let current = group[item.name];
        if (current && (current.priority! > item.priority)) return;

        group[item.name] = item;

        console.log(`Adding ${item.group}/${item.name}`)
    }

    async beginGeneratingCode(writer: CodeGenWriter) {
        for (const groupName in this.registry) {
            const groupItems = this.registry[groupName];

            for (const itemName in groupItems) {
                const itemInfos = groupItems[itemName];
                await this.genItemCode(writer, itemInfos);
            }
        }
    }

    async genItemCode(writer: CodeGenWriter, item: ItemToLink) {
        let targetName = item.name;
        let outDir = jk_fs.join(writer.dir.output_src, item.group);
        let entryPoint = jk_fs.getRelativePath(outDir, item.filePath);

        let srcCode = writer.AI_INSTRUCTIONS + `export * from "${writer.toPathForImport(entryPoint, false)}";`;
        let distCode = writer.AI_INSTRUCTIONS + `export * from "${writer.toPathForImport(entryPoint, true)}";`;

        await writer.writeCodeFile({
            fileInnerPath: jk_fs.join(item.group, targetName),
            srcFileContent: srcCode,
            distFileContent: distCode
        });
    }

    private registry: Record<string, Record<string, ItemToLink>> = {};
}

interface ItemToLink {
    filePath: string;
    name: string;
    group: string;
    priority: PriorityLevel|undefined;
}