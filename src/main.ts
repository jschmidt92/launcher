import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

import "./style.css";

// import './demos/ipc'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

const pinia = createPinia();

createApp(App)
  .use(pinia)
  .mount("#app")
  .$nextTick(() => {
    postMessage({ payload: "removeLoading" }, "*");
  });
