import {TypeInDirChunk} from "./coreAliasTypes";
import {CodeGenWriter} from "./engine";

export class TypeTypeScriptType extends TypeInDirChunk {
    protected generateImport(writer: CodeGenWriter, entryPoint: string): {ts: string, js: string} {
        const ts = writer.AI_INSTRUCTIONS + `export type * from "${writer.toPathForImport(entryPoint, false)}";`;
        const js = writer.AI_INSTRUCTIONS + `export type * from "${writer.toPathForImport(entryPoint, true)}";`;
        return {ts, js};
    }
}