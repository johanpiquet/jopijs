import type {JopiRequest} from "./jopiRequest.ts";
import * as jk_fs from "jopi-toolkit/jk_fs";
import * as jk_crypto from "jopi-toolkit/jk_crypto";

export type BrowserCacheValidationInfos = {
    etag: string;
    fileState: jk_fs.FileState;
};

export interface BrowserCacheStrategy {
    cacheDuration?: number;
}

export interface ReqReturnFileParams extends BrowserCacheStrategy {
    contentEncoding?: string;
    cacheDuration?: number;
}

export interface TryReturnFileParams extends ReqReturnFileParams {
    req: JopiRequest;
    filePath: string;
    contentEncoding: string|undefined;
    validationInfos: BrowserCacheValidationInfos;
}

export function addBrowserCacheControlHeaders(headers: any, params: TryReturnFileParams) {
    let stats = params.validationInfos.fileState;
    headers["etag"] = params.validationInfos.etag;
    headers["last-modified"] = new Date(stats.mtimeMs).toUTCString();

    if (params.cacheDuration) {
        headers["cache-control"] = `Cache-Control: public, max-age=${params.cacheDuration}, immutable`;
    } else {
        headers["cache-control"] = "public, max-age=0, must-revalidate";
    }
}

export function calcETagForText(text: string): string {
    return jk_crypto.fastHash(text);
}