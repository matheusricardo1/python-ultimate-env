# Python Ultimate Env

**Python Ultimate Env** is the ultimate extension to automate the activation of Python virtual environments in Visual Studio Code.

## Features

- **Automatic Activation:** Automatically detects and activates the Python virtual environment when opening a terminal.
- **Customizable Settings:** Choose between always activating, asking before activation, or never activating the virtual environment.
- **Detailed Notifications:** Option to show or hide detailed notifications for activation and errors.
- **Compatibility:** Currently supports **Windows (PowerShell)** environments only.

---

## Requirements

Ensure that **Python** is installed on your system. Additionally:

- A Python virtual environment must be created (e.g., using `python -m venv env`).
- The virtual environment structure should include:
  - The `pyvenv.cfg` file in the root directory of the virtual environment.
  - The `Scripts` folder (on Windows) containing the activation script `Activate.ps1`.

---

## Extension Settings

This extension provides the following settings in `settings.json`:

### `pythonUltimateEnv.activationPreference`

Define how the extension should handle Python virtual environment activation.

- **`always`** (default): Automatically activate in all future terminals.
- **`ask`**: Prompt the user before activating.
- **`never`**: Never activate automatically.

### `pythonUltimateEnv.showDetailNotification`

Control whether detailed notifications for activation and errors are shown.

- **`true`**: Show detailed notifications.
- **`false`** (default): Do not show detailed notifications.

---

### How to Configure

Add the desired settings to your `settings.json` in VS Code:

#### Set Activation Preference:

```json
// Automatically activate in all future terminals (default)
"pythonUltimateEnv.activationPreference": "always"

// Prompt the user before activating
"pythonUltimateEnv.activationPreference": "ask"

// Never activate automatically
"pythonUltimateEnv.activationPreference": "never"
