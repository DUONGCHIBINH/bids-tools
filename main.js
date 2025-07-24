// Fetch and render tabs and tools dynamically from tools.json
// Also handle theme toggle, tab switching, and tool-card click logic

document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const tabsContainer = document.getElementById('tabs');
  const tabContentsContainer = document.getElementById('tab-contents');
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');

  // Store tab buttons and content for later use
  let tabButtons = [];
  let tabContents = [];

  // Fetch tools.json and render UI
  fetch('tools.json')
    .then(response => response.json())
    .then(data => {
      renderTabs(data.tabs);
      renderTabContents(data.tabs);
      setupTabSwitching();
      addToolCardListeners();
    });

  // Render tab buttons
  function renderTabs(tabs) {
    tabsContainer.innerHTML = '';
    tabButtons = [];
    tabs.forEach((tab, idx) => {
      const btn = document.createElement('button');
      btn.className = 'tab' + (idx === 0 ? ' active' : '');
      btn.setAttribute('data-tab', tab.id);
      btn.textContent = tab.label;
      btn.type = 'button';
      tabsContainer.appendChild(btn);
      tabButtons.push(btn);
    });
  }

  // Render tab contents
  function renderTabContents(tabs) {
    tabContentsContainer.innerHTML = '';
    tabContents = [];
    tabs.forEach((tab, idx) => {
      const contentDiv = document.createElement('div');
      contentDiv.className = 'tab-content' + (idx === 0 ? ' active' : '');
      contentDiv.id = 'tab-' + tab.id;
      // Create tools-list container
      const toolsList = document.createElement('div');
      toolsList.className = 'tools-list';
      // Render each tool-card
      tab.tools.forEach(tool => {
        const card = document.createElement('div');
        card.className = 'tool-card';
        const h2 = document.createElement('h2');
        h2.textContent = tool.title;
        card.appendChild(h2);
        toolsList.appendChild(card);
      });
      contentDiv.appendChild(toolsList);
      tabContentsContainer.appendChild(contentDiv);
      tabContents.push(contentDiv);
    });
  }

  // Tab switching logic
  function setupTabSwitching() {
    tabButtons.forEach((btn, idx) => {
      btn.onclick = function() {
        // Remove active from all
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.remove('active'));
        // Set active for clicked
        btn.classList.add('active');
        tabContents[idx].classList.add('active');
        addToolCardListeners(); // Re-attach listeners after tab switch
      };
    });
  }

  // Toast notification function
  function showToast(message) {
    // Get the toast element
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.display = 'block';
    toast.style.opacity = '1';
    toast.style.position = 'fixed';
    toast.style.top = '82px'; // Show at top
    toast.style.right = '32px'; // Show at right
    toast.style.left = 'auto';
    toast.style.bottom = 'auto';
    toast.style.transform = 'none';
    toast.style.background = 'rgba(60,60,60,0.95)';
    toast.style.color = '#fff';
    toast.style.padding = '12px 28px';
    toast.style.borderRadius = '8px';
    toast.style.fontSize = '1rem';
    toast.style.zIndex = '9999';
    toast.style.transition = 'opacity 0.5s';
    toast.style.border = '2px solid #2563eb'; // Green border
    // Hide after 2 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 500);
    }, 2500);
  }

  // Tool-card click logic
  function addToolCardListeners() {
    tabContents.forEach((tabContent, tabIdx) => {
      const tabId = tabButtons[tabIdx].getAttribute('data-tab'); // Get tab id
      const tabUrl = window.location.origin + window.location.pathname + '#' + tabId; // Full URL for the tab
      const toolCards = tabContent.querySelectorAll('.tool-card');
      toolCards.forEach(card => {
        card.onclick = null;
        card.addEventListener('click', async function() {
          const url = await genDefaultUrl();
          console.log(url);
          if (tabContent.classList.contains('active')) {
            // Copy tab URL to clipboard
            if (navigator.clipboard) {
              navigator.clipboard.writeText(tabUrl)
                .then(() => {
                  showToast('Tab URL copied to clipboard!'); // Show toast on success
                })
                .catch(() => {
                  showToast('Failed to copy URL.');
                });
            } else {
              // Fallback for older browsers
              const textarea = document.createElement('textarea');
              // textarea.value = tabUrl;
              textarea.value = url;
              textarea.select();
              document.body.appendChild(textarea);
              try {
                document.execCommand('copy');
                showToast('Tab URL copied to clipboard!'); // Show toast on success
              } catch (e) {
                showToast('Failed to copy URL.');
              }
              document.body.removeChild(textarea);
            }
          }
        });
      });
    });
  }

  // Theme toggle logic (same as before)
  const savedTheme = localStorage.getItem('theme');
  if (!savedTheme || savedTheme === 'dark') {
    document.body.classList.add('dark');
    setIcon('sun');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark');
    setIcon('moon');
  }
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    setIcon(isDark ? 'sun' : 'moon');
  });
  function setIcon(type) {
    if (type === 'sun') {
      themeIcon.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><g><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></g></svg>';
    } else {
      themeIcon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 0111.21 3a1 1 0 00-1.13 1.32A7 7 0 1019.68 13.92a1 1 0 00-1.32-1.13A8.93 8.93 0 0121 12.79z"></path></svg>';
    }
  }
}); 

