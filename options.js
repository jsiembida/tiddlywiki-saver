/* include browser-options.js */

const { log } = console;
const optionsForm = document.getElementById('options-form');
const numberOfBackupsInput = document.getElementById('number-of-backups');
const sizeOfBackupsInput = document.getElementById('size-of-backups');
const downloadsShelfCheckbox = document.getElementById('hide-downloads-shelf');

function validateIntegerInput(htmlElement, defaultValue) {
  const newValue = (htmlElement.value || '').trim();
  if (newValue === '' || !htmlElement.reportValidity()) {
    return defaultValue;
  }
  const newNumber = parseInt(newValue, 10);
  return Number.isNaN(newNumber) ? defaultValue : newNumber;
}

function loadOptions() {
  sendMessage({ // eslint-disable-line no-undef
    action: 'loadOptions',
  }).then((response) => {
    log('loadOptions response:', response);
    if (response) {
      numberOfBackupsInput.value = `${response.numberOfBackups}`;
      sizeOfBackupsInput.value = response.sizeOfBackups == null ? '' : `${response.sizeOfBackups}`;
      downloadsShelfCheckbox.checked = !!response.hideDownloadsShelf;
    }
  });
}

function saveOptions() {
  sendMessage({ // eslint-disable-line no-undef
    action: 'saveOptions',
    numberOfBackups: validateIntegerInput(numberOfBackupsInput, 3),
    sizeOfBackups: validateIntegerInput(sizeOfBackupsInput, undefined),
    hideDownloadsShelf: downloadsShelfCheckbox.checked,
  }).then((response) => {
    log('saveOptions response:', response);
  });
}

optionsForm.addEventListener('submit', saveOptions);

loadOptions();
