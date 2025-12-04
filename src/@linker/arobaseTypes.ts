import * as jk_fs from "jopi-toolkit/jk_fs";
import * as jk_tools from "jopi-toolkit/jk_tools";
import * as jk_events from "jopi-toolkit/jk_events";

import {
    type ProcessDirItemParams,
    getSortedDirItem,
    type TransformItemParams,
    PriorityLevel,
    type RegistryItem,
    ArobaseType,
    CodeGenWriter
} from "./engine.ts";

// region ArobaseList

export interface ArobaseList extends RegistryItem {
    listName: string;
    allDirPath: string[];
    items: ArobaseListItem[];
    itemsType: string;
    conditions?: Set<string>;
}

export interface ArobaseListItem {
    ref?: string;
    entryPoint?: string;
    priority: PriorityLevel;
    sortKey: string;
}

export class Type_ArobaseList extends ArobaseType {
    protected async onListItem(item: ArobaseListItem, list: ArobaseListItem[], _dirPath: string): Promise<void> {
        list.push(item);
    }

    protected mergeIntoList(list: ArobaseList, items: ArobaseListItem[]) {
        let currentItems = list.items;
        currentItems.push(...items);
        currentItems.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    }

    processDir(p: { moduleDir: string; arobaseDir: string; genDir: string; }) {
        return this.processList(p.arobaseDir);
    }

    protected async processList(listDirPath: string): Promise<void> {
        await this.dir_recurseOnDir({
            dirToScan: listDirPath,
            expectFsType: "dir",

            rules: {
                nameConstraint: "canBeUid",
                requireRefFile: false,
                requirePriority: false,
                allowConditions: false,
                rootDirName: jk_fs.basename(listDirPath),
                transform: (p) => this.processGroup(p)
            }
        });
    }

    protected async processGroup(p: TransformItemParams) {
        let listId = this.typeName + "!" + p.itemName!;
        const listName = p.itemName;

        // > Extract the list items.

        const dirItems = await getSortedDirItem(p.itemPath);
        let listItems: ArobaseListItem[] = [];

        const params: ProcessDirItemParams = {
            rootDirName: p.parentDirName,
            nameConstraint: "canBeUid",
            requirePriority: false,
            requireRefFile: false,
            allowConditions: false,

            filesToResolve: {
                "entryPoint": ["index.tsx", "index.ts"]
            },

            transform: async (item) => {
                const listItem: ArobaseListItem = {
                    priority: item.priority,
                    sortKey: item.itemName,
                    ref: item.refTarget,
                    entryPoint: item.resolved.entryPoint
                };

                const eventData = {itemPath: item.itemPath, item: listItem, list: listItems, mustSkip: false};
                await jk_events.sendAsyncEvent("@jopi.linker.onNewListItem." + this.typeName, eventData);
                if (!eventData.mustSkip) await this.onListItem(listItem, listItems, item.itemPath);
            }
        };

        for (let dirItem of dirItems) {
            if (!dirItem.isDirectory) continue;

            if (dirItem.name === "_") {
                let uid = jk_tools.generateUUIDv4();
                let newPath = jk_fs.join(jk_fs.dirname(dirItem.fullPath), uid);
                await jk_fs.rename(dirItem.fullPath, newPath);

                dirItem.name = uid;
                dirItem.fullPath = newPath;
            }

            if ((dirItem.name[0] === "_") || (dirItem.name[0] === ".")) continue;

            await this.dir_processItem(dirItem, params);
        }

        // > Add the list.

        let current = this.registry_getItem<ArobaseList>(listId, this);

        if (!current) {
            const newItem: ArobaseList = {
                listName, conditions: p.conditions,
                arobaseType: this, itemPath: p.itemPath,
                items: listItems, itemsType: p.parentDirName, allDirPath: [p.itemPath]
            };

            this.registry_addItem(listId, newItem);
        } else {
            if (current.itemsType !== p.parentDirName) {
                throw this.declareError(`The list ${listId} is already defined and has a different type: ${current.itemsType}`, p.itemPath);
            }

            // Merge the items into the current one.
            this.mergeIntoList(current, listItems);

            // The list of event declaration locations.
            current.allDirPath.push(p.itemPath);
        }
    }

    protected getGenOutputDir(_list: ArobaseList) {
        return this.typeName;
    }

    protected resolveEntryPointFor(list: ArobaseList, item: ArobaseListItem): string {
        let entryPoint = item.entryPoint!;

        if (!entryPoint) {
            let d = this.registry_requireItem<ArobaseChunk>(item.ref!);
            if (d.itemType!==list.itemsType) {
                throw this.declareError(`Type mismatch. Expect ${list.itemsType}`, d.itemPath)
            }

            if (!d.entryPoint) {
                throw this.declareError(`Item if missing index.ts/index.tsx file`, d.itemPath)
            }

            entryPoint = d.entryPoint;
        }

        return entryPoint;
    }

