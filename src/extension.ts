import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

let activatedTerminals = new Map<vscode.Terminal, string>();
let activateInAllTerminals = false; // Controle global para ativação automática em todos os terminais

async function findActivateScriptInWorkspace(): Promise<string | null> {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (!workspaceFolders || workspaceFolders.length === 0) {
    console.log('Nenhuma pasta aberta no workspace.');
    return null;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;

  // Listar as subpastas diretamente dentro da pasta raiz
  const subfolders = fs.readdirSync(rootPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => path.join(rootPath, dirent.name));

  for (const subfolder of subfolders) {
    // Verifica se existe o arquivo pyvenv.cfg dentro da subpasta
    const pyvenvPath = path.join(subfolder, 'pyvenv.cfg');
    if (!fs.existsSync(pyvenvPath)) {
      continue; // Não é um ambiente virtual válido
    }

    // Verifica se existe a pasta Scripts com Activate.ps1
    const scriptsPath = path.join(subfolder, 'Scripts', 'Activate.ps1');
    if (fs.existsSync(scriptsPath)) {
      console.log(`Ambiente virtual encontrado: ${scriptsPath}`);
      return scriptsPath;
    }
  }

  console.log('Nenhum ambiente virtual válido encontrado na primeira camada de subpastas.');
  return null;
}

async function activateVirtualEnv(scriptPath: string): Promise<void> {
  try {
    const terminal = vscode.window.activeTerminal || vscode.window.createTerminal();

    const isWindows = process.platform === 'win32';
    const activateCommand = isWindows
      ? `& '${scriptPath}'`
      : `. '${scriptPath}'`;

    // Envia o comando para ativar o ambiente virtual
    terminal.show();
    terminal.sendText(activateCommand);

    // Limpa o terminal após ativar o ambiente virtual
    const clearCommand = isWindows ? 'cls' : 'clear';
    setTimeout(() => {
      terminal.sendText(clearCommand, true);
    }, 500); // Aguarda 500ms para garantir que o ambiente foi ativado antes de limpar

    vscode.window.showInformationMessage('Ambiente virtual ativado ✅');
  } catch (error) {
    vscode.window.showErrorMessage(`Erro ao ativar o ambiente virtual: ${error}`);
  }
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const disposableOnDidOpenTerminal = vscode.window.onDidOpenTerminal(
    async (terminal: vscode.Terminal) => {
      const scriptPath = await findActivateScriptInWorkspace();

      if (!scriptPath) {
        return; // Se não encontrar, não faz nada
      }

	  const config = vscode.workspace.getConfiguration('pythonUltimateEnv');
      const activationPreference = config.get<string>('activationPreference', 'ask');

      if (activationPreference === 'never') {
        return; 
      }

      if (activateInAllTerminals || activationPreference === 'always') {
        // Ativar automaticamente em todos os terminais futuros
        await activateVirtualEnv(scriptPath);
        return;
      }

      // Pergunta ao usuário se deseja ativar o ambiente virtual
      const response = await vscode.window.showInformationMessage(
        'Ambiente Virtual Python Detectado. O que você deseja fazer?',
        'Ativar em Todos os Terminais Futuros',
        'Ativar Somente Neste Terminal',
        'Não Ativar'
      );

      if (response === 'Ativar em Todos os Terminais Futuros') {
        activateInAllTerminals = true; // Configura ativação automática para terminais futuros
        await activateVirtualEnv(scriptPath);
      } else if (response === 'Ativar Somente Neste Terminal') {
        await activateVirtualEnv(scriptPath);
      } else {
        vscode.window.showInformationMessage('Ativação do ambiente virtual cancelada.');
      }
    }
  );

  const disposableOnDidCloseTerminal = vscode.window.onDidCloseTerminal(() => {
    // Se todos os terminais forem fechados, reseta a configuração global
    if (vscode.window.terminals.length === 0) {
      activateInAllTerminals = false;
      console.log('Todos os terminais foram fechados. Resetando estado global.');
    }
  });

  context.subscriptions.push(disposableOnDidOpenTerminal, disposableOnDidCloseTerminal);
}

export function deactivate(): void {
  // Nenhuma ação adicional necessária
}
