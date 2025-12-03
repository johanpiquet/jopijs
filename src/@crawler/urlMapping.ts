import {addRoute, createRouter, findRoute} from "rou3";

export interface UrlResolver {
    resolveURL(url: string): UrlMappingResult|undefined;
}

export interface UrlMappingResult {
    url: string;
    wakeUpServer?: ()=>Promise<void>;
}

/**
 * Allows knowing how to map the url.
 * This allows mixing more than one website.
 */
export class UrlMapping implements UrlResolver {
    private readonly router = createRouter<UrlMappingResult>();
    private readonly defaultTarget: string;
    private readonly allOrigins: string[] = [];

    constructor(defaultTarget: string) {
        this.defaultTarget = this.cleanUpRoute(defaultTarget);
    }

    private cleanUpRoute(route: string): string {
        if (route.endsWith("/*")) return route.slice(0, -2);
        if (route.endsWith("/**")) return route.slice(0, -3);
        if (route.endsWith("/")) return route.slice(0, -1);
        return route;
    }

    public getKnownOrigins(): string[] {
        return this.allOrigins;
    }

    public mapURL(route: string, mapTo: string, wakeUpServer?: ()=>Promise<void>): UrlMapping {
        // Avoid errors.
        mapTo = this.cleanUpRoute(mapTo);
        route = this.cleanUpRoute(route) + "/**";

        let mapToOrigin = new URL(mapTo).origin;
        if (!this.allOrigins.includes(mapToOrigin)) this.allOrigins.push(mapToOrigin);

        addRoute(this.router, "GET", route, {
            url: mapTo,
            wakeUpServer: wakeUpServer
        });

        return this;
    }

    public resolveURL(url: string): UrlMappingResult|undefined {
        const matched = findRoute(this.router, "GET", url);
        let target: string;

        let wakeUpServer: (()=>Promise<void>)|undefined;

        if (!matched) {
            target = this.defaultTarget;
        } else {
            target = matched.data.url;
            wakeUpServer = matched.data.wakeUpServer;
        }

        return {url: target + url, wakeUpServer};
    }
}