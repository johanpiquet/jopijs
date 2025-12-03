import React from "react";
import {PageContext, PageController_ExposePrivate} from "jopijs/ui";
import * as ReactServer from "react-dom/server";

export default function({children, controller}: { children: React.ReactNode|React.ReactNode[], controller: PageController_ExposePrivate<unknown> }) {
    const body = ReactServer.renderToStaticMarkup(
        <PageContext.Provider value={controller}>
            {children}
        </PageContext.Provider>
    );

    const state = controller.getOptions();

    return <html {...state.htmlProps}>
        <head {...state.headProps}>
            {state.head}
            <title>{state.pageTitle}</title>
        </head>
        <body {...state.bodyProps}>
            {state.bodyBegin}
            <div dangerouslySetInnerHTML={{ __html: body }} />
            {state.bodyEnd}
        </body>
    </html>
}