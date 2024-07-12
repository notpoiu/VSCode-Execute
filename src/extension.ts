import * as vscode from 'vscode';
import express from 'express';
import * as bodyParser from 'body-parser';
import axios from 'axios';
import localtunnel from 'localtunnel';

let savedBody: string = '';
let outputChannel: vscode.OutputChannel | null = null;
let tunnelUrl: string = '';

export async function activate(context: vscode.ExtensionContext) {
    const app = express();
    app.use(bodyParser.json());

    app.get('/', (req: express.Request, res: express.Response) => {
        let Output = req.header("ConsoleOutput");

        if (Output != undefined) {
            vscode.window.showInformationMessage(Output);

            if (!outputChannel) {
                outputChannel = vscode.window.createOutputChannel('VS Code Execute');
            }

            outputChannel.appendLine(Output);
            outputChannel.show();
        }

        res.json(savedBody);
        savedBody = '';
    });

    const server = app.listen(6182, async () => {
        vscode.window.showInformationMessage('Server is running on port 6182.');

        const tunnel = await localtunnel({ port: 6182 });
        tunnelUrl = tunnel.url;
        if (tunnelUrl) {
            vscode.window.showInformationMessage(`LocalTunnel URL: ${tunnelUrl}`);

            context.subscriptions.push({
                dispose: () => {
                    tunnel.close();
                    server.close();
                }
            });
        } else vscode.window.showErrorMessage(`Failed to start localtunnel, please run 'lt --port 6182'`);
    });

    let executeFileDisposable = vscode.commands.registerCommand('vsexecute.executeCurrentFile', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            savedBody = editor.document.getText();
        } else {
            vscode.window.showErrorMessage('No active editor found.');
        }
    });

    let copyUrlDisposable = vscode.commands.registerCommand('vsexecute.copyVSURL', async () => {
        if (tunnelUrl) {
            await vscode.env.clipboard.writeText(tunnelUrl);
            vscode.window.showInformationMessage('LocalTunnel URL copied to clipboard.');
        } else {
            vscode.window.showErrorMessage('LocalTunnel URL is not available.');
        }
    });

    context.subscriptions.push(executeFileDisposable);
    context.subscriptions.push(copyUrlDisposable);

    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBar.text = '$(play) Execute Code';
    statusBar.command = 'vsexecute.executeCurrentFile';
    statusBar.show();

    context.subscriptions.push(statusBar);
}

export function deactivate() {}