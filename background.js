/* include browser-background.js */

let pathSeparator = '/';
const { log } = console;

function validateInteger(currentValue, minValue, maxValue, defaultValue) {
  if (currentValue == null) {
    return defaultValue;
  }
  if (typeof currentValue !== 'number' || Number.isNaN(currentValue)) {
    return defaultValue;
  }
  if (parseInt(currentValue, 10) !== currentValue || currentValue < minValue || currentValue > maxValue) {
    return defaultValue;
  }
  return currentValue;
}

function validateOptions(options) {
  return {
    numberOfBackups: validateInteger(options.numberOfBackups, 0, 100, 3),
    sizeOfBackups: validateInteger(options.sizeOfBackups, 0, 1000, undefined),
    hideDownloadsShelf: options.hideDownloadsShelf == null ? true : !!options.hideDownloadsShelf,
  };
}

async function loadOptions() {
  return validateOptions((await storage.local.get('options')).options || {}); // eslint-disable-line no-undef
}

async function saveOptions(options) {
  await storage.local.set({ options: validateOptions(options) }); // eslint-disable-line no-undef
  options = await loadOptions(); // eslint-disable-line no-undef, no-param-reassign
  applyOptions(options); // eslint-disable-line no-undef
  return options;
}

function parsePath(path) {
  let dirName;
  let fileName;
  let fileExtension;

  let i = path.lastIndexOf(pathSeparator);
  if (i < 0) {
    dirName = '';
    fileName = path;
  } else {
    dirName = path.substring(0, i + 1);
    fileName = path.substring(i + 1);
  }
  i = fileName.lastIndexOf('.');
  if (i < 0) {
    fileExtension = '';
  } else {
    fileExtension = fileName.substring(i);
    fileName = fileName.substring(0, i);
  }
  return { dirName, fileName, fileExtension };
}

async function trimHistory(countLimit, sizeLimit, history) {
  sizeLimit = sizeLimit == null ? sizeLimit : sizeLimit * 1024 * 1024; // eslint-disable-line no-param-reassign
  history.sort((a, b) => b.timeStamp - a.timeStamp);
  let totalSize = 0;
  const retained = [];
  for (let i = 0; i < history.length; i += 1) {
    const version = history[i];
    totalSize += version.fileSize;
    if (i >= countLimit || totalSize > sizeLimit) {
      try {
        await downloads.removeFile(version.downloadId); // eslint-disable-line no-undef, no-await-in-loop
        log(`file ${version.filePath} with id ${version.id} was removed from downloads`);
      } catch (e) {
        log(`file ${version.filePath} with id ${version.id} could not be removed`);
      }
      try {
        await downloads.erase({ id: version.downloadId }); // eslint-disable-line no-undef, no-await-in-loop
        log(`file ${version.filePath} with id ${version.id} was erased from downloads`);
      } catch (e) {
        log(`file ${version.filePath} with id ${version.id} could not be erased`);
      }
    } else {
      retained.push(version);
    }
  }
  return retained;
}

async function updateHistory(countLimit, sizeLimit, path, downloadInfo) {
  const key = `backups of ${path}`;
  let history = (await storage.local.get(key))[key] || []; // eslint-disable-line no-undef
  if (downloadInfo) {
    const {
      id, downloadId, filePath, fileSize, timeStamp, parentId,
    } = downloadInfo;
    history.push({
      id, downloadId, filePath, fileSize, timeStamp, parentId,
    });
  }
  history = await trimHistory(countLimit, sizeLimit, history);
  await storage.local.set({ [key]: history }); // eslint-disable-line no-undef
}

function waitForDownload(downloadId) {
  return new Promise((resolve, reject) => {
    function listener(delta) {
      if (delta.id === downloadId && delta.state) {
        const state = delta.state.current;
        if (state === 'interrupted') {
          downloads.onChanged.removeListener(listener); // eslint-disable-line no-undef
          reject(state);
        } else if (state === 'complete') {
          downloads.onChanged.removeListener(listener); // eslint-disable-line no-undef
          resolve(state);
        }
      }
    }

    downloads.onChanged.addListener(listener); // eslint-disable-line no-undef
  });
}

