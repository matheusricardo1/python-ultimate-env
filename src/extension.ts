import * as vscode from 'vscode';

let activatedTerminals = new Map<vscode.Terminal, string>();
let activateInAllTerminals = false; // Controle global para ativação automática em todos os terminais

async function findActivateScript(): Promise<string | null> {
  const scriptName = 'Activate.ps1';
  const files = await vscode.workspace.findFiles(`**/${scriptName}`);

  if (files.length > 0) {
    console.log('Arquivo(s) encontrado(s):', files.map(file => file.fsPath));
    return files[0].fsPath; // Retorna o primeiro encontrado
  } else {
    console.log('Nenhum arquivo Activate.ps1 encontrado.');
    return null;
  }
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
      const scriptPath = await findActivateScript();

      if (!scriptPath) {
        //vscode.window.showWarningMessage('Nenhum Activate.ps1 encontrado no workspace.');
        return;
      }

      if (activateInAllTerminals) {
        // Ativar automaticamente em todos os terminais futuros
        await activateVirtualEnv(scriptPath);
        return;
      }

      // Pergunta ao usuário o que deseja fazer
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
        // Configura ativação automática para terminais futuros
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
