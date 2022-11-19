import { TableColumnData } from "@arco-design/web-vue";

export interface Student {
  name: string;
  id?: string;
  serial?: string;
}
export interface Field {
  title: string;
  dataIndex: number;
}
export interface FileObj {
  filename: string;
  filesize: string;
  modified: string;
  ext: string;
  sheet: string;
  colcount: number;
  rowcount: number;
  fields: Field[] & TableColumnData[];
  records: Student[];
}