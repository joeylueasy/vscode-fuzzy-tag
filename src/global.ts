import * as vscode from 'vscode';
var exec = require('child-process-promise').exec;

function execute(command: string): Promise<Buffer> {
    return exec(command, {
        cwd: vscode.workspace.rootPath,
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024
    }).then(function (result: { stdout: Buffer; }): Buffer {
        return result.stdout;
    }).fail(function (error: string) {
        console.error("Error: " + error);
    }).progress(function () {
        console.log("Command: " + command + " running...");
    });
}

export class Global {
    updateInProgress: boolean = false; // 是否正在更新
    waitUpdate: boolean = false; // 是否有更新任务在等待执行

    run(params: string[]): Promise<Buffer> {
        return execute(params.join(' '));
    }

    updateTags() {
        var configuration = vscode.workspace.getConfiguration('fuzzy-tag');
        var shouldupdate = configuration.get<boolean>('autoUpdate', true);

        if (shouldupdate) {
            if (this.updateInProgress) {
                console.log("wait update");

                this.waitUpdate = true;
            }
            else {
                console.log("update now...");

                this.updateInProgress = true;
                var self = this;
                this.run(['global -u']).then(() => {
                    self.updateTagsFinish();
                }).catch(() => {
                    self.updateTagsFinish();
                });
            }
        }
    }

    updateTagsFinish() {
        this.updateInProgress = false;
        if (this.waitUpdate) {
            this.waitUpdate = false;
            this.updateTags();
        }
        console.log("update down!");
    }

    parseLine(content: string): any {
        try {
            // tslint:disable-next-line: triple-equals
            if (content == null || content == "") { return null; }

            var values = content.split(/ +/);
            var tag = values[0];
            var line = parseInt(values[1]) - 1;
            var path = values[2].replace("%20", " ");
            values.shift();
            values.shift();
            values.shift();
            var info = values.join(" ");

            return { "tag": tag, "line": line, "path": path, "info": info, "kind": this.parseKind(info) };
        } catch (ex) {
            console.error("Error: " + ex);
        }
        return null;
    }

    private parseKind(info: string): vscode.SymbolKind {
        var kind = vscode.SymbolKind.Variable;

        if (info.startsWith('class ')) {
            kind = vscode.SymbolKind.Class;
        } else if (info.startsWith('struct ')) {
            kind = vscode.SymbolKind.Class;
        } else if (info.startsWith('enum ')) {
            kind = vscode.SymbolKind.Enum;
            // tslint:disable-next-line: triple-equals
        } else if (info.indexOf('(') != -1) {
            kind = vscode.SymbolKind.Function;
        }
        return kind;
    }
}
