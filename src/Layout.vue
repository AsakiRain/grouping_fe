<template>
  <div id="header">
    <h1>在线分组</h1>
  </div>
  <div id="main">
    <!-- 文件选择和设置面板 -->
    <a-spin :loading="isLoading" :tip="loadingTip" id="cardWrapper">
      <a-card hoverable id="card">
        <div id="cardContent">
          <div id="left">
            <div class="formItem">
              <div class="formLabel">文件选择</div>
              <a-select
                size="large"
                v-model="filename"
                placeholder="请选择xlsx文件"
                @change="chooseFile"
                :disabled="isLoading || isPending"
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
            <div class="formItem">
              <div class="formLabel">每组人数</div>
              <a-slider
                :min="2"
                :max="fileObj?.rowcount"
                show-input
                :disabled="isLoading || isPending || isDisable"
                v-model="divider"
              />
            </div>
            <div class="formItem">
              <div class="formLabel">洗牌次数</div>
              <a-slider
                :min="1"
                :max="10"
                show-input
                :disabled="isLoading || isPending"
                v-model="epoch"
              />
            </div>
            <div class="formItem" v-if="!isDisable">
              <span>
                将分成
                <a-tag color="arcoblue">{{ count }}</a-tag>
                组
              </span>
              <span v-if="remainder !== 0">
                ，其中一组最少只有
                <a-tag color="red">{{ remainder }}</a-tag>
                人
              </span>
            </div>
            <div id="btnWrapper">
              <a-button
                type="outline"
                size="large"
                @click="handleEdit"
                :disabled="isLoading || isPending || isDisable"
              >
                编辑名单
              </a-button>
              <a-button
                type="primary"
                size="large"
                @click="handleStart"
                :loading="isPending"
                :disabled="isLoading || isDisable"
              >
                开始分组
              </a-button>
            </div>
          </div>
          <div id="right">
            <div id="infoTitle">文件信息</div>
            <MyDesc
              v-if="fileObj !== null"
              :fileObj="fileObj"
              :selectedCount="selectedCount"
            />
            <a-empty v-else>
              <span>请先选择文件</span>
            </a-empty>
          </div>
        </div>
      </a-card>
    </a-spin>
    <!-- 排序和分组容器-->
    <transition name="fade" mode="out-in">
      <SortList v-if="!isSorted" :data="selectedList" />
      <GroupList v-else :data="groups" />
    </transition>
  </div>
  <div id="footer">
    <span>AsakiRain 2022</span>
  </div>
  <a-modal
    :visible="isModalVis"
    @before-ok="applyEdit"
    @cancel="cancelEdit"
    fullscreen
  >
    <template #title>名单编辑</template>
    <div id="editorContent">
      <a-table
        v-if="fileObj != null"
        row-key="name"
        :columns="fileObj.fields"
        :data="fileObj.records"
        :row-selection="rowSelection"
        v-model:selectedKeys="selectedKeys"
        :pagination="false"
      >
      </a-table>
    </div>
  </a-modal>
</template>
<script lang="ts" setup>
import useToggle from "@/utils/useToggle";
import {
  Modal,
  TableColumnData,
  TableRowSelection,
} from "@arco-design/web-vue";
import { onMounted, ref, reactive, computed } from "vue";
import sleep from "@/utils/sleep";
import SortList from "@/components/SortList.vue";
import GroupList from "@/components/GroupList.vue";
import MyDesc from "./components/MyDesc.vue";
import type { FileObj, Student } from "@/types/types";

const { v: isLoading, set: setLoading } = useToggle(); //请求后端中的状态
const { v: isPending, set: setPending } = useToggle(); //处理任务中的状态
const { v: isDisable, set: setDisable } = useToggle(true); //禁用按钮的状态
const { v: isModalVis, set: setModalVis } = useToggle(false);
const { v: isSorted, set: setSorted } = useToggle(); //处理任务中的状态

const loadingTip = ref(""); // 加载提示

