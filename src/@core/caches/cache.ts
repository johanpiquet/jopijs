import {makeIterable} from "../internalTools.js";
import type {JopiRequest} from "../jopiRequest.tsx";

export interface CacheRole {
    isUserCache?: boolean;
    isMobileCache?: boolean;
}

export interface PageCache {
    cacheRole?: CacheRole;

    getFromCache(req: JopiRequest, url: URL): Promise<Response | undefined>;

    addToCache(req: JopiRequest, url: URL, response: Response, headersToInclude: string[] | undefined): Promise<Response>;

    hasInCache(url: URL): Promise<boolean>;

    removeFromCache(url: URL): Promise<void>;

    createSubCache(name: string): PageCache;

    getSubCacheIterator(): Iterable<string>;

    getCacheEntryIterator(subCacheName?: string): Iterable<CacheEntry>;
}

export class VoidPageCache implements PageCache {
    getFromCache(): Promise<Response | undefined> {
        return Promise.resolve(undefined);
    }

    addToCache(_req: JopiRequest, _url: URL, response: Response): Promise<Response> {
        return Promise.resolve(response);
    }

    hasInCache(): Promise<boolean> {
        return Promise.resolve(false);
    }

    removeFromCache(_url: URL): Promise<void> {
        return Promise.resolve();
    }

    createSubCache(): PageCache {
        return this;
    }

    getCacheEntryIterator() {
        return makeIterable({
            next(): IteratorResult<CacheEntry> {
                return { value: undefined, done: true };
            }
        });
    }

    getSubCacheIterator() {
        return makeIterable({
            next(): IteratorResult<string> {
                return { value: undefined, done: true };
            }
        });
    }
}

export interface CacheEntry {
    url: string;
    binary?: Uint8Array<ArrayBuffer>;
    binarySize?: number;
    isGzipped?: boolean;

    headers?: {[key:string]: string};

    status?: number;

    _refCount?: number;
    _refCountSinceGC?: number;
}