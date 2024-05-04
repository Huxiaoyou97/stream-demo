<script setup lang="ts">
import {ref, computed} from "vue";
import {marked} from 'marked';
import CodeBlock from "./components/CodeBlock.vue";

const loading = ref(false);
const prompt = ref('写一段js快排')
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

async function fetchMOStream() {
  if (loading.value) return;
  loading.value = true;

  streamContent.value = '';
  const url = "/api/chat/v2";
  const data = {user_input: prompt.value, select_param: "modb"};

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 携带 cookies
      body: JSON.stringify(data)
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      const textChunk = decoder.decode(value, {stream: true});
      // 找到最后一个"data:"的位置 并从那里开始截取到字符串结束
      const lastIndex = textChunk.lastIndexOf('data:');
      if (lastIndex !== -1) {
        // 避免重复数据
        const text = textChunk.substring(lastIndex + 'data:'.length).replace(/\\n/g, '\n');

        // 判断text的长度知否小于streamContent.value的长度，如果小于则不更新 避免数据错乱导致页面闪动
        if (text.length >= streamContent.value.length) {
          streamContent.value = text;
        }
      }
    }
  } catch (error) {
    console.error('请求失败', error);
  } finally {
    loading.value = false;
  }
}

document.cookie = `token=Bearer%20eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMDkzIiwiZXhwIjoxNzE1MzM0NjIzLCJiaXpUeXBlIjoibW9kYiIsInJvbGVOYW1lIjoiUk9MRV9zeXMiLCJwZXJtaXNzaW9ucyI6WyJjb21wYW55IiwiZXhhbSJdfQ.7bmhkNZ_g3m4HPxKnMFa3frUOO-ZXR4kDyqeTFt4P7_cjFw-JxPcSXl9zgi_RQ-lVySxlU4VTNWszu_xSLUoMQ; token=Bearer%20eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMDkzIiwiZXhwIjoxNzE1MzM0NjIzLCJiaXpUeXBlIjoibW9kYiIsInJvbGVOYW1lIjoiUk9MRV9zeXMiLCJwZXJtaXNzaW9ucyI6WyJjb21wYW55IiwiZXhhbSJdfQ.7bmhkNZ_g3m4HPxKnMFa3frUOO-ZXR4kDyqeTFt4P7_cjFw-JxPcSXl9zgi_RQ-lVySxlU4VTNWszu_xSLUoMQ; userID=1093; JSESSIONID=62998D2614650B58775C7C65867725FD`

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
      // 找到最后一个"data:"的位置 并从那里开始截取到字符串结束
      const lastIndex = textChunk.lastIndexOf('data:');
      if (lastIndex !== -1) {
        // 避免重复数据
        const text = textChunk.substring(lastIndex + 'data:'.length).replace(/\\n/g, '\n');

        // 判断text的长度是否小于streamContent.value的长度，如果小于则不更新 避免数据错乱导致页面闪动
        if (text.length >= streamContent.value.length) {
          streamContent.value = text;
        }
      }
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
    <button @click="fetchStream">第三方请求流数据</button>
    <button @click="fetchMOStream">墨天轮请求流数据</button>
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