async function downloadUrl(url, downloadPrefix, fileName, fileExtension, conflictAction, parentId) {
  const timeStamp = Date.now();
  // FF has a promise only version of this call in browser.downloads and a callback only version in chrome.downloads.
  // Chrome's chrome.downloads is a hybrid, it returns a promise in new manifest context if callback is not provided.
  const downloadId = await downloads.download({ // eslint-disable-line no-undef
    url, filename: downloadPrefix + fileName + fileExtension, conflictAction, saveAs: false,
  });
  await waitForDownload(downloadId);
  const downloadInfo = await downloads.search({ id: downloadId }); // eslint-disable-line no-undef
  if (downloadInfo) {
    const { filename: filePath, fileSize } = downloadInfo[0];
    const id = `${downloadId}@${timeStamp}`;
    return [
      downloadId,
      {
        id, downloadId, downloadPrefix, fileName, fileExtension, filePath, fileSize, timeStamp, parentId,
      },
    ];
  }
  return [downloadId, undefined];
}

async function saveWiki({ content, path, state }) {
  const { numberOfBackups, sizeOfBackups } = await loadOptions();
  const url = createDownloadUrl(content); // eslint-disable-line no-undef
  const { dirName, fileName, fileExtension } = parsePath(path);
  const { id: parentId } = state;
  let { downloadPrefix } = state;
  const firstSave = downloadPrefix == null;
  downloadPrefix = downloadPrefix || '';
  let downloadId;
  let downloadInfo;

  try {
    for (let i = 0; i < 2; i += 1) {
      try {
        [downloadId, downloadInfo] = await downloadUrl( // eslint-disable-line no-await-in-loop
          url, downloadPrefix, fileName, fileExtension, (firstSave && !i) ? 'uniquify' : 'overwrite', parentId,
        );

        if (!downloadId || !downloadInfo) {
          break;
        }

        log(`saved ${fileName}${fileExtension} to ${downloadInfo.filePath} with id ${downloadId}`);

        if (downloadInfo.filePath !== path) {
          // Try to re-adjust the download path.
          const { dirName: downloadDir } = parsePath(downloadInfo.filePath);
          if (dirName.indexOf(downloadDir) === 0) {
            log(`expected download dir ${dirName} matches but file name doesn't, retrying`);
            await downloads.removeFile(downloadId); // eslint-disable-line no-await-in-loop, no-undef
            downloadPrefix = dirName.substring(downloadDir.length);
            continue; // eslint-disable-line no-continue
          } else {
            log(`expected download dir ${dirName} doesn't match ${downloadDir}, giving up`);
          }
        }

        break;
      } finally {
        if (downloadId) {
          await downloads.erase({ id: downloadId }); // eslint-disable-line no-await-in-loop, no-undef
        }
      }
    }

    if (downloadInfo && downloadInfo.filePath === path) {
      let backupDownloadInfo;
      if (numberOfBackups > 0) {
        const backupName = `${downloadInfo.fileName}.${downloadInfo.timeStamp}`;
        log(`taking backup ${backupName}${downloadInfo.fileExtension}`);
        [, backupDownloadInfo] = await downloadUrl(
          url,
          downloadInfo.downloadPrefix,
          backupName,
          downloadInfo.fileExtension,
          'overwrite',
          downloadInfo.parentId,
        );
        downloadInfo = backupDownloadInfo;
      }
      await updateHistory(numberOfBackups, sizeOfBackups, path, backupDownloadInfo);
    }

    return downloadInfo;
  } finally {
    if (downloadUrl) {
      removeDownloadUrl(downloadUrl); // eslint-disable-line no-undef
    }
  }
}

function handleMessages(message, sender, sendResponse) {
  const { action } = message;
  if (action === 'saveWiki') {
    saveWiki(message).then((info) => sendResponse(info));
    return true;
  }
  if (action === 'loadOptions') {
    loadOptions().then((options) => sendResponse(options));
    return true;
  }
  if (action === 'saveOptions') {
    saveOptions(message).then((response) => sendResponse(response));
    return true;
  }
  return false;
}

runtime.onMessage.addListener(handleMessages); // eslint-disable-line no-undef
getPlatformInfo().then((info) => { // eslint-disable-line no-undef
  pathSeparator = (info.os === 'win') ? '\\' : '/';
});
loadOptions().then(applyOptions); // eslint-disable-line no-undef
