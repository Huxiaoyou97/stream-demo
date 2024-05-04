// importScripts('https://tt.talktide.net/talktide-im/highlight.min.js');
importScripts('/highlight.min.js');

onmessage = function (e) {
    const { code, language } = e.data;
    let result;
    const validLanguage = hljs.getLanguage(language);
    if (validLanguage) {
        result = hljs.highlight(code, { language }).value;
    } else {
        result = hljs.highlightAuto(code).value;
    }
    postMessage(result); // 将计算结果发送回主线程
};
