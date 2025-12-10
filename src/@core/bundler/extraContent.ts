import {type VirtualUrlEntry} from "jopijs/loader-tools";
import * as jk_events from "jopi-toolkit/jk_events";

/**
 * Add a CSS file which must be bundled with the page.
 */
export function addExtraCssToBundle(cssFilePath: string) {
    gHasManuallyIncludedCss = true;
    if (gAllCssFiles.includes(cssFilePath)) return;
    gAllCssFiles.push(cssFilePath);
}

export function hasExternalCssToBundle() {
    return gHasManuallyIncludedCss;
}

export function getExtraCssToBundle(): string[] {
    return gAllCssFiles;
}

jk_events.addListener<VirtualUrlEntry>("jopi.virtualUrl.added", (v) => {
    if (!v.url) debugger;

    if (v.url && v.url.endsWith(".css") || v.url.endsWith(".scss")) {
        addExtraCssToBundle(v.sourceFile);
    }
});

let gHasManuallyIncludedCss = false;
const gAllCssFiles: string[] = [];