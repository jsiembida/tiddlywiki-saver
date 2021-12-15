const { runtime, downloads, storage } = browser; // eslint-disable-line no-unused-vars, no-undef

function getPlatformInfo() { // eslint-disable-line no-unused-vars
  return runtime.getPlatformInfo();
}

function createDownloadUrl(content) { // eslint-disable-line no-unused-vars
  return URL.createObjectURL(new Blob([content], { type: 'text/html' }));
}

function removeDownloadUrl(url) { // eslint-disable-line no-unused-vars
  URL.revokeObjectURL(url);
}

function applyOptions() { // eslint-disable-line no-unused-vars
}
