import type {BundlerConfig, CreateBundleParams} from "jopijs";
import * as jk_app from "jopi-toolkit/jk_app";
import * as jk_fs from "jopi-toolkit/jk_fs";
import path from "node:path";
import fs from "node:fs/promises";
import postcss from "postcss";
import tailwindPostcss from "@tailwindcss/postcss";

export async function applyTailwindProcessor(params: CreateBundleParams): Promise<void> {
    function append(text: string) {
        return fs.appendFile(outFilePath, "\n" + text + "\n", "utf-8");
    }

    let sourceFiles = params.entryPoints;
    let genDir = params.genDir;

    // >>> Tailwind transform

    if (params.singlePageMode) {
        genDir = jk_fs.join(genDir, params.pageKey!);
        sourceFiles = [genDir + ".jsx"];
    }

    const outFilePath = path.resolve(genDir, "tailwind.css");

    if (await jk_fs.isFile(outFilePath)) {
        await jk_fs.unlink(outFilePath);
    }

    // Assure the file exists.
    await jk_fs.writeTextToFile(outFilePath, "");

    let postCss = await applyPostCss(params, sourceFiles);
    if (postCss) await append(postCss);
}

/**
 * Generate Tailwind CSS file a list of source files and returns the CSS or undefined.
 */
async function applyPostCss(params: CreateBundleParams, sourceFiles: string[]): Promise<string|undefined> {
    if (!sourceFiles.length) return "";

    const bundlerConfig = params.config;

    let plugins: postcss.AcceptedPlugin[] = [];

    let config = bundlerConfig.tailwind.config || {};
    if (!config.content) config.content = sourceFiles;
    else config.content = [...sourceFiles, ...(config.content as string[])];

    if (bundlerConfig.tailwind.extraSourceFiles) {
        if (!config.content) config.content = [];
        config.content = [...config.content, ...bundlerConfig.tailwind.extraSourceFiles];
    }

    let tailwindPlugin = bundlerConfig.tailwind.disable ? undefined : tailwindPostcss({config} as any);

    if (bundlerConfig.postCss.initializer) {
        plugins = bundlerConfig.postCss.initializer(sourceFiles, tailwindPlugin);
    } else if (tailwindPlugin) {
        plugins = [tailwindPlugin];
    } else {
        return undefined;
    }

    if (!plugins.length) return undefined;

    let globalCssContent = await getGlobalCssFileContent(bundlerConfig);

    try {
        const processor = postcss(plugins);

        const result = await processor.process(globalCssContent, {
            // Setting 'from' allows resolving correctly the node_modules resolving.
            from: params.outputDir
        });

        return result.css;
    }
    catch (e: any) {
        console.error("Error while compiling for Tailwind:", e);
        return undefined;
    }
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
 * Get Tailwind template CSS file from Shadcn config file (components.json).
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