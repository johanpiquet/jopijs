// noinspection JSUnusedGlobalSymbols

import {pipeline} from "node:stream/promises";
import {createReadStream, createWriteStream} from "node:fs";
import {createGunzip, createGzip} from "node:zlib";
import path from 'node:path';
import fs from 'node:fs/promises';
import * as jk_fs from "jopi-toolkit/jk_fs";

export async function gzipFile(inputPath: string, outputPath: string) {
    try {
        await pipeline(createReadStream(inputPath), createGzip(), createWriteStream(outputPath));
    } catch (e) {
        console.error("Can't gzip file", inputPath, e);
    }
}

export async function gunzipFile(inputPath: string, outputPath: string) {
    try {
        await pipeline(createReadStream(inputPath), createGunzip(), createWriteStream(outputPath));
    } catch (e) {
        console.error("Can't gunzip file", inputPath, e);
    }
}

export async function mkDirForFile(filePath: string): Promise<void> {
    const directoryPath = path.dirname(filePath);
    await fs.mkdir(directoryPath, {recursive: true});
}

export async function saveReadableStreamToFile(filePath: string, stream: ReadableStream<Uint8Array>) {
    await jk_fs.writeResponseToFile(new Response(stream), filePath);
}