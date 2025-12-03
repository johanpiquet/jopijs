export interface IsObjectRegistry {
    getObject<T>(name: string): T|undefined;
    registerObject(name: string, instance: any): void;
    addObjectBuilder<T>(name: string, builder: () => T): void;
}

interface ObjectRegistryEntry {
    builder?: () => any;
    instance?: any;
}

export class ObjectRegistry implements IsObjectRegistry {
    private readonly r: Record<string, ObjectRegistryEntry> = {};

    getObject<T>(name: string): T|undefined {
        let entry = this.r[name];
        if (!entry) return undefined;

        if (entry.instance!==undefined) return entry.instance as T;

        if (entry.builder) {
            entry.instance = entry.builder();
            return entry.instance as T;
        }

        return undefined;
    }

    registerObject(name: string, instance: any): void {
        let entry = this.r[name];
        if (!entry) this.r[name] = entry = {};
        entry.instance = instance;
    }

    addObjectBuilder<T>(name: string, builder: () => T): void {
        let entry = this.r[name];
        if (!entry) this.r[name] = entry = {};
        entry.builder = builder;
    }
}

export function getDefaultObjectRegistry(): IsObjectRegistry {
    if (!gObjectRegistry) {
        return gObjectRegistry = new ObjectRegistry();
    }

    return gObjectRegistry;
}

let gObjectRegistry: ObjectRegistry|undefined;