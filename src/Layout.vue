<template>
  <div id="header">
    <h1>在线分组</h1>
  </div>
  <div id="main">
    <a-spin :loading="isPreparing" :tip="loadingTip" id="cardWrapper">
      <a-card hoverable id="card">
        <div id="cardContent">
          <div id="left">
            <div class="item">
              <div class="label">文件选择</div>
              <a-select
                size="large"
                v-model="filename"
                placeholder="请选择xlsx文件"
                @change="chooseFile"
              >
                <a-option
                  v-for="filename in fileList"
                  :key="filename"
                  :value="filename"
                >
                  {{ filename }}
                </a-option>
              </a-select>
            </div>
            <div class="item">
              <div class="label">分组数量</div>
              <a-slider
                :min="2"
                :max="fileObj?.rowcount"
                show-input
                :disabled="isDisabled"
                v-model="divider"
              />
            </div>
            <div class="item">
              <div class="label">洗牌次数</div>
              <a-slider
                :min="1"
                :max="10"
                show-input
                :disabled="isDisabled"
                v-model="epoch"
              />
            </div>
            <div id="pad"></div>
            <div id="btnWrapper">
              <a-button
                type="outline"
                size="large"
                @click="handleEdit"
                :disabled="isDisabled"
              >
                编辑名单
              </a-button>
              <a-button
                type="primary"
                size="large"
                @click="handleStart"
                :loading="isLoading"
                :disabled="isDisabled"
              >
                开始分组
              </a-button>
            </div>
          </div>
          <div id="right">
            <div id="infoTitle">文件信息</div>
            <a-descriptions
              v-if="fileObj != null"
              :title="fileObj.filename"
              :column="1"
            >
              <a-descriptions-item label="文件大小">
                {{ fileObj.filesize }}字节
              </a-descriptions-item>
              <a-descriptions-item label="编辑时间">
                {{ fileObj.modified }}
              </a-descriptions-item>
              <a-descriptions-item label="工作表名">
                {{ fileObj.sheet }}
              </a-descriptions-item>
              <a-descriptions-item label="字段数">
                {{ fileObj.colcount }}
              </a-descriptions-item>
              <a-descriptions-item label="记录条数">
                {{ fileObj.rowcount }}
              </a-descriptions-item>
              <a-descriptions-item label="选中人数">
                {{ selectedList.length }}
              </a-descriptions-item>
            </a-descriptions>
            <a-empty v-else>
              <span>请先选择文件</span>
            </a-empty>
          </div>
        </div>
      </a-card>
    </a-spin>
    <transition-group tag="div" name="item" id="listContent">
      <a-card
        v-for="item in selectedList"
        :key="item.id"
        :hoverable="true"
        class="animate"
      >
        <template #title>
          <div class="studentName">{{ item.name.slice(0, 1) }}**</div>
        </template>
        <div class="studentId">
          <!-- {{ item.id || "没有提供学号" }} -->
          打码
        </div>
      </a-card>
    </transition-group>
  </div>
  <div id="footer">
    <span>AsakiRain 2022</span>
  </div>
  <a-modal
    :visible="editorVisible"
    @before-ok="applyEdit"
    @cancel="cancelEdit"
    fullscreen
  >
    <template #title>名单编辑</template>
    <div id="editorContent">
      <a-spin :loading="isTableLoading" :tip="loadingTip" id="tableWrapper">
        <a-table
          v-if="fileObj != null"
          row-key="name"
          :columns="fileObj.fields"
          :data="fileObj.records"
          :row-selection="rowSelection"
          :selectedKeys="selectedKeys"
          :pagination="false"
        >
        </a-table>
      </a-spin>
    </div>
  </a-modal>
</template>
<script lang="ts" setup>
import useToggle from "@/util/useToggle";
import { TableColumnData, TableRowSelection } from "@arco-design/web-vue";
import { onMounted, ref, reactive } from "vue";
import sleep from "./util/sleep";

interface Student {
  name: string;
  id: string;
}
interface Field {
  title: string;
  dataIndex: number;
}

interface FileObj {
  filename: string;
  filesize: string;
  modified: string;
  ext: string;
  sheet: string;
  colcount: number;
  rowcount: number;
  fields: Field[];
  records: Student[];
}

