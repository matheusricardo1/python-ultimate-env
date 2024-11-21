# Python Ultimate Env

**Python Ultimate Env** is the ultimate extension to automate the activation of Python virtual environments in Visual Studio Code.

## Features

- **Automatic Activation:** Automatically detects and activates the Python virtual environment when opening a terminal.
- **Customizable Settings:** Choose between always activating, asking before activation, or never activating the virtual environment.
- **Compatibility:** For now, only works on Windows(powershell) environments.

### Screenshots
> Add screenshots or GIFs here to showcase how your extension works.

---

## Requirements

Ensure that **Python** is installed on your system. Additionally:
- A Python virtual environment must be created (e.g., `venv`).
- The virtual environment structure should include:
  - The `pyvenv.cfg` file in the root directory.
  - The `Scripts` folder (Windows) containing the activation script.

---

## Extension Settings

This extension provides the following settings in `settings.json`:

- **`pythonUltimateEnv.activationPreference`**
  - `always`: Automatically activate in all future terminals.
  - `ask`: Prompt the user before activating.
  - `never`: Never activate automatically.

### How to Configure:
Add the following to your `settings.json` in VS Code:
```json
"pythonUltimateEnv.activationPreference": "always"
"pythonUltimateEnv.activationPreference": "ask"
"pythonUltimateEnv.activationPreference": "never"
