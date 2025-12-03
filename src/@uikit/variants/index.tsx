import React from 'react';

export const VariantContext = React.createContext<any>({});

export function VariantProvider({children, variants}: {children: React.ReactNode, variants?: any}) {
    return <VariantContext.Provider value={variants}>
        {children}
    </VariantContext.Provider>
}

export function useVariant<T extends React.FC>(name: string, defaultValue?: T|undefined) {
    const variants = React.useContext(VariantContext);
    return variants[name] ?? (defaultValue ?? variantNotFound(name));
}

function variantNotFound(variantName: string) {
    return function () {
        return <div>Variant not found: {variantName}</div>;
    }
}