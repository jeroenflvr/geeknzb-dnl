// Load saved settings
document.addEventListener('DOMContentLoaded', async () => {
  const settings = await chrome.storage.sync.get([
    'moviesUrl', 'moviesApiKey', 'moviesCategory',
    'seriesUrl', 'seriesApiKey', 'seriesCategory'
  ]);
  
  // Movies settings
  if (settings.moviesUrl) {
    document.getElementById('moviesUrl').value = settings.moviesUrl;
  }
  if (settings.moviesApiKey) {
    document.getElementById('moviesApiKey').value = settings.moviesApiKey;
  }
  if (settings.moviesCategory) {
    document.getElementById('moviesCategory').value = settings.moviesCategory;
  }
  
  // Series settings
  if (settings.seriesUrl) {
    document.getElementById('seriesUrl').value = settings.seriesUrl;
  }
  if (settings.seriesApiKey) {
    document.getElementById('seriesApiKey').value = settings.seriesApiKey;
  }
  if (settings.seriesCategory) {
    document.getElementById('seriesCategory').value = settings.seriesCategory;
  }
});

// Save settings
document.getElementById('settingsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const moviesUrl = document.getElementById('moviesUrl').value.trim();
  const moviesApiKey = document.getElementById('moviesApiKey').value.trim();
  const moviesCategory = document.getElementById('moviesCategory').value.trim();
  
  const seriesUrl = document.getElementById('seriesUrl').value.trim();
  const seriesApiKey = document.getElementById('seriesApiKey').value.trim();
  const seriesCategory = document.getElementById('seriesCategory').value.trim();
  
  await chrome.storage.sync.set({
    moviesUrl,
    moviesApiKey,
    moviesCategory,
    seriesUrl,
    seriesApiKey,
    seriesCategory
  });
  
  showStatus('Settings saved successfully!', 'success');
});

// Test connection buttons
document.querySelectorAll('.test-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const serverType = btn.dataset.server;
    const isMovies = serverType === 'movies';
    
    const sabUrl = document.getElementById(isMovies ? 'moviesUrl' : 'seriesUrl').value.trim();
    const sabApiKey = document.getElementById(isMovies ? 'moviesApiKey' : 'seriesApiKey').value.trim();
    
    if (!sabUrl || !sabApiKey) {
      showStatus(`Please fill in ${isMovies ? 'Movies' : 'Series'} SABnzbd URL and API Key first`, 'error');
      return;
    }
    
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = 'Testing...';
    
    try {
      const url = `${sabUrl.replace(/\/$/, '')}/api?mode=version&apikey=${sabApiKey}&output=json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.version) {
        showStatus(`${isMovies ? 'Movies' : 'Series'} connection successful! SABnzbd version: ${data.version}`, 'success');
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Unexpected response from SABnzbd');
      }
    } catch (error) {
      showStatus(`${isMovies ? 'Movies' : 'Series'} connection failed: ${error.message}`, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
});

function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
  
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 5000);
}
