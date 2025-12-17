// noinspection JSUnusedGlobalSymbols

import React from "react";

export type NavigateFunction = (to: string) => void;

export function useRouterNavigate(): NavigateFunction {
    return (to: string) => {
        window.location.href = to;
    };
}

export function useSendRouterLocationUpdateEvent(_eventName?: string) {
    // Nothing to do if no router enabled.
}

export function useRouterSearchParams(): URLSearchParams {
    return new URL(window.location.href).searchParams;
}

interface Path {
    pathname: string;
    search: string;
    hash: string;
}

export function useRouterLocation(): Path {
    const [location] = React.useState<Path>(new URL(window.location.href));
    return location;
}

let gPageParams: any|undefined;

export function useParams(): any {
    if (gPageParams===undefined) {
        let pathname = new URL(window.location.href).pathname;
        let route = ((window as any)["__JOPI_ROUTE__"]) as string;
        if (!route) return gPageParams = {};

        let pRoute = route.split("/");
        let pPathname = pathname.split("/");
        gPageParams = {};

        for (let i = 0; i < pRoute.length; i++) {
            let p = pRoute[i];
            if (p[0]===":") gPageParams[p.substring(1)] = pPathname[i];
        }
    }

    return gPageParams;
}

export function RouterLink({to, onClick, children, ...p}: React.ComponentProps<"a"> & {
    to: string|undefined, onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void,
    children?: React.ReactNode,
    params?: any
})
{
    return <a href={to} onClick={onClick} {...p}>{children}</a>;
}