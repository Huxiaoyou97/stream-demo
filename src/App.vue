<script setup lang="ts">
import {ref, computed} from "vue";
import {marked} from 'marked';
import CodeBlock from "./components/CodeBlock.vue";

const loading = ref(false);
const prompt = ref('写一段js排序算法代码')
const streamContent = ref('');

// 渲染markdown内容
const contentBlocks = computed(() => {
  const renderer = new marked.Renderer();
  let blockIndex = 0; // 用于跟踪代码块的索引
  const blocks = []; // 存储所有块的数组

  renderer.code = (code, lang) => {
    const index = blockIndex++; // 获取当前代码块的索引
    // 将代码块信息存储到 blocks 数组中
    blocks.push({
      type: 'code',
      code: code,
      language: lang,
      index: index, // 存储索引，用于后续替换
    });
    // 返回一个特殊的占位符，包含当前代码块的索引
    return `<!--codeblock-${index}-->`;
  };

  // 使用自定义的 renderer 解析 Markdown
  const html = marked(streamContent.value, {renderer});
  let codeBlockRegex = /<!--codeblock-(\d+)-->/;

  // 将解析后的 HTML 分割成块，并存储到 blocks 数组中
  const list = html.split(/(<!--codeblock-\d+-->)/).map((part, index) => {
    if (codeBlockRegex.test(part)) {
      let match = part.match(codeBlockRegex);
      return blocks[match?.[1]];
    } else {
      return {
        type: 'html',
        html: part,
        index: index, // 存储索引，用于后续替换
      };
    }
  });
  return list;
});

async function fetchStream() {

  if (loading.value) return;
  loading.value = true;

  streamContent.value = '';
  const url = "http://region-3.seetacloud.com:26885/api/v1/chat/completions";
  const data = {
    select_param: "",
    chat_mode: "chat_normal",
    model_name: "qwen_proxyllm",
    user_input: prompt.value || '你好',
    conv_uid: "02ab8aa4-0938-11ef-ad42-0242ac110006",
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      const textChunk = decoder.decode(value, {stream: true});
      streamContent.value = textChunk.replace(/^data:/, '').replace(/\\n/g, '\n');
    }
  } catch (error) {
    console.error('请求失败', error);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <input type="text" v-model="prompt">
    <button @click="fetchStream">请求流数据</button>
    <hr>
    <p v-if="!streamContent && !loading">请开始您的提问</p>
    <div v-for="(block, index) in contentBlocks" :key="index">
      <div v-if="block.type === 'html'" v-html="block.html"></div>
      <CodeBlock
          v-else-if="block.type === 'code'"
          :code="block.code"
          :language="block.language"
      />
    </div>
    <p v-if="loading">加载中...</p>
  </div>
</template>
