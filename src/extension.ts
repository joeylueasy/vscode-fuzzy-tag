import * as vscode from 'vscode';
import { Global } from './global';
import Window = vscode.window;
import QuickPickItem = vscode.QuickPickItem;
import QuickPickOptions = vscode.QuickPickOptions;

const global = new Global();
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "fuzzy" is now active!');

	vscode.commands.registerCommand("extension.fuzzyTag", fuzzySearch);
}


function get_pattern(keywords: string): string {
	var pattern: string = "";
	keywords.split(" ").forEach(function (w) {
		w.split("").forEach(function (c) {
			pattern += '[' + c.toLowerCase() + c.toUpperCase() + "].*?"; // 忽略大小写，非贪婪匹配
		});
	});
	return pattern;
}

async function fuzzySearch() {

	var items: QuickPickItem[] = [];
	var opts: QuickPickOptions = {
		matchOnDescription: true,
		placeHolder: ''
	};

	var location = new Map<string, any>();
	let suggestions: any[][] = [];
	var sugg_cnt = 0;

	var full_name = vscode.workspace.workspaceFolders;
	if (full_name === undefined) { return; }
	var long_pre_path = full_name[0].uri.path + "/";
	var pre_path = long_pre_path.split(':')[1];
	// Window.showInformationMessage(pre_path);
	console.log(long_pre_path);
	console.log(pre_path);

	// 获取输入
	Window.showInputBox({
		ignoreFocusOut: true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
		placeHolder: 'Search...', // 在输入框内的提示信息
	}).then(async function (msg) {

		if (msg) {
			var pattern = get_pattern(msg);
			// 从global获取结果
			const output = await global.run(['global -ax "' + pattern + '"']);
			try {
				// tslint:disable-next-line: triple-equals
				if (output != null && output.length > 0) {
					output.toString().split(/\r?\n/).forEach(async function (value) {
						// 解析结果
						var result = global.parseLine(value);
						if (result === null) {
							return;
						}

						var tag = result["tag"];
						var line = result["line"];
						var path = result["path"].split(pre_path)[1]; // 显示相对路径
						console.log(result["path"]);
						console.log(path);
						// var info = result["info"];

						var patt = new RegExp(pattern);
						// 在gtags结果的基础上再次正则，优化排序优先级
						var match = patt.exec(tag);
						var index = tag.search(patt);
						if (match === null) { return; }
						suggestions[sugg_cnt] = [match.toString().length, index, tag, path, line];
						sugg_cnt++;
					});

					// 根据匹配长度（紧凑程度）和起始位置进行排序
					// 让最符合的结果在最前面显示
					function cmp(a: any[], b: any[]) {
						if (a[0] === b[0]) { return a[1] - b[1]; }
						return a[0] - b[0];
					}
					suggestions.sort(cmp);
					suggestions.forEach(function (i) {
						var tag = i[2];
						var path = i[3];
						var line = i[4];
						// info 和 path 组成唯一的key
						var key: string = tag + "@" + path;

						location.set(key, { "path": path, "line": line });
						items.push(({ label: tag, description: path }));
					});

					// 显示下拉框
					Window.showQuickPick(items, opts).then(async (selection) => {
						if (!selection) { return; }

						console.log("selected tag: " + selection.label);

						// 跳转到对应位置
						var key = selection.label + "@" + selection.description;
						var value = location.get(key);
						var options = {
							selection: new vscode.Range(new vscode.Position(value["line"], 0),
								new vscode.Position(value["line"], 0)),
							preview: false,
						};
						await Window.showTextDocument(vscode.Uri.file(long_pre_path + value["path"]), options);
						return;
					});
				}
				else {
					console.log("0 results");
					items.push(({ label: "0 results", description: "" }));
					Window.showQuickPick(items, opts);
				}
			}
			catch (ex) {
				console.error("Error: " + ex);
			}
		}
	});
}
