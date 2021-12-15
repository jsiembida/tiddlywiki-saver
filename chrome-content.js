function sendMessage(message) { // eslint-disable-line no-unused-vars
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, resolve); // eslint-disable-line no-undef
  });
}
