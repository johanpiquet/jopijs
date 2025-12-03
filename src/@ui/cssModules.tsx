// noinspection JSUnusedGlobalSymbols

import React from "react";

export type HandlerBundleExternalCss = (importMeta: any, cssFilePath: string) => void;

export function setHandler_bundleExternalCss(listener: HandlerBundleExternalCss) {
    gHandler_bundleExternalCss = listener;
}

export const CssModule: React.FC<{module: any}> = ({module}) => {
    return <style>{module.__CSS__}</style>;
};

export interface UseCssModuleContextProps {
    jopiUseCssModule?: Record<string, any>;
}

export function getCssModuleStyle(cssModule: undefined | Record<string, string>): string {
    return cssModule ? cssModule.__CSS__ : "";
}

export function mustBundleExternalCss(importMeta: any, cssFilePath: string) {
    gHandler_bundleExternalCss(importMeta, cssFilePath);
}

let gHandler_bundleExternalCss: HandlerBundleExternalCss = () => {};