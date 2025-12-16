import * as jk_fs from "jopi-toolkit/jk_fs";
import {AliasType, CodeGenWriter, PriorityLevel} from "./engine.ts";

interface TranslationItem {
    group: string;
    defaultLang: string;
    langFiles: Record<string, Record<string, string>>;
    priority: PriorityLevel;
}

export class TypeTranslation extends AliasType {
    private registry: Record<string, TranslationItem> = {};

    //region Scanning

    async processDir(p: { moduleDir: string; typeDir: string; genDir: string; }) {
        const allTrDir = await jk_fs.listDir(p.typeDir);

        for (const trDir of allTrDir) {
            if (!trDir.isDirectory) continue;
            if (trDir.name[0]===".") continue;
            if (trDir.name[0]==="_") continue;

            await this.processTranslationDir(trDir);
        }
    }


    private async processTranslationDir(trDir: jk_fs.DirItem) {
        let infos = await this.dir_extractInfos(trDir.fullPath, {
            requirePriority: true,
            allowConditions: false,
            allowFeatures: false
        });

        let priority = infos.priority;

        if (!priority) {
            priority = PriorityLevel.default;
            await jk_fs.writeTextToFile(jk_fs.join(trDir.fullPath, "default.priority"), "default.priority");
        }

        let defaultLang = "en-us";

        let dirItems =  await jk_fs.listDir(trDir.fullPath);
        dirItems = dirItems.filter(item => item.isFile);

        let langFiles: Record<string, Record<string, string>> = {};

        for (let dirItem of dirItems) {
            if (dirItem.name.endsWith(".default")) {
                defaultLang = dirItem.name.slice(0, -".default".length).toLowerCase();
            } else if (dirItem.name.endsWith(".json")) {
                let lang = dirItem.name.slice(0, -".json".length);
                //langFiles[lang.toLowerCase()] = await jk_fs.readJsonFromFile(dirItem.fullPath);

                let json = await this.importLangFile(dirItem.fullPath);
                if (json) langFiles[lang.toLowerCase()] = json;
            }
        }

        this.register({
            group: trDir.name,
            priority, defaultLang, langFiles
        });
    }

    private getTranslationFileShortName(filePath: string): string {
        let parts = jk_fs.pathToFileURL(filePath).pathname.split("/");
        let lang = parts.pop();
        let group = parts.pop();
        parts.pop(); // dir: translations.
        parts.pop(); // dir: @alias.
        let mod = parts.pop();

        return `${mod}/${group}/${lang}`;
    }

    private printError(message: string) {
        console.log(`⚠️ ${message}`);
    }

    private isValidTypeScriptIdentifier(key: string): boolean {
        return /^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/.test(key);
    }

    private async importLangFile(filePath: string): Promise<Record<string, string> | undefined> {
        let json = await jk_fs.readJsonFromFile(filePath);

        if (!json) {
            let trFileKey = this.getTranslationFileShortName(filePath);
            this.printError(`Can't read translation file ${trFileKey}`);
            return undefined;
        }

        let res: Record<string, string> = {};

        for (let key in json) {
            let isPlural = key[0]==="*";
            if (isPlural) key = key.substring(1);

            if (!this.isValidTypeScriptIdentifier(key)) {
                let trFileKey = this.getTranslationFileShortName(filePath);
                this.printError(`Translation file ${trFileKey}, key "${key}" is not a valid identifier`);
                continue;
            }

            let value = json[key];

            if (typeof (value) !== "string") {
                let trFileKey = this.getTranslationFileShortName(filePath);
                this.printError(`Translation file ${trFileKey}, key "${key}" has an incorrect value`);
                continue;
            }

            res[key] = value;
        }

        return res;
    }

    private register(tr: TranslationItem) {
        let current = this.registry[tr.group];

        if (!current) {
            this.registry[tr.group] = tr;
            return;
        }

        let master = current;
        let aux = tr;
        //
        if (master.priority<aux.priority) {
            let tmp = aux;
            aux = master;
            master = tmp;
        }

        this.registry[tr.group] = master;

        if (master.defaultLang===undefined) {
            master.defaultLang = aux.defaultLang;
        }

        for (let lang in aux.langFiles) {
            const masterTr = master.langFiles[lang];
            const auxTr = aux.langFiles[lang];

            if (!masterTr) {
                master.langFiles[lang] = auxTr;
                continue;
            }

            if (auxTr) {
                for (let key in auxTr) {
                    if (!masterTr[key]) {
                        masterTr[key] = auxTr[key];
                    }
                }
            }
        }
    }

    //endregion

    async beginGeneratingCode(writer: CodeGenWriter): Promise<void> {
        for (let trGroupName in this.registry) {
            let trGroup = this.registry[trGroupName];
            let dirName = jk_fs.join("translations", trGroupName);

            for (let lang in trGroup.langFiles) {
                const def = trGroup.langFiles[lang];
                const src = this.generateCodeFor(lang, def);

                await writer.writeCodeFile({
                    fileInnerPath: jk_fs.join(dirName, lang),
                    srcFileContent: src,
                    distFileContent: src,
                });
            }

            await writer.writeCodeFile({
                fileInnerPath: jk_fs.join(dirName, "default"),
                srcFileContent: `import D from "./${trGroup.defaultLang}.ts";\nexport default D;`,
                distFileContent:`import D from "./${trGroup.defaultLang}.js";\nexport default D;`,
            });
        }
    }

