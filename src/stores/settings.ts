import { defineStore } from "pinia";
import { ref } from "vue";

export const useSettingsStore = defineStore("settings", () => {
  const arma3path = ref(
    localStorage.getItem("arma3path") ||
      "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Arma 3"
  );
  const serverIP = ref(localStorage.getItem("serverIP") || "127.0.0.1");
  const serverPort = ref(Number(localStorage.getItem("serverPort")) || 2302);
  const serverPassword = ref(localStorage.getItem("serverPassword") || "");

  window.electronAPI.updateSettings({
    arma3path: arma3path.value,
    serverIP: serverIP.value,
    serverPort: serverPort.value,
    serverPassword: serverPassword.value,
  });

  function updateSettings(
    path: string,
    ip: string,
    port: number,
    password: string
  ) {
    arma3path.value = path;
    serverIP.value = ip;
    serverPort.value = port;
    serverPassword.value = password;

    localStorage.setItem("arma3path", path);
    localStorage.setItem("serverIP", ip);
    localStorage.setItem("serverPort", port.toString());
    localStorage.setItem("serverPassword", password);

    window.electronAPI.updateSettings({
      arma3path: arma3path.value,
      serverIP: serverIP.value,
      serverPort: serverPort.value,
      serverPassword: serverPassword.value,
    });
  }

  return { arma3path, serverIP, serverPort, serverPassword, updateSettings };
});
