import path from "node:path";
import fs from "node:fs/promises";
import type {CrawlerCache} from "./common.ts";
import * as jk_fs from "jopi-toolkit/jk_fs";

export class DirectFileCache implements CrawlerCache {
    public readonly rootDir: string;

    constructor(rootDir: string) {
        if (!rootDir) rootDir = ".";
        if (!path.isAbsolute(rootDir)) rootDir = path.resolve(process.cwd(), rootDir);
        this.rootDir = rootDir;
    }

    private calKey(url: string): string {
        const url2 = new URL(url);
        url2.hostname = "localhost";
        url2.port = "";
        url2.protocol = "file:";

        const sURL = url2.toString();
        return jk_fs.fileURLToPath(sURL);
    }

    private calcFilePath(url: string): string {
        let fp = path.join(this.rootDir, this.calKey(url));

        if (fp.endsWith("/")) {
            fp += "index.html";
        } else {
            const ext = path.extname(fp);
            if (!ext) fp += "/index.html";
        }

        return fp;
    }

    getKey(url: string): string {
        return this.calcFilePath(url);
    }

    async addToCache(url: string, response: Response, _requestedByUrl: string): Promise<void> {
        // We don't store 404 and others.
        if (response.status !== 200) return;

        const filePath = this.calcFilePath(url);
        await fs.mkdir(path.dirname(filePath), {recursive: true});

        try {
            await jk_fs.writeResponseToFile(response, filePath);
        }
        catch (e) {
            console.error(e);
        }
    }

    async hasInCache(url: string): Promise<boolean> {
        const filePath = this.calcFilePath(url);

        try {
            const stat = await jk_fs.getFileStat(filePath);
            return (stat!==undefined) && stat.isFile();
        }
        catch {
            return false;
        }

    }
}
