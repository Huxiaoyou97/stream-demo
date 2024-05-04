<script setup lang="ts">
import {ref, watchEffect} from 'vue';
import hljs from 'highlight.js';
import IconCodeCopy from "./IconCodeCopy.vue";

// 定义props
const props = defineProps<{
  code: string;
  language?: string;
}>();

const highlightedCode = ref('');

// 使用watchEffect来处理代码高亮
watchEffect(() => {
  const validLanguage = hljs.getLanguage(props.language);
  if (validLanguage) {
    highlightedCode.value = hljs.highlight(props.code, {language: props.language}).value;
  } else {
    highlightedCode.value = hljs.highlightAuto(props.code).value;
  }
});

// 定义方法
const copyCode = () => {
  console.log(props.code);
};
</script>

<template>
  <div class="code-enhance light">
    <div class="code-enhance-header">
      <span class="code-enhance-title">{{ language }}</span>
      <span class="code-enhance-copy" @click="copyCode">
        <IconCodeCopy/>
        <span>复制</span>
      </span>
    </div>
    <pre
        class="code-enhance-content"
    ><code :class="['language-' + language]" v-html="highlightedCode"></code></pre>
  </div>
</template>


<style scoped lang="scss">
.code-enhance {
  width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 7px;
  overflow: hidden;

  .code-enhance-content {
    width: 100%;
    overflow: auto;
    padding: 10px;
    background-color: #ececee;
    border-radius: 0 0 6px 6px;

    code {
      display: block;
      overflow: auto;
      padding: 10px;
    }

    pre code.hljs {
      display: block;
      overflow-x: auto;
      white-space: pre; // 保持空白符的处理
      padding: 0;
    }
  }

  .code-enhance-header {
    height: 32px;
    box-sizing: border-box;
    padding: 0 16px;
    font-size: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;

    .code-enhance-title {
      -webkit-user-select: none;
      user-select: none;
    }

    .code-enhance-copy {
      display: inline-flex;
      cursor: pointer;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      word-spacing: -4px;
    }
  }

  &.light {
    .code-enhance-header {
      background: #e2e6ea;
      color: #333;
    }

    .hljs {
      color: #24292e;
      background: none;
    }

    pre code.hljs {
      display: block;
      overflow-x: auto;
      padding: 0;
    }
  }
}
</style>
