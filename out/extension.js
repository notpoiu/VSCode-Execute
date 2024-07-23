"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const express_1 = __importDefault(require("express"));
const bodyParser = __importStar(require("body-parser"));
let savedBody = '';
let outputChannel = null;
async function activate(context) {
    const app = (0, express_1.default)();
    app.use(bodyParser.json());
    app.get('/', (req, res) => {
        let Output = req.header("ConsoleOutput");
        if (Output != undefined) {
            vscode.window.showInformationMessage(Output);
            if (!outputChannel) {
                outputChannel = vscode.window.createOutputChannel('VSCode Execute');
            }
            outputChannel.appendLine(Output);
            outputChannel.show();
        }
        res.json(savedBody);
        savedBody = '';
    });
    const server = app.listen(6182, async () => {
        vscode.window.showInformationMessage('Server is running on port 6182. http://localhost:6182');
    });
    let executeFileDisposable = vscode.commands.registerCommand('vsexecute.executeCurrentFile', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            savedBody = editor.document.getText();
        }
        else {
            vscode.window.showErrorMessage('No active editor found.');
        }
    });
    let copyUrlDisposable = vscode.commands.registerCommand('vsexecute.copyVSURL', async () => {
        await vscode.env.clipboard.writeText("http://localhost:6182");
    });
    context.subscriptions.push(executeFileDisposable);
    context.subscriptions.push(copyUrlDisposable);
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBar.text = '$(play) Execute Code';
    statusBar.command = 'vsexecute.executeCurrentFile';
    statusBar.show();
    context.subscriptions.push(statusBar);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map