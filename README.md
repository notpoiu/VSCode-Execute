# VSCode Execute

A VS Code extension that executes the contents of the current opened file

> [!NOTE]
> This will most likely not work with Android Virtual Machines such as Bluestacks, Mumu, Memu, etc.
> You'd have to port forward port 6182 and execute this `getgenv().VSLink = "http://IPv4:6182/"` before u execute the connect script, i recommend just putting this ontop of the other code, make sure to replace 'IPv4' with [your actual IPv4 Address](https://api.ipify.org/).

## Installation

1. Install the extension from [the latest release](https://github.com/ActualMasterOogway/VSCode-Execute/releases/latest) and restart your Visual Studio Code
2. Put the following code into a file in your executor's autoexec folder:
```lua
-- getgenv().VSLink = "http://IPv4:6182/" -- Only uncomment if needed
loadstring(game:HttpGet("https://raw.githubusercontent.com/ActualMasterOogway/VSCode-Execute/refs/heads/main/Connect.luau"))()
```
3. In VS Code you will see a button called "Execute Code" in your status bar, everytime you press it the code of the current file you have opened will get sent to the executor and execute it.
