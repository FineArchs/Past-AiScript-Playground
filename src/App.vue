<template>
  <div id="wrapper">
    <h1>
      AiScript (
      <MenuButton id="version" :options="menu" @select="onVersionSelect">{{
        router.currentRoute.value.params.ver
      }}</MenuButton>
      ) Playground
    </h1>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from 'vue-router'
import { versions, latest } from "@/versions/versions.ts";
import MenuButton from "@common/MenuButton.vue";

const router = useRouter();
const menu = Object.fromEntries(
  versions.map((v) => [v, v + (v == latest ? "(latest)" : "")]),
);
function onVersionSelect(v: string) {
  window.localStorage.setItem("version", v);
  router.push({ path: v });
}
</script>

<style>
:root {
  --borderThickness: 1px;
}

* {
  font-family:
    Fira code,
    Fira Mono,
    Consolas,
    Menlo,
    Courier,
    monospace;
  box-sizing: border-box;
}

html {
  background: #171717;
  color: #fff;
  tab-size: 2;
}

body {
  margin: 0;
  padding: 0;
}
</style>

<style scoped>
#wrapper {
  padding: 16px;
}
h1 {
  font-size: 1.5em;
  margin: 0 0 16px 0;
}
</style>
