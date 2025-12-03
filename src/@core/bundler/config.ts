import type {Config as TailwindConfig} from 'tailwindcss';
import postcss from 'postcss';

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