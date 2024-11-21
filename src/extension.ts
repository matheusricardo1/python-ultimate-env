import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

let activateInAllTerminals = false; // Global control for automatic activation in all terminals

async function findActivateScriptInWorkspace(): Promise<string | null> {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length === 0) {
    console.log('No folder open in the workspace.');
    return null;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;

  // List subfolders directly within the root folder
  const subfolders = fs.readdirSync(rootPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => path.join(rootPath, dirent.name));

  for (const subfolder of subfolders) {
    // Check if pyvenv.cfg exists within the subfolder
    const pyvenvPath = path.join(subfolder, 'pyvenv.cfg');
    if (!fs.existsSync(pyvenvPath)) {
      continue; // Not a valid virtual environment
    }

    // Check for Activate.ps1 (Windows)
    const scriptsPathWin = path.join(subfolder, 'Scripts', 'Activate.ps1');
    if (fs.existsSync(scriptsPathWin)) {
      console.log(`Virtual environment found: ${scriptsPathWin}`);
      return scriptsPathWin;
    }
  }

  console.log('No valid virtual environment found in the first layer of subfolders.');
  return null;
}

async function activateVirtualEnv(scriptPath: string, terminal: vscode.Terminal): Promise<void> {
  try {
    const isWindows = process.platform === 'win32';
    if (!isWindows) {
      // Do not do anything on Linux
      return;
    }

    const activateCommand = `& '${scriptPath}'`;

    // Send the command to activate the virtual environment in the provided terminal
    terminal.show();
    terminal.sendText(activateCommand);

    // Clear the terminal after activating the virtual environment
    const clearCommand = 'cls';
    setTimeout(() => {
      terminal.sendText(clearCommand, true);
    }, 500); // Wait 500ms to ensure the environment is activated before clearing

    const config = vscode.workspace.getConfiguration('pythonUltimateEnv');
    const showDetailNotification = config.get<boolean>('showDetailNotification', true);
    if (showDetailNotification) {
      vscode.window.showInformationMessage('Virtual environment activated ✅');
    }
  } catch (error) {
    const config = vscode.workspace.getConfiguration('pythonUltimateEnv');
    const showDetailNotification = config.get<boolean>('showDetailNotification', true);
    if (showDetailNotification) {
      vscode.window.showErrorMessage(`Error activating virtual environment: ${(error as Error).message}`);
    }
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const disposableOnDidOpenTerminal = vscode.window.onDidOpenTerminal(
    async (terminal: vscode.Terminal) => {
      const scriptPath = await findActivateScriptInWorkspace();

      if (!scriptPath) {
        return; // Do nothing if not found
      }

      const config = vscode.workspace.getConfiguration('pythonUltimateEnv');
      const activationPreference = config.get<string>('activationPreference', 'ask');

      if (activationPreference === 'never') {
        return;
      }

      if (activationPreference === 'always') {
        // Automatically activate in all future terminals
        await activateVirtualEnv(scriptPath, terminal);
        return;
      }

      if (activateInAllTerminals) {
        // Automatically activate in all future terminals
        await activateVirtualEnv(scriptPath, terminal);
        return;
      }

      // Only show the selection box if activateInAllTerminals is false
      if (activationPreference === 'ask' && !activateInAllTerminals) {
        // Ask the user what they want to do
        const response = await vscode.window.showInformationMessage(
          'Python Virtual Environment detected. What would you like to do?',
          'Activate in All Future Terminals',
          'Activate Only in This Terminal',
          'Do Not Activate'
        );

        if (response === 'Activate in All Future Terminals') {
          activateInAllTerminals = true; // Set automatic activation for future terminals
          await activateVirtualEnv(scriptPath, terminal);
        } else if (response === 'Activate Only in This Terminal') {
          await activateVirtualEnv(scriptPath, terminal);
        } else {
          // Do not show the cancellation message when activationPreference is 'ask'
          // and the user selects 'Do Not Activate'
        }
      }
    }
  );

  const disposableOnDidCloseTerminal = vscode.window.onDidCloseTerminal(() => {
    // Reset global configuration if all terminals are closed
    if (vscode.window.terminals.length === 0) {
      activateInAllTerminals = false;
      console.log('All terminals have been closed. Resetting global state.');
    }
  });

  context.subscriptions.push(disposableOnDidOpenTerminal, disposableOnDidCloseTerminal);
}

export function deactivate(): void {
  // No additional action required
}
