<template>
  <div>
    <button @click="handle">请求</button>
<!--    <div v-if="result">数据接收中...</div>-->
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";

const result = ref('');

function handle() {
  const url = "http://region-3.seetacloud.com:26885/api/v1/chat/completions";
  const data = {
    select_param: "",
    chat_mode: "chat_normal",
    model_name: "qwen_proxyllm",
    user_input: "你好",
    conv_uid: "02ab8aa4-0938-11ef-ad42-0242ac110006",
  };

  axios.post(url, data, {
    onDownloadProgress: progressEvent => {
      console.log(progressEvent.event?.target.response, '----progressEvent')
      // 处理流式数据
      // const text = progressEvent.currentTarget.response;
      // // result.value += text;
      // console.log('text', text);
    }
  }).then((res) => {
    console.log('请求完成', res);
  }).catch((error) => {
    console.error('请求失败', error);
  });
}
</script>

<style scoped>

</style>
