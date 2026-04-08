## Settings modal for API key configuration

## ✅ Changes Made:

### 1. Created SettingsModal.svelte
A new modal component that allows users to:
- Enter ☁️ Ollama Cloud API Key
- Enter 🔌 OpenRouter API Key
- Save keys to localStorage (persists across sessions)
- Links to get API keys from official sources
- Environment variable instructions for developers
- Cancel and Save Settings buttons

### 2. Updated ModelSelector.svelte
- Configure buttons now open the SettingsModal instead of showing alerts
- Integrated SettingsModal component

### 3. Updated Topbar.svelte
- Added settings icon (sliders icon) in the top-right corner
- Clicking the icon opens the SettingsModal
- Settings accessible from anywhere in the app

### 4. Verified in Browser
- ✅ Settings icon visible in top bar
- ✅ Clicking settings icon opens the modal
- ✅ Modal shows API key input fields
- ✅ Links to get API keys work
- ✅ Cancel and Save buttons functional

## How it works:
1. Users click the settings icon (sliders) in the top bar
2. OR click "Configure" in the model selector dropdown
3. Settings modal opens with input fields for API keys
4. Users enter their API keys and click "Save Settings"
5. Keys are stored in localStorage for persistence
6. Developers can also set environment variables as shown in the modal