import type { FC } from 'react';
import React, { useCallback, useState } from 'react';

import { Drawer as AntdDrawer, Button, Space } from 'antd';

import type { DrawerProps } from 'antd/lib/drawer';
import _ from 'lodash';

export type UseDrawerType = DrawerProps & {
  onOk?: () => void;
  okText?: string;
  cancelText?: string;
  isDetail?: boolean;
  drawerSize?: 'large' | 'middle' | 'small' | 'page';
  confirmLoading?: boolean;
};

export type EventType = React.KeyboardEvent<Element> | React.MouseEvent<Element, MouseEvent>;

export type UseDrawerResultType = {
  Drawer?: UseDrawerType;
  openDrawer: () => void;
  closeDrawer?: () => void;
  open?: boolean;
  defaultFooter?: React.ReactNode;
  detailFooter?: React.ReactNode;
  confirmLoading?: boolean;
};
export type DrawerInstance = Omit<UseDrawerResultType, 'Drawer'>;

const useDrawer = () => {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const openDrawer: UseDrawerResultType['openDrawer'] = () => {
    setOpen(true);
  };
  const closeDrawer: UseDrawerResultType['closeDrawer'] = () => {
    setOpen(false);
  };
  const Drawer: FC<UseDrawerType> = useCallback((props: UseDrawerType) => {
    // 为了不随便自定义抽屉的宽度我加了size控制
    const getDefaultWidth = () => {
      const size = props.drawerSize ?? 'small';
      let result: string | number = 800;
      switch (size) {
        case 'small':
          result = 800;
          break;
        case 'middle':
          result = 1000;
          break;
        case 'large':
          result = 1200;
          break;
        case 'page':
          result = '100%';
          break;
        default:
          break;
      }
      return result;
    };
    const defaultWith = getDefaultWidth();
    const {
      children,
      onClose,
      onOk,
      width = defaultWith,
      okText = '确认',
      isDetail = false,
      destroyOnClose = true,
      confirmLoading: antdConfiremLoading,
      maskClosable = false,
      ...more
    } = props;
    const cancelText = props.cancelText || (isDetail ? '关闭' : '取消');
    // 取消弹窗
    const cancelDrawer = async (e: EventType) => {
      if (onClose && _.isFunction(onClose)) {
        await onClose(e);
        closeDrawer();
      } else {
        closeDrawer();
      }
    };
    // 确定抽屉
    const confirmDrawer = async () => {
      if (onOk && _.isFunction(onOk)) {
        try {
          await setConfirmLoading(true);
          await onOk();
          await setConfirmLoading(false);
          await closeDrawer();
        } catch (error) {
          await setConfirmLoading(false);
          console.error(error);
        }
      } else {
        closeDrawer();
      }
    };
    const defaultFooter = () => {
      if (more.footer) return more.footer;

      if (more.footer === null) return null;

      if (isDetail) {
        return (
          <Button
            ghost
            className="mr-normal"
            type="primary"
            onClick={cancelDrawer}
            style={{ border: 'solid 1px #18af69' }}
          >
            关闭
          </Button>
        );
      }
      return (
        <>
          <Button
            ghost
            type="primary"
            onClick={cancelDrawer}
            style={{ border: 'solid 1px #18af69' }}
          >
            {cancelText}
          </Button>
          <Button type="primary" onClick={confirmDrawer} loading={antdConfiremLoading}>
            {okText}
          </Button>
        </>
      );
    };

    const result = (
      <AntdDrawer
        {...more}
        maskClosable={maskClosable}
        width={width}
        onClose={cancelDrawer}
        destroyOnClose={destroyOnClose}
        bodyStyle={{ backgroundColor: '#fff' }}
        footerStyle={{
          display: 'flex',
          justifyContent: 'flex-end'
        }}
        footer={defaultFooter()}
      >
        {children}
      </AntdDrawer>
    );
    return result;
  }, []);

  return {
    open,
    confirmLoading,
    openDrawer,
    closeDrawer,
    // Drawer:DrawerRef.current,
    Drawer: Drawer
};
};
export default useDrawer;
    