    private generateCodeFor(lang: string, def: Record<string, string>): string {
        //region Group the single and the plural

        let trSinglePlural: Record<string, TrSinglePlural> = {};

        for (let key in def) {
            let value = def[key];
            let parsed = this.parseValue(value);
            let isPlural = false;

            if (key[0]==="*") {
                isPlural = true;
                key = key.substring(1);
            }

            let current = trSinglePlural[key];

            if (!current) {
                current = {hasData: parsed.hasData};
                trSinglePlural[key] = current;
            }

            if (isPlural) {
                current.plural = parsed;
            } else {
                current.single = parsed;
            }
        }

        //endregion

        //region Generates the code

        let header = "";

        let body = `export const lang = "${lang}";`;
        body += `\n\nexport default {`

        for (let key in trSinglePlural) {
            let value = trSinglePlural[key];

            if (value.plural && !value.single) {
                value.single = value.plural;
            }

            if (value.hasData) {
                const dataFunction = this.generateSourceHeaderInfos(value);

                header += dataFunction.paramsDefInterface + "\n\n";
                header += dataFunction.pluralFunction;
                header += dataFunction.singleFunction;

                if (value.plural) {
                    body += `\n    ${key}_plural(count: number, data: ${dataFunction.paramsTypeName}) {
        if (count>1) return ${dataFunction.nameFctPlural}(data);
        else return ${dataFunction.nameFctSingle}(data);
},`
                } else {
                    body += `\n    ${key}(data: ${dataFunction.paramsTypeName}) { return ${dataFunction.nameFctSingle}(data); },`
                }
            } else {
                if (value.plural) {
                    body += `\n    ${key}_plural(count: number) {
        if (count>1) return ${JSON.stringify(value.plural.value)}
        else return ${JSON.stringify(value.single!.value)}
},`
                } else {
                    body += `\n    ${key}() { return ${JSON.stringify(value.single!.value)} },`
                }
            }
        }

        body += "\n}"

        //endregion

        return `${header}${body}`;
    }

    private parseValue(value: string): TrParsed {
        let hasData = false;
        const bckValue = value;
        const segments: TrParsedSegment[] = [];

        while (true) {
            let idx = value.indexOf("%(");

            if (idx===-1) {
                if (hasData) {
                    segments.push({text: value});
                }

                break;
            }

            hasData = true;

            if (idx>0) {
                segments.push({text: value.substring(0, idx)});
                value = value.substring(idx + 2);
            }

            idx = value.indexOf(")");

            if (idx===-1) {
                segments.push({text: value});
                break;
            } else {
                segments.push({id: value.substring(0, idx)});
                value = value.substring(idx + 1);
            }
        }

        return {
            hasData, segments,
            value: bckValue
        }
    }

    private generateSourceHeaderInfos(tr: TrSinglePlural): DataFunctionInfos {
        const fctId = this.nextFctId++;
        const nameFctSingle = "fs_" + fctId;
        const nameFctPlural = "fp_" + fctId;
        const paramsTypeName = `I${fctId}`;

        let singleFunction = this.generateDataFunctionBody(tr.single?.segments);
        singleFunction = singleFunction.length ? `function ${nameFctSingle}(data: ${paramsTypeName}): string {${singleFunction}}\n\n` : "";

        let pluralFunction = this.generateDataFunctionBody(tr.plural?.segments);
        pluralFunction = pluralFunction.length ? `function ${nameFctPlural}(data: ${paramsTypeName}): string {${pluralFunction}}\n\n` : "";

        let paramsDefInterface = `interface I${fctId} {`;

        for (let segment of tr.single!.segments!) {
            if (segment.id) {
                paramsDefInterface += `\n    ${segment.id}: string|number;`;
            }
        }

        paramsDefInterface += "\n}"

        return {
            nameFctSingle,
            nameFctPlural,
            paramsTypeName,
            paramsDefInterface,
            singleFunction,
            pluralFunction
        }
    }

    private generateDataFunctionBody(segments: undefined|TrParsedSegment[]) {
        if (!segments) return "";

        let body = "";

        for (let s of segments) {
            if (s.text) {
                body += " + " + JSON.stringify(s.text);
            } else {
                body += " + data." + s.id;
            }
        }

        return "return " + body.substring(3);
    }

    private nextFctId = 0;
}

interface DataFunctionInfos {
    nameFctSingle: string;
    nameFctPlural: string;
    paramsTypeName: string;
    paramsDefInterface: string;

    singleFunction: string;
    pluralFunction: string;
}

interface TrSinglePlural {
    hasData: boolean;
    single?: TrParsed;
    plural?: TrParsed;
}

interface TrParsed {
    hasData: boolean;
    value: string;
    segments: TrParsedSegment[];
}

type TrParsedSegment = {
    text?: string
    id?: string
};