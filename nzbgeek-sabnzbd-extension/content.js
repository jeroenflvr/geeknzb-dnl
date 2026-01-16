// Content script for NZBgeek
console.log('NZBgeek to SABnzbd extension loaded');

// Function to create a SABnzbd button
function createSabButton(serverType, nzbUrl) {
  const isMovies = serverType === 'movies';
  const btn = document.createElement('button');
  btn.className = `sabnzbd-btn sabnzbd-btn-${serverType}`;
  btn.textContent = isMovies ? '🎬 Movies' : '📺 Series';
  btn.title = `Send to SABnzbd (${isMovies ? 'Movies' : 'Series'})`;
  
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const originalText = btn.textContent;
    
    // Show loading state
    btn.disabled = true;
    btn.textContent = '⏳ Sending...';
    
    try {
      // Send message to background script with server type
      const response = await chrome.runtime.sendMessage({
        action: 'downloadAndUpload',
        url: nzbUrl,
        serverType: serverType
      });
      
      if (response.success) {
        btn.textContent = '✅ Sent!';
        btn.style.backgroundColor = '#4CAF50';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.backgroundColor = '';
          btn.disabled = false;
        }, 2000);
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error:', error);
      btn.textContent = '❌ Failed';
      btn.style.backgroundColor = '#f44336';
      alert('Error: ' + error.message + `\n\nPlease check your SABnzbd ${isMovies ? 'Movies' : 'Series'} settings in the extension options.`);
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.backgroundColor = '';
        btn.disabled = false;
      }, 3000);
    }
  });
  
  return btn;
}

// Function to add SABnzbd buttons to search results
function addSABnzbdButtons() {
  // Find all NZB download links on the page
  // NZBgeek typically has download links with specific patterns
  const downloadLinks = document.querySelectorAll('a[href*="/api"][href*="t=get"], a[href*="getnzb"]');
  
  // Track processed URLs to avoid duplicates
  const processedUrls = new Set();
  
  downloadLinks.forEach(link => {
    // Skip if this link was already processed
    if (link.dataset.sabProcessed === 'true') {
      return;
    }
    
    // Skip if we've already processed this URL (different link, same NZB)
    if (processedUrls.has(link.href)) {
      link.dataset.sabProcessed = 'true';
      return;
    }
    
    // Check if container already exists in this parent
    if (link.parentElement.querySelector('.sabnzbd-btn-container')) {
      link.dataset.sabProcessed = 'true';
      return;
    }
    
    // Mark as processed
    link.dataset.sabProcessed = 'true';
    processedUrls.add(link.href);
    
    const nzbUrl = link.href;
    
    // Create container for buttons
    const btnContainer = document.createElement('span');
    btnContainer.className = 'sabnzbd-btn-container';
    
    // Create Movies button
    const moviesBtn = createSabButton('movies', nzbUrl);
    btnContainer.appendChild(moviesBtn);
    
    // Create Series button
    const seriesBtn = createSabButton('series', nzbUrl);
    btnContainer.appendChild(seriesBtn);
    
    // Insert the buttons after the download link
    link.parentElement.insertBefore(btnContainer, link.nextSibling);
  });
}

// Run when page loads
addSABnzbdButtons();

// Also watch for dynamic content changes
const observer = new MutationObserver(() => {
  addSABnzbdButtons();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