const fileList = ref<string[]>([]); // 文件列表
const filename = ref(""); // 选中的文件名
const fileObj = ref<FileObj | null>(null); // 请求结果

const rowSelection = reactive<TableRowSelection>({
  type: "checkbox",
  showCheckedAll: true,
  onlyCurrent: false,
});

const selectedKeys = ref<string[]>([]); // 选中的学生名字（表格以名字作为主键）
const selectedList = ref<Student[]>([]); // 选中的学生对象列表
const selectedCount = computed(() => selectedKeys.value.length); // 选中的学生数量

const divider = ref(4); // 每组人数
const count = computed(() => {
  return Math.ceil(selectedCount.value / divider.value);
}); // 分组数量
const remainder = computed(() => {
  return selectedCount.value % divider.value;
}); // 最后一组人数

const epoch = ref(5); // 洗牌次数

const sortingList = ref<Student[]>([]); // 排序中的的学生列表
const groups = ref<Student[][]>([]); // 分组结果

const delay = ref(0); // 重新运行分组的延迟

onMounted(async () => {
  loadingTip.value = "正在获取文件列表";
  setLoading(true);
  try {
    const resp = await fetch("/list");
    const payload = await resp.json();
    fileList.value = payload.data.files;
    await sleep(500);
  } catch (e: any) {
    console.log(e);
    Modal.error({
      title: "发生错误",
      content: e.message,
    });
  } finally {
    setLoading(false);
  }
});

const chooseFile = async () => {
  loadingTip.value = "正在获取名单";
  setLoading(true);
  setSorted(false);
  selectedKeys.value = []; // 清空上次选中的学生！！！
  delay.value = 0;  // 清空再次分组的延迟
  try {
    const resp = await fetch(`/read?filename=${filename.value}`);
    const payload = await resp.json();
    fileObj.value = payload.data;
    selectedList.value = payload.data.records;
    selectedList.value.forEach((record: Student) => {
      selectedKeys.value.push(record.name);
    });
    await sleep(500);
  } catch (e: any) {
    console.log(e);
    Modal.error({
      title: "发生错误",
      content: e.message,
    });
  } finally {
    setDisable(false);
    setLoading(false);
  }
};

const handleStart = async () => {
  setPending(true);
  await shuffle();
  setPending(false);
};

const handleEdit = () => {
  setModalVis(true);
};

const applyEdit = async (done: () => void) => {
  selectedList.value = fileObj.value?.records.filter((record) =>
    selectedKeys.value.includes(record.name)
  ) as Student[];
  await sleep(500);
  done();
  setModalVis(false);
};

const cancelEdit = () => {
  setModalVis(false);
};

const shuffle = async () => {
  if (selectedList.value.length === 0) {
    Modal.info({
      title: "提示",
      content: "没有人参与分组",
    });
    return;
  }
  setSorted(false);
  await sleep(delay.value);
  groups.value = []; // 清空上次分组结果！！！

  for (let i = 0; i < count.value; i++) {
    groups.value[i] = []; //初始化分组
  }

  sortingList.value = selectedList.value.slice(0); //复制一份
  for (let i = 0; i < epoch.value; i++) {
    for (let j = selectedCount.value - 1; j >= 0; j--) {
      const index = Math.floor(Math.random() * j);
      const temp = sortingList.value[j];
      sortingList.value[j] = sortingList.value[index];
      sortingList.value[index] = temp;
    }
    selectedList.value = sortingList.value.slice(0);
    await sleep(320);
  }

  for (let i = 0; i < selectedCount.value; i++) {
    groups.value[i % count.value].push(sortingList.value[i]);
  }

  setSorted(true);
  delay.value = 1000;
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

.formItem {
  margin-bottom: 16px;
}

.formLabel {
  margin-bottom: 8px;
}

#btnWrapper {
  display: flex;
  column-gap: 8px;
  justify-content: end;
}

#infoTitle {
  margin-bottom: 16px;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  transform: translateY(60px);
  opacity: 0.4;
}

.fade-enter-to,
.fade-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
