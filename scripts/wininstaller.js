const electronInstaller = require('electron-winstaller');
  electronInstaller.createWindowsInstaller({
    appDirectory: './src',
    outputDirectory: '/build/installer64',
    authors: 'My App Inc.',
    exe: 'auto3.exe'
  });
