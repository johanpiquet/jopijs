import {MenuManager} from "./core.ts";

export interface WithKeyAndItems<T> {
    key: string;
    items?: (T & WithKeyAndItems<T>)[];
}

export function getDefaultMenuManager(): MenuManager {
    if (!gMenuManager) {
        let mustRemoveTrailingSlashes = (window as any)["__JOPI_OPTIONS__"].removeTrailingSlashes === true
        gMenuManager = new MenuManager(mustRemoveTrailingSlashes);
    }

    return gMenuManager;
}

let gMenuManager: MenuManager|undefined;