const { v: isPreparing, set: setPreparing } = useToggle();
const { v: isLoading, set: setLoading } = useToggle();
const { v: isTableLoading, set: setTableLoading } = useToggle();
const { v: editorVisible, set: setEditorVisible } = useToggle();
const { v: isDisabled, set: setDisabled } = useToggle(true);

const rowSelection = reactive<TableRowSelection>({
  type: "checkbox",
  showCheckedAll: true,
  onlyCurrent: false,
});
let selectedKeys = ref<string[]>([]);
let loadingTip = ref(""); // 加载提示
let fileList = ref<string[]>([]); // 文件列表
let filename = ref(""); // 选中的文件名
let fileObj = ref<FileObj | null>(null); // 请求结果
let selectedList = ref<Student[]>([]); // 选中的学生列表
let sortingList = ref<Student[]>([]); // 排序中的的学生列表
let divider = ref(4); // 分组数量
let groups = ref<Student[][]>([]); // 分组结果
let epoch = ref(5); // 洗牌次数

onMounted(async () => {
  loadingTip.value = "正在获取文件列表";
  setPreparing(true);
  const resp = await fetch("//127.0.0.1:8080/list");
  const payload = await resp.json();
  fileList.value = payload.data.files;
  await sleep(500);
  setPreparing(false);
});

const chooseFile = async () => {
  loadingTip.value = "正在获取名单";
  setPreparing(true);
  const resp = await fetch(`//127.0.0.1:8080/read?filename=${filename.value}`);
  const payload = await resp.json();
  fileObj.value = payload.data;
  selectedList.value = payload.data.records;
  selectedList.value.forEach((record: Student) => {
    selectedKeys.value.push(record.name);
  });
  await sleep(500);
  setPreparing(false);
  setDisabled(false);
};

const handleStart = () => {
  setLoading(true);
  setDisabled(true);
  shuffle();
  setLoading(false);
  setDisabled(false);
};
const handleEdit = () => {
  setEditorVisible(true);
};
const applyEdit = async (done: () => void) => {
  loadingTip.value = "正在处理名单";
  setTableLoading(true);
  selectedList.value = fileObj.value?.records.filter((record) =>
    selectedKeys.value.includes(record.name)
  ) as Student[];
  await sleep(500);
  setTableLoading(false);
  done();
  setEditorVisible(false);
};
const cancelEdit = () => {
  setEditorVisible(false);
};

const shuffle = async () => {
  for (let i = 0; i < divider.value; i++) {
    groups.value[i] = []; //初始化分组
  }
  const len = selectedList.value.length;
  sortingList.value = selectedList.value.slice(0); //复制一份
  for (let i = 0; i < epoch.value; i++) {
    for (let j = len - 1; j >= 0; j--) {
      const index = Math.floor(Math.random() * j);
      const temp = sortingList.value[j];
      sortingList.value[j] = sortingList.value[index];
      sortingList.value[index] = temp;
    }
    selectedList.value = sortingList.value.slice(0);
    await sleep(320);
  }
};
</script>
<style lang="css">
#main {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

#header,
#footer {
  text-align: center;
  line-height: 1.5;
}
#cardWrapper {
  align-self: center;
}

#cardContent {
  display: flex;
}

#left,
#right {
  padding: 12px;
  width: 300px;
}

#left {
  display: flex;
  flex-direction: column;
}
#pad {
  flex-grow: 1;
}
#btnWrapper {
  display: flex;
  column-gap: 8px;
  justify-content: end;
}

.item {
  margin-bottom: 16px;
}

.label {
  margin-bottom: 8px;
}

#infoTitle {
  margin-bottom: 16px;
}

#editorContent {
  display: flex;
}

#tableWrapper {
  flex-grow: 1;
}

#listContent {
  margin: 24px 48px 24px 48px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-gap: 12px;
}
.item-move {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}
/* .animate {
  transition: all 1.6s cubic-bezier(0.55, 0, 0.1, 1);
} */
.item-enter-active,
.item-leave-active {
  transition: all 0.2s ease-out;
}
.item-enter-from {
  opacity: 0;
  transform: scale(0.6);
}
.item-enter-to {
  opacity: 1;
  transform: scale(1);
}
</style>
