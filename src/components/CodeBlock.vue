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

<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref, watch} from 'vue';
import IconCodeCopy from "./IconCodeCopy.vue";

// 定义props
const props = defineProps<{
  code: string;
  language?: string;
}>();

// 创建Worker实例
const worker = new Worker('/highlightWorker.js');

const codeRef = ref(props.code);
const highlightedCode = ref('');

// 监听Worker消息
worker.onmessage = function (e) {
  highlightedCode.value = e.data; // 更新计算结果
};

// 组件挂载时发送数据到Worker
onMounted(() => {
  worker.postMessage({code: codeRef.value, language: props.language});
});

// 组件卸载时终止Worker
onUnmounted(() => {
  worker.terminate();
});

// 处理props.code变化
watch(
    () => props.code,
    newVal => {
      codeRef.value = newVal;
      // 当代码更新时，发送新的代码到Worker
      worker.postMessage({code: newVal, language: props.language});
    }
);

// 定义方法
const copyCode = () => {

};
</script>

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
