import type {Config as TailwindConfig} from 'tailwindcss';
import postcss from 'postcss';
import {type WebSite, WebSiteImpl} from "../jopiWebSite.tsx";
import path from "node:path";
import * as jk_fs from "jopi-toolkit/jk_fs";
import * as jk_app from "jopi-toolkit/jk_app";

export type PostCssInitializer = (sources: string[], tailwindPlugin:  postcss.AcceptedPlugin|undefined) => postcss.AcceptedPlugin[];

export interface BundlerConfig {
    tailwind: {
        config?: TailwindConfig;

        globalCssContent?: string;
        globalCssFilePath?: string;

        disable?: boolean;
        extraSourceFiles?: string[];
    },

    postCss: {
        initializer?: PostCssInitializer;
    },

    embed: {
        dontEmbedThis?: string[];
    },

    entryPoints: string[];
}

const gBundlerConfig: BundlerConfig = {
    tailwind: {},
    postCss: {},
    embed: {},
    entryPoints: []
}

export function getBundlerConfig(): BundlerConfig {
    return gBundlerConfig;
}

export function getBundleDirPath(webSite: WebSite) {
    // To known: the loader uses jopi.webSiteUrl from "package.json".
    // This can create a situation where we have 2 output directories for
    // the same website.
    //
    let webSiteHost = (webSite as WebSiteImpl).host.replaceAll(".", "_").replaceAll(":", "_");
    return path.join(gTempDirPath, webSiteHost);
}

export async function getGlobalCssFileContent(config: BundlerConfig): Promise<string> {
    if (config.tailwind.globalCssContent) {
        return config.tailwind.globalCssContent;
    }

    if (config.tailwind.globalCssFilePath) {
        if (!await jk_fs.isFile(config.tailwind.globalCssFilePath)) {
            throw new Error(`Tailwind - File not found where resolving 'global.css': ${config.tailwind.globalCssFilePath}`);
        }

        return jk_fs.readTextFromFile(config.tailwind.globalCssFilePath);
    }

    let found = await getTailwindTemplateFromShadCnConfig();
    if (found) return found;

    let rootDir = jk_fs.dirname(jk_app.findPackageJson());

    if (await jk_fs.isFile(jk_fs.join(rootDir, "global.css"))) {
        return jk_fs.readTextFromFile(jk_fs.join(rootDir, "global.css"));
    }

    return `@import "tailwindcss";`;
}

/**
 * Get Tailwind template CSS file from the ShadCN config file (components.json).
 * See: https://ui.shadcn.com/docs/components-json
 */
async function getTailwindTemplateFromShadCnConfig() {
    const pkgJsonPath = jk_app.findPackageJson();
    if (!pkgJsonPath) return undefined;

    let filePath = path.join(path.dirname(pkgJsonPath), "components.json");
    if (!await jk_fs.isFile(filePath)) return undefined;

    try {
        let asText = jk_fs.readTextFromFileSync(filePath);
        let asJSON = JSON.parse(asText);

        let tailwindConfig = asJSON.tailwind;
        if (!tailwindConfig) return undefined;

        let tailwindCssTemplate = tailwindConfig.css;
        if (!tailwindCssTemplate) return undefined;

        let fullPath = path.resolve(path.dirname(pkgJsonPath), tailwindCssTemplate);
        return jk_fs.readTextFromFileSync(fullPath);
    }
    catch (e) {
        console.error("Error reading Shadcn config file:", e);
        return undefined;
    }
}

// Don't use node_modules because of a bug when using workspaces.
// This bug is doing that WebStorm doesn't resolve the file to his real location
// but to the workspace node_modules (and not the project inside the workspace).
//
let gTempDirPath = path.resolve(jk_app.getTempDir(), ".reactHydrateCache");