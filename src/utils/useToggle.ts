import { ref, version } from "vue";

const useToggle = (value: boolean = false) => {
  const v = ref(value);
  const toggle = () => {
    v.value = !v.value;
  };
  const set = (value: boolean) => {
    v.value = value;
  };
  return { v, set, toggle };
};

export default useToggle;
