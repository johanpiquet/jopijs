import {doNodeJsLoad, doNodeJsResolve} from "jopijs/loader-tools";

// Guard to avoid recursive self-registration when using Module.register(import.meta.url)
/*const __JOPI_LOADER_REGISTERED__ = Symbol.for('jopi-loader:registered');
const __g: any = globalThis as any;

if (!__g[__JOPI_LOADER_REGISTERED__]) {
    __g[__JOPI_LOADER_REGISTERED__] = true;

    // "register" allow async.
    NodeModule.register(import.meta.url as unknown as string);
}*/

export async function resolve(specifier: string, context: any, nextResolve: any) {
    return doNodeJsResolve(specifier, context, nextResolve);
}

// noinspection JSUnusedGlobalSymbols
export async function load(url: string, context: any, nextLoad: any) {
    return doNodeJsLoad(url, context, nextLoad);
}