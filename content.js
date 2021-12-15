/* include browser-content.js */

const PLUGIN_NAME = 'tiddlywiki-saver';
const { log } = console;

// Can be found at: https://TiddlyWiki.com
function isTiddlyWiki5File() {
  const elems = document.getElementsByTagName('META');
  for (let i = 0; i < elems.length; i += 1) {
    if (elems[i].content === 'TiddlyWiki') {
      return true;
    }
  }
  return false;
}

function handleSave(event) {
  const message = event.target;
  const messageBox = message.parentNode;

  const path = message.getAttribute('data-tiddlyfox-path');
  const content = message.getAttribute('data-tiddlyfox-content');
  const state = messageBox.__state__ || {}; // eslint-disable-line no-underscore-dangle

  sendMessage({ // eslint-disable-line no-undef
    action: 'saveWiki', content, path, state,
  }).then((response) => {
    log('saveWiki response:', response);
    if (response) {
      messageBox.__state__ = response; // eslint-disable-line no-underscore-dangle
      message.dispatchEvent(new Event('tiddlyfox-have-saved-file'));
    }
    messageBox.removeChild(message);
  });

  return false;
}

function injectMessageBox() {
  let messageBox = document.getElementById('tiddlyfox-message-box');

  if (messageBox) {
    const other = messageBox.getAttribute('data-message-box-creator');
    if (other !== PLUGIN_NAME) {
      alert(`${PLUGIN_NAME} has detected another plugin ${other}`);
    }
    return;
  }

  messageBox = document.createElement('div');
  messageBox.id = 'tiddlyfox-message-box';
  messageBox.style.display = 'none';
  messageBox.setAttribute('data-message-box-creator', PLUGIN_NAME);
  messageBox.addEventListener('tiddlyfox-save-file', handleSave, false);
  document.body.appendChild(messageBox);
}

if (isTiddlyWiki5File(document)) {
  injectMessageBox(document);
}
