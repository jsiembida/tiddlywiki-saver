const { runtime, downloads, storage } = chrome; // eslint-disable-line no-unused-vars, no-undef

function getPlatformInfo() { // eslint-disable-line no-unused-vars
  return new Promise((resolve) => {
    runtime.getPlatformInfo(resolve);
  });
}

function createDownloadUrl(content) { // eslint-disable-line no-unused-vars
  return `data:text/html,${encodeURIComponent(content)}`;
}

function removeDownloadUrl(url) { // eslint-disable-line no-unused-vars
}

function applyOptions({ hideDownloadsShelf }) { // eslint-disable-line no-unused-vars
  chrome.downloads.setShelfEnabled(!hideDownloadsShelf); // eslint-disable-line no-undef
}
