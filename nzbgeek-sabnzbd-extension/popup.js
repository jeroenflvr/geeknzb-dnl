// Check connection status on load
document.addEventListener('DOMContentLoaded', async () => {
  checkConnection();
});

// Open settings button
document.getElementById('openSettings').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

async function checkConnection() {
  const statusEl = document.getElementById('connectionStatus');
  const versionEl = document.getElementById('sabVersion');
  
  try {
    const settings = await chrome.storage.sync.get(['sabUrl', 'sabApiKey']);
    
    if (!settings.sabUrl || !settings.sabApiKey) {
      statusEl.textContent = 'Not configured';
      statusEl.className = 'status-value disconnected';
      return;
    }
    
    const url = `${settings.sabUrl.replace(/\/$/, '')}/api?mode=version&apikey=${settings.sabApiKey}&output=json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Connection failed');
    }
    
    const data = await response.json();
    
    if (data.version) {
      statusEl.textContent = 'Connected';
      statusEl.className = 'status-value connected';
      versionEl.textContent = data.version;
    } else {
      throw new Error('Invalid response');
    }
  } catch (error) {
    statusEl.textContent = 'Disconnected';
    statusEl.className = 'status-value disconnected';
    versionEl.textContent = 'N/A';
  }
}
