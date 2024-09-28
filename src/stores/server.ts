import { defineStore } from "pinia";
import { ref } from "vue";

export const useServerStore = defineStore("server", () => {
  const isServerUp = ref(false);

  function setServerStatus(status: boolean) {
    isServerUp.value = status;
  }

  return { isServerUp, setServerStatus };
});
