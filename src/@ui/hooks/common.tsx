// noinspection JSUnusedGlobalSymbols

import React, {useEffect} from "react";
import {PageContext, PageController, PageController_ExposePrivate, type PageOptions} from "../pageController.ts";
import {CssModule, type UseCssModuleContextProps} from "../cssModules.tsx";
import * as jk_events from "jopi-toolkit/jk_events";
import type {CookieOptions} from "../cookies/index.ts";
import {PageModifier} from "../pageModifier.tsx";

/**
 * Allow getting a reference to the PageController.
 * **USING IT MUST BE AVOIDED** since it's a technical item.
 * It's the reason of the underscore.
 */
export function _usePage<T = any>(): PageController<T> {
    let res = React.useContext(PageContext) as PageController<T>;

    // Not wrapped inside a PageContext?
    if (!res) {
        res = new PageController<T>(true);
    }

    return res;
}

/**
 * Allows setting the page title.
 * @param title
 */
export function usePageTitle(title: string) {
    const page = React.useContext(PageContext) as PageController;
    if (page) page.setPageTitle(title);
}

/**
 * Returns an object allowing to modify the page content.
 */
export function usePageModifier(): PageModifier {
    const page = React.useContext(PageContext) as PageController;
    return new PageModifier(page);
}

export function useCssModule(cssModule: undefined | Record<string, string>) {
    if (!cssModule) return;

    // Not a real CSS Module?
    const fileHash = cssModule.__FILE_HASH__;
    if (!fileHash) return;

    const ctx = _usePage<UseCssModuleContextProps>();

    // Will allow knowing if the module is already inserted for this page.
    if (!ctx.data.jopiUseCssModule) ctx.data.jopiUseCssModule = {};

    // Not already added? Then add it.
    if (fileHash && !ctx.data.jopiUseCssModule[fileHash]) {
        ctx.data.jopiUseCssModule![fileHash] = true;

        // Will allow inlining the style inside the page.
        ctx.addToBodyBegin(fileHash, <CssModule key={fileHash} module={cssModule}/>);
    }
}

export interface ReactStaticEvent {
    send<T>(data: T): T;
    reactListener<T>(listener: (data: T) => void): void;
}