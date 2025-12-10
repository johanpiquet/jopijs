import type { ResolveHook, ResolveFnOutput } from 'node:module';
import nodeModule from 'node:module';

import {pathToFileURL} from "node:url";
import {getPathAliasInfo, type PathAliasInfo} from "./tools.js";
import fs from "node:fs/promises";
import path from "node:path";

import * as jk_app from "jopi-toolkit/jk_app";
import * as jk_fs from "jopi-toolkit/jk_fs";

//**********************************************************************************************************************
// NodeJS RESOLVER vs LOADER
//
// Resolver is the new Node.js API for import resolving and processing.
// But currently (Node v22) there is not a full support, and the old
// mechanism (loader) must be used for some special cases.
//
//**********************************************************************************************************************

const LOG = process.env.JOPI_LOGS === "1";

let gRequire: NodeJS.Require|undefined;

/**
 * Using a loader (old API) allows doing thing not correctly supported by resolver (new API)
 *
 * 1- Resolving alias.
 *      Example: import myComp from "@/lib/myComp".
 *      The alias definitions are taken in the paths section of tsconfig.json.
 *
 * 2- Resolving import for an exposed file inside a module
 *      Example:                import 'primereact/sidebar'
 *      where the target is     import 'primereact/sidebar/index.mjs.js'
 */
export const resolveNodeJsAlias: ResolveHook = async (specifier, context, nextResolve): Promise<ResolveFnOutput> => {
    if (!gPathAliasInfos) {
        gPathAliasInfos = await getPathAliasInfo();
    }

    //region Resolve alias

    if (specifier[0]==='@') {
        let foundAlias = "";

        for (const alias in gPathAliasInfos.alias) {
            if (specifier.startsWith(alias)) {
                if (foundAlias.length < alias.length) {
                    foundAlias = alias;
                }
            }
        }

        if (foundAlias) {
            if (LOG) console.log(`jopi-loader - Found alias ${foundAlias} for resource ${specifier}`);

            let pathAlias = gPathAliasInfos.alias[foundAlias];
            const resolvedPath = specifier.replace(foundAlias, pathAlias);

            let filePath = resolvedPath.endsWith('.js') ? resolvedPath : `${resolvedPath}.js`;
            filePath = jk_app.getCompiledFilePathFor(filePath);

            if (await jk_fs.isFile(filePath)) {
                return nextResolve(pathToFileURL(filePath).href, context);
            }

            // Remove .js
            filePath = filePath.slice(0, -3);

            // Test path/index.js
            filePath = jk_fs.join(filePath, "index.js");

            if (await jk_fs.isFile(filePath)) {
                return nextResolve(pathToFileURL(filePath).href, context);
            }

            throw new Error(`Can't resolve alias target ${specifier}`);
        }

        // > Will continue on next cases.
    }

    //endregion

    let mustProcess = specifier.includes("/");

    if (mustProcess) {
        if ((specifier[0] === '@') && specifier[1]!=='/') {
            mustProcess = false;
        } else if (specifier.indexOf(":")!==-1) {
            mustProcess = false;
        } else if (specifier.endsWith(".js") || specifier.endsWith(".mjs")) {
            mustProcess = false;
        }
    }

    // If we are here, it means we have possibly something like:
    //      import "module/internalPath"
    //
    // The matter is that the extension is missing, and Node.js doesn't handle this case
    // despite UI lib used by Vite.js or WebPack.
    //
    if (mustProcess) {
        if (!gRequire) {
            gRequire = nodeModule.createRequire(context.parentURL!);
        }

        try {
            // Testing nextResolve and catching exception don't work.
            // It's why we use require.resolve to localize the package..
            //
            let found = gRequire.resolve(specifier);

            if (found) {
                const pkgPath = nodeModule.findPackageJSON(pathToFileURL(found));

                if (pkgPath) {
                    let pkgJson = await fs.readFile(pkgPath, "utf-8");
                    const json = JSON.parse(pkgJson);

                    if (json.module) {
                        const oldName = specifier;
                        specifier = path.resolve(path.dirname(pkgPath), json.module);
                        if (LOG) console.log("Resolving", oldName, "to", specifier);
                    }
                }
            }
        } catch {
        }
    }

    return nextResolve(specifier, context);
}

let gPathAliasInfos: PathAliasInfo|undefined;
