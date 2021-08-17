/**
 * ここに書かれている相対パスはプロジェクトフォルダ（pic-viewer）基準
 */

const { app, BrowserWindow } = require('electron')

function createWindow () {
  // ブラウザウインドウを作成
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // これをtrueにしないと、レンダラープロセスでrequre()が使えない
      nodeIntegration: true,
      // webSecurity: false
    },
    frame: false,
  })

  // そしてこのアプリの index.html をロード
  mainWindow.loadFile('./src/index.html')

  // 開発者ツールを開く
  // mainWindow.webContents.openDevTools()
}

// このメソッドは、Electron が初期化処理と
// browser window の作成準備が完了した時に呼び出されます。
// 一部のAPIはこのイベントが発生した後にのみ利用できます。
app.whenReady().then(createWindow)

// 全てのウィンドウが閉じられた時に終了します。
app.on('window-all-closed', () => {
  // macOSでは、ユーザが Cmd + Q で明示的に終了するまで、
  // アプリケーションとそのメニューバーは有効なままにするのが一般的です。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // macOSでは、ユーザがドックアイコンをクリックしたとき、
  // そのアプリのウインドウが無かったら再作成するのが一般的です。
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// このファイル内には、
// 残りのアプリ固有のメインプロセスコードを含めることができます。
// 別々のファイルに分割してここで require することもできます。

const fs = require('fs');
const path = require('path');
const { ipcMain } = require('electron');

const showFiles = (dirpath) => {
  // ここはsyncを使う
  // 非同期でやったらdirentsが空のまま次の処理に行って画像を一枚も取得できなかった
  const dirents = fs.readdirSync(dirpath, { withFileTypes: true });

  let res = [];
  dirents.forEach(dirent => {
    const fp = path.join(dirpath, dirent.name);
    if (dirent.isDirectory()) {
      res = res.concat(showFiles(fp));
    } else {
      res.push(fp);
    }
  });
  return res;
}

const { dialog } = require('electron');

const settings = JSON.parse(fs.readFileSync('pic-viewer-settings.json', 'utf8'));

ipcMain.handle('get-files-under-the-directory', async (event) => {
  const bw = BrowserWindow.getFocusedWindow();
  const options = {
    title: 'フォルダ選択',
    defaultPath: settings.defaultPath,
    properties:  ['openDirectory', 'dontAddToRecent']
  };

  const dirPaths = dialog.showOpenDialogSync(bw, options);

  if (typeof dirPaths === 'undefined') {
    // キャンセル時は空配列を返す
    // キャンセルされなかったが、適切なフォルダが選択されなかったときの処理と合わせるため
    return [];
  }

  const res = showFiles(dirPaths[0]).filter(file => !file.includes('.mp4'));
  return res;
});

ipcMain.handle('get-specified-img-file', async (event) => {
  const bw = BrowserWindow.getFocusedWindow();
  const options = {
    title: 'ファイル選択',
    defaultPath: settings.defaultPath,
    properties:  ['openFile', 'dontAddToRecent']
  };

  const imgPath = dialog.showOpenDialogSync(bw, options);

  if (typeof imgPath === 'undefined') {
    // キャンセル時は空配列を返す
    // キャンセルされなかったが、適切なフォルダが選択されなかったときの処理と合わせるため
    return [];
  }

  if (imgPath[0].includes('.mp4')) {
    return [];
  }

  return imgPath;
});
