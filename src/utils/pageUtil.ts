import { Upload, notification } from 'antd';
import type { DataNode } from 'antd/lib/tree';

// 获取枚举
// export async function getEnum() {
//   const $menuData = await queryEnumUsingGET();
//   return $menuData.data;
// }

export function trim(str: string) {
  return str.trim();
}
export function getUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 数据转换
 * @param array
 * @returns
 */
export const convertArray = (array: any[]) => {
  return array.map((item: any) => {
    const convertedItem: any = {
      value: item.id,
      label: item.tag
    };
    if (item.children && item.children.length > 0) {
      convertedItem.children = convertArray(item.children);
    }
    return convertedItem;
  });
};

/**
 * 树数据转换
 * @param array
 * @returns
 */
export const convertTreeArray = (array: any[]) => {
  return array.map((item: any) => {
    const convertedItem: any = {
      key: item.id,
      title: item.tag
    };
    if (item.children && item.children.length > 0) {
      convertedItem.children = convertTreeArray(item.children);
    }
    return convertedItem;
  });
};

/**
 * 铺平树，tree-->list
 * @param data
 * @returns
 */
export const getGenerateList = (data: DataNode[]) => {
  const dataList: { key: React.Key; title: string }[] = [];
  const generateList = (gdata: DataNode[]) => {
    for (let i = 0; i < gdata.length; i++) {
      const node = gdata[i];
      const { key, title } = node;
      dataList.push({ key, title: title as string });
      if (node.children) {
        generateList(node.children);
      }
    }
  };
  generateList(data);
  return dataList;
};
/**
 * beforeUpload 限制上传文件大小
 * @param file
 * @returns
 */
export const checkFileSize = (file: any) => {
  const size = file.size / 1024 / 1024 < 1;
  if (!size) {
    notification.error({ message: '', description: '文件大小超过1M' });
  }
  return size || Upload.LIST_IGNORE;
};
