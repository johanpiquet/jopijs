import path from "node:path";
import * as jk_fs from "jopi-toolkit/jk_fs";
import * as jk_app from "jopi-toolkit/jk_app";

/**
 * The value of the "jopi" entry in package.json
 */
export interface PackageJson_jopi {
    /**
     * When importing a file, if this option is set, then
     * we will not return a file path on the filesystem
     * but an url pointing to this resource.
     *
     * The value here must be the PUBLIC url.
     */
    webSiteUrl?: string;

    /**
     * It's the url on which the website listens to if we don't use
     * explicite url when defining the website.
     *
     * Here it's the PRIVATE url.
     *
     * If not defined, take the value of webSiteUrl.
     */
    webSiteListeningUrl?: string;

    /**
     * Is similar to 'webResourcesRoot' but for the server side resources.
     * The server will redirect the resources from this url to the final
     * url resolved once bundled.
     */
    webResourcesRoot_SSR?: string;

    /**
     * Is used with `webSiteUrl` to known where
     * whe cas found the resource. Will allow installing
     * a file server.
     */
    webResourcesRoot: string;

    /**
     * File which size is over this limite
     * will not be inlined when option ?inline
     * is set in the 'import', but resolved as
     * a file path (or ulr).
     */
    inlineMaxSize_ko: number;

    /**
     * Indicate the directory where the bundler
     * stores the images and resources.
     * (use linux path format)
     */
    bundlerOutputDir: string;
}

export const INLINE_MAX_SIZE_KO = 3;

let gTransformConfig: PackageJson_jopi|undefined;

export function getPackageJsonConfig(): PackageJson_jopi {
    function urlToPath(url: string) {
        let urlInfos = new URL(url);
        let port = urlInfos.port;

        if (port.length && port[0]!==':') port = ':' + port;
        return (urlInfos.hostname + port).replaceAll(".", "_").replaceAll(":", "_");
    }

    if (gTransformConfig!==undefined) return gTransformConfig;
    let pkgJsonFilePath = jk_app.findPackageJson();

    let bundlerOutputDir = "./temp/.reactHydrateCache";

    gTransformConfig =  {
        webResourcesRoot: "_bundle",
        inlineMaxSize_ko: INLINE_MAX_SIZE_KO,
        bundlerOutputDir: ""
    }

    if (pkgJsonFilePath) {
        try {
            let json = JSON.parse(jk_fs.readTextFromFileSync(pkgJsonFilePath));
            let jopi = json.jopi;

            if (jopi) {
                let webSiteUrl = jopi.webSiteUrl;
                if (webSiteUrl && !webSiteUrl.endsWith("/")) webSiteUrl += '/';
                //
                gTransformConfig.webSiteUrl = webSiteUrl;

                let webSiteListeningUrl = jopi.webSiteListeningUrl;
                if (webSiteListeningUrl && !webSiteListeningUrl.endsWith("/")) webSiteListeningUrl += '/';
                //
                gTransformConfig.webSiteListeningUrl = webSiteListeningUrl;

                let webResourcesRoot = jopi.webResourcesRoot || "_bundle";
                if (webResourcesRoot[0]==='/') webResourcesRoot = webResourcesRoot.substring(1);
                if (!webResourcesRoot.endsWith("/")) webResourcesRoot += "/";
                //
                gTransformConfig.webResourcesRoot = webResourcesRoot;
                gTransformConfig.webResourcesRoot_SSR = webResourcesRoot.slice(0, -1) + "_s/";

                if (typeof(jopi.inlineMaxSize_ko)=="number") {
                    gTransformConfig.inlineMaxSize_ko = jopi.inlineMaxSize_ko || INLINE_MAX_SIZE_KO;
                }

                if (webResourcesRoot.bundlerOutputDir) {
                    bundlerOutputDir = webResourcesRoot.bundlerOutputDir;
                }
            }
        } catch {
        }
    }

    if (process.env.JOPI_WEBSITE_URL) {
        gTransformConfig.webSiteUrl = process.env.JOPI_WEBSITE_URL;
    }

    if (process.env.JOPI_WEBSITE_LISTENING_URL) {
        gTransformConfig.webSiteListeningUrl = process.env.JOPI_WEBSITE_LISTENING_URL;
    }

    if (!gTransformConfig.webSiteListeningUrl) {
        gTransformConfig.webSiteListeningUrl = gTransformConfig.webSiteUrl;
    } else if (!gTransformConfig.webSiteUrl) {
        gTransformConfig.webSiteUrl = gTransformConfig.webSiteListeningUrl;
    }

    if (bundlerOutputDir && gTransformConfig.webSiteUrl) {
        if (path.sep !== "/") {
            bundlerOutputDir = bundlerOutputDir.replaceAll("/", path.sep);
        }

        bundlerOutputDir = path.resolve(bundlerOutputDir);
        bundlerOutputDir = path.join(bundlerOutputDir, urlToPath(gTransformConfig.webSiteUrl));
        gTransformConfig.bundlerOutputDir = bundlerOutputDir;
    }

    return gTransformConfig!;
}