// Background service worker
console.log('SABnzbd extension background service worker started');

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadAndUpload') {
    handleDownloadAndUpload(request.url, request.serverType)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
});

async function handleDownloadAndUpload(nzbUrl, serverType = 'movies') {
  try {
    // Get SABnzbd settings from storage based on server type
    const settingsKeys = serverType === 'movies' 
      ? ['moviesUrl', 'moviesApiKey', 'moviesCategory']
      : ['seriesUrl', 'seriesApiKey', 'seriesCategory'];
    
    const settings = await chrome.storage.sync.get(settingsKeys);
    
    const sabUrl = serverType === 'movies' ? settings.moviesUrl : settings.seriesUrl;
    const sabApiKey = serverType === 'movies' ? settings.moviesApiKey : settings.seriesApiKey;
    const sabCategory = serverType === 'movies' ? settings.moviesCategory : settings.seriesCategory;
    
    if (!sabUrl || !sabApiKey) {
      throw new Error(`SABnzbd ${serverType === 'movies' ? 'Movies' : 'Series'} URL and API key must be configured in extension settings`);
    }
    
    // Download the NZB file
    console.log('Downloading NZB from:', nzbUrl);
    const nzbResponse = await fetch(nzbUrl);
    
    if (!nzbResponse.ok) {
      throw new Error(`Failed to download NZB: ${nzbResponse.statusText}`);
    }
    
    // Try to get the filename from Content-Disposition header
    let filename = 'download.nzb';
    const contentDisposition = nzbResponse.headers.get('Content-Disposition');
    if (contentDisposition) {
      // Try to extract filename from header (e.g., 'attachment; filename="Movie.Name.2024.nzb"')
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=\s*(?:["']?)([^"';\n]+)/i);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].trim();
        // Ensure it ends with .nzb
        if (!filename.toLowerCase().endsWith('.nzb')) {
          filename += '.nzb';
        }
      }
    }
    
    // If no filename from header, try to extract from URL
    if (filename === 'download.nzb') {
      try {
        const urlObj = new URL(nzbUrl);
        // Check for 'title' or 'name' parameter in the URL
        const titleParam = urlObj.searchParams.get('title') || urlObj.searchParams.get('name');
        if (titleParam) {
          filename = titleParam.replace(/[^a-zA-Z0-9._-]/g, '.') + '.nzb';
        }
      } catch (e) {
        console.log('Could not parse URL for filename');
      }
    }
    
    console.log('Using filename:', filename);
    
    const nzbBlob = await nzbResponse.blob();
    const nzbData = await nzbBlob.arrayBuffer();
    const base64Nzb = arrayBufferToBase64(nzbData);
    
    // Upload to SABnzbd
    console.log(`Uploading to SABnzbd (${serverType})...`);
    const cleanSabUrl = sabUrl.replace(/\/$/, ''); // Remove trailing slash
    
    // Build the SABnzbd API URL
    const params = new URLSearchParams({
      mode: 'addfile',
      apikey: sabApiKey,
      output: 'json'
    });
    
    if (sabCategory) {
      params.append('cat', sabCategory);
    }
    
    // Create form data for the NZB upload
    const formData = new FormData();
    formData.append('name', new Blob([nzbData], { type: 'application/x-nzb' }), filename);
    
    const uploadUrl = `${cleanSabUrl}/api?${params.toString()}`;
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`SABnzbd upload failed: ${uploadResponse.statusText}`);
    }
    
    const result = await uploadResponse.json();
    
    if (result.status === false || result.error) {
      throw new Error(result.error || 'SABnzbd rejected the upload');
    }
    
    console.log('Upload successful:', result);
    return { success: true, result: result };
    
  } catch (error) {
    console.error('Error in handleDownloadAndUpload:', error);
    throw error;
  }
}

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
