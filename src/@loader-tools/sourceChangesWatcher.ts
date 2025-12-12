import path from "node:path";
import {spawn, ChildProcess} from "node:child_process";
import chokidar from "chokidar";
import * as jk_timer from "jopi-toolkit/jk_timer";

export interface SourceChangesWatcherParams {
    watchDirs: string[];
    excludeDir: string[];
    env?: Record<string, string>;
    cmd?: string;
    args?: string[];
    isDev: boolean;
    mustLog: boolean;
    jsEngine: string;
}

/**
 * Watches source directories for changes and restarts a server process automatically.
 * - Add directories to watch (recursively).
 * - Configurable delay (debounce) before restarting.
 * - Includes a helper to auto-detect the source directory when using TypeScript.
 */
export class SourceChangesWatcher {
    private readonly _fileWatchingDelay: number;
    private readonly _restartDelay: number;

    private _areSignalCatch = false;

    private _isStarted = false;
    private _enableLogs: boolean = false;

    private readonly watchDirs: string[];
    private readonly excludeDir: string[];
    private readonly env: Record<string, string>;

    private readonly _cmd: string;
    private readonly _args: string[];

    private _avoidRestartTimerId: number = 0;
    private readonly _isDev: boolean;
    private readonly _mustLog: boolean;

    constructor(params: SourceChangesWatcherParams) {
        const isNodeJS = params.jsEngine === "node";

        this._fileWatchingDelay = isNodeJS ? 1000 : 500;
        this._restartDelay = isNodeJS ? 500 : 10;

        this.watchDirs = params.watchDirs;
        this.excludeDir = params.excludeDir;

        if (params.env) this.env = params.env;
        else this.env = process.env as Record<string, string>;

        this._cmd = params.cmd || process.argv0;
        this._args = params.args || [];

        this._isDev = params.isDev;
        this._mustLog = params.mustLog;
    }

    async start() {
        if (this._isStarted) return;
        this._isStarted = true;

        for (const dir of this.watchDirs) {
            await this.watchDirectoryRecursive(dir);
        }

        // Create the first child.
        await this.spawnChild();
    }

    /**
     * We wait about 2 seconds after the spawned process start.
     * This allows avoiding restart when the linker makes changes.
     */
    waitBeforeWatchingFile() {
        this._canWatchFiles = false;

        // Wait a delay to avoid restarting
        // when Jopi linker updates the code.
        //
        setTimeout(() => {
            if (this._enableLogs) {
                console.log("🔥  Starting file watching...");
            }

            this._canWatchFiles = true;
        }, 3000);
    }

    _canWatchFiles = false;

    private async onFileChangeDetected(filePath: string) {
        if (!this._canWatchFiles) return;

        if (this.excludeDir) {
            let isExcluded = this.excludeDir.find(p => filePath.startsWith(p))
            if (isExcluded) return;
        }

        // Avoid it if inside a hidden directory (start by .).
        let pathParts = filePath.split(path.sep);
        let hiddenPart = pathParts.find(e => e[0] === '.')
        if (hiddenPart) return;

        // Avoid it if inside a node module. Reason: some tools used it as a temp.
        let nodeModule = pathParts.find(e => e === 'node_modules');
        if (nodeModule) return;

        // A restart is already scheduled?
        // Then avoid starting a new one.
        //
        if (this._avoidRestartTimerId) return;

        // @ts-ignore
        this._avoidRestartTimerId = setTimeout(async () => {
            try {
                if (this._enableLogs) {
                    console.log("File change watcher - RESTART for:", filePath);
                }

                await this.spawnChild();
            } finally {
                this._avoidRestartTimerId = 0;
            }
        }, this._restartDelay);
    }

    private async watchDirectoryRecursive(dir: string) {
        const watcher = chokidar.watch(dir, {
            persistent: true,
            ignoreInitial: true,

            // Ignore common heavy/irrelevant directories
            ignored: (watchedPath: string) => {
                const b = path.basename(watchedPath);
                return b === 'node_modules' || b === '.git' || b === '.idea' || b === '.vscode';
            },

            awaitWriteFinish: {
                stabilityThreshold: this._fileWatchingDelay,
                pollInterval: Math.min(100, this._fileWatchingDelay)
            }
        });

        watcher.on('all', async (_event, paths) => {
            await this.onFileChangeDetected(paths)
        });

        watcher.on('error', () => { /* swallow watcher errors to keep running */
        });
    }

    private killAll() {
        if (this._isDev) {
            // > Do a fast hard kill.
            if (gChild && !gChild.killed) gChild.kill('SIGKILL');
            process.exit(0);
        } else {
            // > Do a soft kill.
            if (gChild) {
                const child = gChild;
                child.kill('SIGTERM');

                setTimeout(() => {
                    if (!child.killed) {
                        child.kill('SIGKILL');
                    }
                }, 3000);
            }
        }
    }

    public async spawnChild() {
        if (gChild) {
            if (!gChild.killed) {
                // Do a hard kill.
                // Not a problem since we are in dev mode.
                gChild.kill("SIGKILL");
            }

            gChild = undefined;
            await jk_timer.tick(100);
        }

        let useShell = this._cmd.endsWith('.cmd') || this._cmd.endsWith('.bat') || this._cmd.endsWith('.sh');

        if (!this._areSignalCatch) {
            this._areSignalCatch = true;

            process.on('SIGTERM', () => this.killAll());
            process.on('SIGINT', () => this.killAll());
            process.on('SIGHUP', () => this.killAll());
            process.on('exit', () => this.killAll());
        }

        //console.log("spawning", {cmd: this._cmd, args: this._args, cwd: process.cwd(), useShell})
        this._canWatchFiles = false;

        const child = spawn(this._cmd, this._args, {
            stdio: "inherit", shell: useShell,
            cwd: process.cwd(),
            env: this.env
        });

        gChild = child;

        child.on('exit', (code, signal) => {
            // The current instance has stopped?
            if (gChild===child) {
                if (signal) process.kill(process.pid, signal);
                else process.exit(code ?? 0);
            }
        });

        child.on('error', (err) => {
            // The current instance is in error?
            if (gChild===child) {
                console.error(err.message || String(err));
                process.exit(1);
            }
        });

        child.on("spawn", () => {
            this.onSpawned();
        });
    }

    onSpawned() {
        // Allow not watching the files changes
        // before 2sec after the process start.
        //
        this.waitBeforeWatchingFile();
    }
}

let gChild: ChildProcess|undefined;
