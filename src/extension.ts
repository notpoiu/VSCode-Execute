import * as vscode from 'vscode';
import express from 'express';
import * as bodyParser from 'body-parser';
import * as path from 'path';

let ScheduledCode: string = '';
let OutputChannel: vscode.OutputChannel | null = null;

async function getFileContent(filePath: string): Promise<string | undefined> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('No workspace folder is open.');
      return undefined;
    }
    
    const fullPath = path.join(workspaceFolder.uri.fsPath, filePath);
  
    try {
      const fileUri = vscode.Uri.file(fullPath);
      const fileData = await vscode.workspace.fs.readFile(fileUri);
  
      return fileData.toString();
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to read file: ${filePath}`);
      console.error(error);

      return undefined;
    }
}

export async function activate(context: vscode.ExtensionContext) {
    const app = express();
    app.use(bodyParser.json());

    app.get('/', (req: express.Request, res: express.Response) => {
        let ToSchedule = req.header("Code")
        if (ToSchedule != undefined) {
            ScheduledCode = ToSchedule
        } else {
            let Output = req.header("ConsoleOutput");

            if (Output != undefined) {
                vscode.window.showInformationMessage(Output);

                if (!OutputChannel) {
                    OutputChannel = vscode.window.createOutputChannel('VSCode Execute');
                }

                OutputChannel.appendLine(Output);
                OutputChannel.show();
            }

            res.json(ScheduledCode);
            ScheduledCode = '';
        }
    });

    const server = app.listen(6182, async () => {
        vscode.window.showInformationMessage('Server is running on port 6182. http://localhost:6182');
    });

    let executeFileDisposable = vscode.commands.registerCommand('vsexecute.executeCurrentFile', async () => {
        const config = vscode.workspace.getConfiguration('vscode-execute');
        const useSpecificFile = config.get<boolean>('useSpecificFile');
        const specificFile = config.get<string>('specificFile');

        if (useSpecificFile) {
            if (specificFile) {
                ScheduledCode = await getFileContent(specificFile) || '';
            } else {
                vscode.window.showErrorMessage('No specific file found.');
            }

            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (editor) {
            ScheduledCode = editor.document.getText();
        } else {
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

export function deactivate() {}