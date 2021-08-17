const { ipcRenderer } = require('electron');

let imgs;

document.getElementById('showPicInFolderButton').onclick = function (event) {
  const channel = 'get-files-under-the-directory';

  ipcRenderer.invoke(channel).then((imgPaths) => {
    if (imgPaths.length === 0) {
      window.alert('キャンセルが押されたか、選択したフォルダの下に適切なファイルがありませんでした。')
      return;
    }
    
    imgs = imgPaths;
    removeAllButton();
    showImg()
    setInterval(showImg, 5000);
  });
};

document.getElementById('showPicFileButton').onclick = function (event) {
  const channel = 'get-specified-img-file';

  ipcRenderer.invoke(channel).then((imgPath) => {
    if (imgPath.length === 0) {
      window.alert('キャンセルが押されたか、適切なファイルが選択されませんでした。')
      return;
    }

    imgs = imgPath;
    removeAllButton();
    showImg();
  });
};

const removeAllButton = () => {
  removeButtonById('showPicInFolderButton');
  removeButtonById('showPicFileButton');
}

const removeButtonById = (buttonId) => {
  const button = document.getElementById(buttonId);
  button.parentNode.removeChild(button);
}

const showImg = () => {
  const idx = Math.floor(Math.random() * imgs.length);
  document.getElementById('viewer').setAttribute('src', imgs[idx]);
}