    async generateCodeForItem(writer: CodeGenWriter, key: string, rItem: RegistryItem) {
        function sortByPriority(items: ArobaseListItem[]): ArobaseListItem[] {
            function addPriority(priority: PriorityLevel) {
                let e = byPriority[priority];
                if (e) items.push(...e);
            }

            const byPriority: any = {};

            for (let item of items) {
                if (!byPriority[item.priority]) byPriority[item.priority] = [];
                byPriority[item.priority].push(item);
            }

            items = [];

            addPriority(PriorityLevel.veryHigh);
            addPriority(PriorityLevel.high);
            addPriority(PriorityLevel.default);
            addPriority(PriorityLevel.low);
            addPriority(PriorityLevel.veryLow);

            return items;
        }

        const list = rItem as ArobaseList;
        list.items = sortByPriority(list.items);

        await this.generateCodeForList(writer, key, list);
    }

    protected async generateCodeForList(writer: CodeGenWriter, key: string, list: ArobaseList): Promise<void> {
        let count = 1;
        let outDir_innerPath = this.getGenOutputDir(list);
        let outDir_fullPath = jk_fs.join(writer.dir.output_src, outDir_innerPath);

        let srcCode = writer.AI_INSTRUCTIONS + this.codeGen_generateImports();
        let distCode = srcCode;

        for (let item of list.items) {
            let entryPoint = this.resolveEntryPointFor(list, item);
            let relPath = jk_fs.getRelativePath(outDir_fullPath, entryPoint);

            srcCode += `import I${count} from "${relPath}";\n`;
            distCode += `import I${count} from "${writer.toJavascriptPathForImport(relPath)}";\n`;

            count++;
        }

        let array = "";
        let max = list.items.length;
        for (let i = 1; i <= max; i++) array += `I${i},`;

        let toAdd = "\n" + this.codeGen_generateExports("[" + array + "]", list.listName);
        srcCode += toAdd;
        distCode += toAdd;

        let fileName = key.substring(key.indexOf("!") + 1);

        await writer.writeCodeFile({
            fileInnerPath: jk_fs.join(outDir_innerPath, fileName),
            declarationFile: this.codeGen_createDeclarationTypes(),
            srcFileContent: srcCode,
            distFileContent: distCode,
            useTypescriptForSource: true
        });
    }

    protected codeGen_generateImports() {
        return "";
    }

    protected codeGen_generateExports(listAsArray: string, listName: string) {
        return "export default " + listAsArray + ";";
    }

    /**
     * Allow creating content for the .d.ts file.
     * @protected
     */
    protected codeGen_createDeclarationTypes() {
        return `const list: any[]; export default list;`
    }
}

//endregion

//region ArobaseChunk

export interface ArobaseChunk extends RegistryItem {
    entryPoint: string;
    itemType: string;
}

export class Type_ArobaseChunk extends ArobaseType {
    async onChunk(chunk: ArobaseChunk, key: string, _dirPath: string) {
        this.registry_addItem(key, chunk);
    }

    async processDir(p: { moduleDir: string; arobaseDir: string; genDir: string; }) {
        await this.dir_recurseOnDir({
            dirToScan: p.arobaseDir,
            expectFsType: "dir",

            rules: {
                rootDirName: jk_fs.basename(p.arobaseDir),
                nameConstraint: "canBeUid",
                requireRefFile: false,
                requirePriority: true,

                filesToResolve: {
                    "info": ["info.json"],
                    "entryPoint": ["index.tsx", "index.ts"]
                },

                transform: async (props) => {
                    if (!props.resolved?.entryPoint) {
                        throw this.declareError("No 'index.ts' or 'index.tsx' file found", props.itemPath);
                    }

                    const chunk: ArobaseChunk = {
                        arobaseType: this,
                        entryPoint: props.resolved.entryPoint,
                        itemType: props.parentDirName,
                        itemPath: props.itemPath,
                        priority: props.priority
                    };

                    const key = this.typeName + "!" + props.itemName;
                    const eventData = {mustSkip: false, key, chunk, itemPath: props.itemPath};
                    await jk_events.sendAsyncEvent("@jopi.linker.onNewChunk." + this.typeName, eventData);

                    if (!eventData.mustSkip) {
                        await this.onChunk(chunk, key, props.itemPath);
                    }
                }
            }
        });
    }

    async generateCodeForItem(writer: CodeGenWriter, key: string, rItem: RegistryItem) {
        const item = rItem as ArobaseChunk;

        let targetName = key.substring(key.indexOf("!") + 1);
        let outDir = jk_fs.join(writer.dir.output_src, this.getGenOutputDir(item));
        let entryPoint = jk_fs.getRelativePath(outDir, item.entryPoint);

        let srcCode = writer.AI_INSTRUCTIONS + `import C from "${entryPoint}";\nexport default C;`;
        let distCode = writer.AI_INSTRUCTIONS + `import C from "${writer.toJavascriptPathForImport(entryPoint)}";\nexport default C;`;

        await writer.writeCodeFile({
            fileInnerPath: jk_fs.join(this.getGenOutputDir(item), targetName),
            srcFileContent: srcCode,
            distFileContent: distCode,
            useTypescriptForSource: true
        });
    }

    protected getGenOutputDir(_chunk: ArobaseChunk) {
        return this.typeName;
    }
}

//endregion