import type { FC } from 'react';
import React, { useCallback, useState } from 'react';

import { Button, Modal as AntdModal } from 'antd';

import type { ModalProps } from 'antd/lib/modal';

import _ from 'lodash';

export type UseModalType = ModalProps & {
  children: React.ReactNode;
  isDetail?: boolean;
  okText?: string;
  cancelText?: string;
  size?: 'mini' | 'small' | 'large' | 'middle' | 'page';
};

export type UseModalResultType = {
  openModal: (path?: string) => void;
  Modal: UseModalType;
  closeModal?: () => void;
  open?: boolean;
  confirmLoading?: boolean;
};
export type ModalInstance = Omit<UseModalResultType, 'Modal'>;

const useModal = () => {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const openModal = () => {
    setOpen(true);
  };
  const closeModal = () => {
    setOpen(false);
  };
  const Modal: FC<UseModalType> = useCallback((props: UseModalType) => {
    const getDefaultWidth = () => {
      const size = props.size ?? 'small';
      let result: string | number = 800;
      switch (size) {
        case 'mini':
          result = 540;
          break;
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
      onCancel,
      width = defaultWith,
      onOk,
      okText = '确认',
      destroyOnClose = true,
      isDetail = false,
      confirmLoading: antdConfiremLoading,
      ...more
    } = props;
    const cancelText = props.cancelText || (isDetail ? '关闭' : '取消');
    // 取消弹窗
    const cancelModal = async (e: React.MouseEvent<HTMLElement>) => {
      if (onCancel && _.isFunction(onCancel)) {
        await onCancel(e);
        closeModal();
      } else {
        closeModal();
    }
};
//  确定弹窗
const confirmModal = async (e: React.MouseEvent<HTMLElement>) => {
  if (onOk && _.isFunction(onOk)) {
    try {
      await setConfirmLoading(true);
      await onOk(e);
      await setConfirmLoading(false);
      await closeModal();
    } catch (error) {
      await setConfirmLoading(false);
    }
  } else {
    closeModal();
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
        onClick={onCancel}
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
        onClick={cancelModal}
        style={{ border: 'solid 1px #18af69' }}
      >
        {cancelText}
      </Button>
      <Button type="primary" onClick={confirmModal} loading={antdConfiremLoading}>
        {okText}
      </Button>
    </>
  );
};

const result = (
  <AntdModal
    {...more}
    width={width}
    onCancel={cancelModal}
    destroyOnClose={destroyOnClose}
    footer={defaultFooter()}
  >
    {children}
  </AntdModal>
);
return result;
}, []);

return {
open,
Modal,
confirmLoading,
openModal,
closeModal
};
};
export default useModal;