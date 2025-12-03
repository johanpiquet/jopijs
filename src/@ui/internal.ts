import type {ComponentAliasDef} from "./modules.ts";
import {PageContext, PageController} from "./pageController.ts";
import React from "react";

export const gComponentAlias: Record<string, ComponentAliasDef> = {};

export function getDefaultPageController(): PageController {
    if (!gDefaultPageController) gDefaultPageController = new PageController();
    return gDefaultPageController!;
}

let gDefaultPageController: PageController|undefined;