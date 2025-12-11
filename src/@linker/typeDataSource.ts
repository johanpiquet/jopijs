import {TypeChunk, type TypeChunk_Item} from "./coreAliasTypes.ts";
import * as jk_fs from "jopi-toolkit/jk_fs";
import * as jk_app from "jopi-toolkit/jk_app";
import {normalizeNeedRoleConditionName} from "./common.ts";
import {CodeGenWriter, FilePart, InstallFileType} from "./engine.ts";
import type {JDataRowSource} from "jopi-toolkit/jk_data";

interface TypeDataSource_Item extends TypeChunk_Item {
    mustExpose: boolean;
}

export default class TypeDataSource extends TypeChunk {
    private toExpose: TypeDataSource_Item[] = [];

    protected normalizeFeatureName(featureName: string, ctx: any|undefined): string|undefined {
        featureName = featureName.toLowerCase();
        if (featureName === "expose") return "public";
        if (featureName === "public") return "public";
        return undefined;
    }

    protected normalizeConditionName(condName: string, filePath: string, ctx: any|undefined): string|undefined {
        return normalizeNeedRoleConditionName(condName, filePath, ctx, ["READ", "WRITE"]);
    }

    async onChunk(chunk: TypeChunk_Item, key: string, _dirPath: string) {
        let dsItem: TypeDataSource_Item = chunk as TypeDataSource_Item;

        // Must expose this data source to the network?
        dsItem.mustExpose = chunk.features?.["public"]===true;
        if (dsItem.mustExpose) this.toExpose.push(dsItem);

        this.registry_addItem(key, chunk);
    }

    async beginGeneratingCode(writer: CodeGenWriter) {
        if (!this.toExpose.length) return;

        writer.genAddToInstallFile(InstallFileType.server, FilePart.imports, `\nimport {exposeRowDataSource} from "jopijs";`);

        let count = 0;

        for (let dsItem of this.toExpose) {
            count++;

            let dsName = jk_fs.basename(dsItem.itemPath);
            let relPath = writer.makePathRelativeToOutput(dsItem.entryPoint);
            relPath = writer.toPathForImport(relPath, !writer.isTypeScriptOnly);
            writer.genAddToInstallFile(InstallFileType.server, FilePart.imports, `\nimport DS_${count} from "${relPath}";`);
            writer.genAddToInstallFile(InstallFileType.server, FilePart.body, `\n    exposeRowDataSource("${dsName}", DS_${count}, ${JSON.stringify(dsItem.conditionsContext)});`);
        }
    }

    async generateCodeForItem(writer: CodeGenWriter, key: string, dsItem: TypeDataSource_Item): Promise<void> {
        let targetName = key.substring(key.indexOf("!") + 1);
        let outDir = jk_fs.join(writer.dir.output_src, this.getGenOutputDir(dsItem));
        let entryPoint = jk_fs.getRelativePath(jk_fs.join(outDir, "index.ts"), dsItem.entryPoint);
        let importPath = writer.toPathForImport(entryPoint, false);

        // index.ts
        //
        await writer.writeCodeFile({
            fileInnerPath: jk_fs.join(this.getGenOutputDir(dsItem), targetName, "index"),
            srcFileContent: writer.AI_INSTRUCTIONS + `import "./jBundler_ifServer.ts";`,
            distFileContent: writer.AI_INSTRUCTIONS + `import "./jBundler_ifServer.js";`
        });

        //region jBundler_ifServer.ts

        let srcCode = writer.AI_INSTRUCTIONS + `import C from "${importPath}";
export * from "${importPath}";
export default C;`;

        importPath = writer.toPathForImport(entryPoint, true);
        let distCode = writer.AI_INSTRUCTIONS + `import C from "${importPath}";
export * from "${importPath}";
export default C;`;

        await writer.writeCodeFile({
            fileInnerPath: jk_fs.join(this.getGenOutputDir(dsItem), targetName, "jBundler_ifServer"),
            srcFileContent: srcCode,
            distFileContent: distCode
        });

        //endregion

        //region jBundler_ifBrowser.ts

        let dsName = jk_fs.basename(dsItem.itemPath);

        let dsImpl: JDataRowSource;
        let toImport = dsItem.entryPoint;
        if (!writer.isTypeScriptOnly) toImport = jk_app.getCompiledFilePathFor(toImport);

        try { dsImpl = (await import(toImport)).default; }
        catch { throw this.declareError("Is not a valide data source.", dsItem.entryPoint); }

        let schema = dsImpl.schema;
        if (!schema) throw this.declareError("Is not a valide data source. Missing schema.", dsItem.entryPoint);

        let jsonSchema = schema.toJson();

        srcCode = writer.AI_INSTRUCTIONS;
        srcCode += "import {createRowDataSourceProxy} from 'jopi-toolkit/jk_data'";
        srcCode += "\nimport {schema as newSchema} from 'jopi-toolkit/jk_schemas'";
        srcCode += `\nexport const dataSourceName = "${dsName}";`;

        srcCode += `\nexport const schema = newSchema(${JSON.stringify(jsonSchema.desc, null, 4)}, ${JSON.stringify(jsonSchema.schemaMeta, null, 4)});`;
        srcCode += `\nexport default new JDataRowSource_HttpProxy(dataSourceName, "/_jopi/ds/${dsName}", schema)`;
        distCode = srcCode;

        await writer.writeCodeFile({
            fileInnerPath: jk_fs.join(this.getGenOutputDir(dsItem), targetName, "jBundler_ifBrowser"),
            srcFileContent: srcCode,
            distFileContent: distCode
        });

        //endregion
    }
}