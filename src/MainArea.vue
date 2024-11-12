<template>
  <div id="root">
    <div id="grid1">
      <Editor
        v-model="script"
        :samples="v.samples"
        :parseError="syntaxErrorMessage"
        @run="run"
      />
      <Container id="logs">
        <template #header>Output</template>
        <div
          v-for="log in logs"
          class="log"
          :key="log.id"
          :class="[{ print: log.print }, log.type]"
        >
          <span class="type">{{ log.type }}</span> {{ log.text }}
        </div>
      </Container>
    </div>
    <div id="grid2">
      <Container id="ast">
        <template #header>AST</template>
        <pre>{{ ast }}</pre>
      </Container>
      <Container id="bin">
        <template #header>Bytecode</template>
        <header></header>
      </Container>
      <Container id="debugger">
        <template #header>Debugger</template>
      </Container>
    </div>
  </div>
</template>

<script lang="ts">
export type Log = {
  id: number;
  type?: string;
  text?: string;
  print?: boolean;
};
</script>
<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useStorage } from '@vueuse/core';
import Editor from "@common/Editor.vue";
import Container from "@common/Container.vue";
import { versions, vmodules, latest } from '@/versions/versions.ts';

const props = defineProps<{
  ver: (typeof versions)[number];
}>();

const v = computed(() => vmodules[props.ver]);

const vscripts = Object.fromEntries(versions.map(
  (_v) => [_v, useStorage<string>(_v, '<: "Hello, AiScript!"')]
));
const script = computed({
  get(): string { return vscripts[props.ver]!.value },
  set(newVal: string): void { vscripts[props.ver]!.value = newVal },
});
const logs = ref<Log[]>([]);
const syntaxErrorMessage = ref<string | null>(null);
const ast = computed<string>(() => {
  try {
    const _ast = v.value.parse(script.value);
    syntaxErrorMessage.value = null;
    return _ast;
  } catch (e) {
    const err = e as Error;
    syntaxErrorMessage.value = err.message;
    console.error("info" in err ? err.info : err);
    return `${err}`;
  }
});

function run() {
  logs.value = [];
  v.value.exec({
    in: (q: string) =>
      new Promise((ok) => {
        const res = window.prompt(q);
        ok(res ?? "");
      }),
    out: (l: Log) => logs.value.push(l),
    end: (l: Log) => logs.value.push(l),
    err: (e: any) => {
      console.error(e);
      window.alert(`${e}`);
    },
  });
}
</script>

<style scoped>
pre {
  margin: 0;
}

#root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  gap: 16px;
}

#grid1,
#grid2 {
  box-sizing: border-box;
  flex: 1;
  display: grid;
  gap: 16px;
  min-height: 0;
}
#grid1 > *,
#grid2 > * {
  min-height: 0;
}
#grid1 {
  grid-template-columns: 1fr 1fr;
}
#grid2 {
  grid-template-columns: 1fr 1fr 1fr;
}

#logs .log .type {
  opacity: 0.5;
  color: #fff;
}
#logs .log:not(.print) {
  opacity: 0.7;
}
#logs .log.num {
  color: #0ff;
}
#logs .log.str {
  color: #ff0;
}

#ast {
}

.actions {
  margin-left: auto;
}
</style>
