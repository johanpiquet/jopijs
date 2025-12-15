import React from 'react';
import type {JFormVariants} from "../forms/index.ts";

export const VariantContext = React.createContext<any>({});

export function useVariant<T extends React.FC>(name: string, variants: JFormVariants|undefined, forceRenderer?: T|undefined) {
    if (forceRenderer) return forceRenderer;

    if (variants) {
        let renderer = (variants as any)[name];
        if (renderer) return renderer;
    }

    const ctxVariants = React.useContext(VariantContext);
    return ctxVariants[name];
}