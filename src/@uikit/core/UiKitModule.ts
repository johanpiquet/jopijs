import {
    type MenuItemForExtraPageParams,
    type ExtraPageParams,
    ModuleInitContext,
    type ModuleInitContext_Host
} from "jopijs/ui";
import {MenuManager, MenuOverride} from "../menu/index.ts";
import {getDefaultMenuManager} from "../menu/internal.ts";
import React from "react";

export class UiKitModule extends ModuleInitContext {
    private extraPageParams?: ExtraPageParams;

    constructor(host: ModuleInitContext_Host|undefined, extra: ExtraPageParams|undefined) {
        super(host);
        this.extraPageParams = extra;
    }

    protected override initialize() {
        this.objectRegistry.addObjectBuilder("uikit.menuManager", () => {
            if (this.isBrowserSide) {
                return getDefaultMenuManager();
            }

            const mustRemoveTrailingSlashes = this.host.mustRemoveTrailingSlashes;
            return new MenuManager(mustRemoveTrailingSlashes, this.getCurrentURL());
        });
    }

    protected finalize() {
        if (this.extraPageParams) {
            const extra = this.extraPageParams;
            this.extraPageParams = undefined;

            if (extra.menuEntries.length) {
                const menuManager = this.getMenuManager();
                const byMenu: Record<string, MenuItemForExtraPageParams[]> = {}

                for (const entry of extra.menuEntries) {
                    let e = byMenu[entry.menuName];
                    if (!e) byMenu[entry.menuName] = e = [];
                    e.push(entry);
                }

                for (const menuName in byMenu) {
                    const entries = byMenu[menuName];

                    menuManager.addMenuBuilder(menuName, (menu) => {
                        entries.forEach((entry) => {
                            if (entry.roles) {
                                this.ifUserHasRoles(entry.roles, () => {
                                    menu.set(entry.keys, entry)
                                })
                            } else {
                                menu.set(entry.keys, entry)
                            }
                        });
                    })
                }
            }
        }
    }

    getMenuManager(): MenuManager {
        return this.objectRegistry.getObject<MenuManager>("uikit.menuManager")!;
    }

    getMenuOverride(menuName: string): MenuOverride {
        return this.getMenuManager().getMenuOverride(menuName)
    }

    resolveIcon(iconName: string, icon: React.FC) {
        this.getMenuManager().resolveIcon(iconName, icon);
    }
}