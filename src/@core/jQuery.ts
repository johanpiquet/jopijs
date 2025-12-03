/// <reference path="cheerio.d.ts" />

import * as ReactServer from 'react-dom/server';

/**
 * Add our own function to cheerio.
 * Note: the definition type has directly been added to cheerio.d.ts.
 */
export function initCheerio($: cheerio.Root) {
    $.prototype.reactReplaceWith = function (this: cheerio.Cheerio, node: React.ReactElement): cheerio.Cheerio {
        // Note: "this: cheerio.Cheerio" allows casting the value of this.

        this.replaceWith(ReactServer.renderToStaticMarkup(node));
        return this;
    };

    $.prototype.reactReplaceContentWith = function (this: cheerio.Cheerio, node: React.ReactElement): cheerio.Cheerio {
        // Note: "this: cheerio.Cheerio" allows casting the value of this.

        return this.html(ReactServer.renderToStaticMarkup(node));
    };
}