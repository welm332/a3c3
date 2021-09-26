"use strict"

const builder = require("electron-builder")
const Platform = builder.Platform
console.log(Platform)

// // Promise is returned
// builder.build({
//   targets: Platform.LINUX.createTarget(),
//   config: {
//     "appId": "com.example.myapp",
//     "productName": "Auto3 Linux",
//     "files": [
//       "**/*"
//     ]
//   }
// })
//   .then(() => {
//       console.log("linux builed success");
//     // handle result
//   })
//   .catch((error) => {
//       console.log("linux build failed")
//     // handle error
//   })
  
  builder.build({
  targets: Platform.WINDOWS.createTarget(),
  config: {
    "appId": "com.example.myapp",
    "productName": "Auto3 win",
    "files": [
      "**/*"
    ]
  }
})
  .then(() => {
    // handle result
    console.log("windows builed success");
  })
  .catch((error) => {
      console.log("windows builed failed");
    // handle error
  })
