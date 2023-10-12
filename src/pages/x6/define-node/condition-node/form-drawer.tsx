import { useDrawer } from '@/hooks';
import type { DrawerInstance } from '@/hooks/drawer';
import useForm from '@/hooks/use-form';
import { Checkbox, Form, Radio, Select, Space, Switch, Table, Tooltip } from 'antd';
import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import style from './index.less';

import { QuestionCircleOutlined } from '@ant-design/icons';
import type { DefineNodePropsType } from '..';

export interface DrawerInfoType {
  title?: string;
  data?: any;
}

type RadioType = 'APPROVED' | 'BUTTONS' | 'AUTHORITY';

export interface DrawerProps {
  drawerInfo: DrawerInfoType;
  nodeProps: DefineNodePropsType;
}

const columns = [
  {
    title: '操作按钮',
    dataIndex: 'button',
    key: 'button',
    render: (text, row) => {
      if (row.tooltip !== '') {
        return (
          <Tooltip title={row.tooltip}>
            {text}
            <span
              style={{
                color: 'rgb(169,174,179)',
                marginLeft: 6
              }}
            >
              <QuestionCircleOutlined />
            </span>
          </Tooltip>
        );
      }
      return text;
    }
  },
  {
    title: '批量审批',
    dataIndex: 'batchApproval',
    key: 'batchApproval',
    render: (text, row) => {
      if (text) {
        return (
          <Form.Item
            name={`${row.key}BatchApproval`}
            valuePropName="checked"
            initialValue={false}
            style={{ marginBottom: 0 }}
          >
            <Checkbox />
          </Form.Item>
        );
      }
      return <></>;
    }
  },
  {
    title: '启用',
    dataIndex: 'enable',
    key: 'enable',
    render: (text, row) => {
      return (
        <Form.Item
          name={`${row.key}Enable`}
          initialValue={!!text}
          style={{ marginBottom: 0 }}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      );
    }
  }
];

const DrawerDetails = forwardRef<DrawerInstance, DrawerProps>((props, ref) => {
    const { drawerInfo } = props;
    const { nodeProps } = props;
    const { node } = nodeProps;
  
    const nodeData = node.getData();
  
    const { title } = drawerInfo;
  
    const [form] = useForm();
    const { resetFields, validateFields, setFieldsValue } = form;
    const { Drawer, openDrawer, closeDrawer, open, confirmLoading } = useDrawer();
  
    const [radioType, setRadioType] = useState<RadioType>('APPROVED');
  
    const backEnableValue = Form.useWatch('backEnable', form);
  
    React.useEffect(() => {
      setFieldsValue(nodeData);
    }, [nodeData, setFieldsValue]);
  
    useImperativeHandle(ref, () => ({
      openDrawer,
      closeDrawer
    }));
  
    const onClose = useCallback(() => {
      closeDrawer();
      resetFields();
    }, [resetFields, closeDrawer]);
  
    const confirmHandle = useCallback(async () => {
      const value = await validateFields();
      node.setData(value);
      onClose();
    }, [node, onClose, validateFields]);
  
    const tableData = [
      {
        key: 'agree',
        tooltip: '',
        button: '同意',
        batchApproval: true,
        enable: true
      },
      {
        key: 'reject',
        tooltip: '若审批人操作拒绝，则审批单终止',
        button: '拒绝',
        batchApproval: true,
        enable: true
      },
      {
        key: 'transmit',
        tooltip: '',
        button: '转交',
        batchApproval: false,
        enable: false
      },
      {
        key: 'back',
        tooltip: '通过选择前面的节点进行‘退回’操作，在该节点重新进行审批。',
        button: '退回',
        batchApproval: false,
        enable: true
      }
    ];
  
    return (
      <Form
        form={form}
        // preserve={false}
      >
        <Drawer
          title="执行人"
          onClose={onClose}
          open={open}
          maskClosable={true}
          width={600}
          className={style.drawer}
          confirmLoading={confirmLoading}
          onOk={confirmHandle}
        >
          <Radio.Group
            value={radioType}
            onChange={(e) => {
              setRadioType(e.target.value);
            }}
            defaultValue="APPROVED"
buttonStyle="solid"
style={{ width: '100%' }}
>
<Radio.Button style={{ width: '33%', textAlign: 'center' }} value="APPROVED">
  <span style={{ width: '100%', fontWeight: 'bold' }}>执行人</span>
</Radio.Button>
<Radio.Button style={{ width: '33%', textAlign: 'center' }} value="BUTTONS">
  <span style={{ width: '100%', fontWeight: 'bold' }}>操作按钮</span>
</Radio.Button>
<Radio.Button style={{ width: '33%', textAlign: 'center' }} value="AUTHORITY">
  <span style={{ width: '100%', fontWeight: 'bold' }}>设置字段权限</span>
</Radio.Button>
</Radio.Group>

<div className={style.APPROVED} hidden={radioType !== 'APPROVED'}>
<div className={style.title}>选择执行人</div>
<Form.Item name="names">
  <Select
    mode="multiple"
    placeholder="请选择人员"
    options={[
      {
        label: '人员1',
        value: '人员1'
      },
      {
        label: '人员2',
        value: '人员2'
      }
    ]}
  />
</Form.Item>
<div className={style.title}>多人审批方式</div>
<Form.Item name="taskMethod" initialValue={1}>
  <Radio.Group>
    <Space direction="vertical">
      <Radio value={1}>
        或签
        <Tooltip title="一名审批人同意即可">
          <span
            style={{
              color: 'rgb(169,174,179)',
              marginLeft: 6
            }}
          >
            <QuestionCircleOutlined />
          </span>
        </Tooltip>
      </Radio>
      <Radio value={2}>
        会签
        <Tooltip title="需所有审批人同意">
          <span
            style={{
              color: 'rgb(169,174,179)',
              marginLeft: 6
  
}}
>
  <QuestionCircleOutlined />
</span>
</Tooltip>
</Radio>
</Space>
</Radio.Group>
</Form.Item>
</div>

<div hidden={radioType !== 'BUTTONS'}>
<div className={style.title}>操作按钮</div>
<Table size="small" columns={columns} pagination={false} dataSource={tableData} />
{backEnableValue ? (
<>
<div className={style.title}>退回至发起人重新提交后</div>
<Form.Item name="backMethod" initialValue={2}>
<Radio.Group>
<Radio value={1}>
重新依次审批
<Tooltip title="若流程为A-B-C，C退回至A，则C-A-B-C，且每个节点都会触发对应消息通知和业务规则。">
  <span
    style={{
      color: 'rgb(169,174,179)',
      marginLeft: 6
    }}
  >
    <QuestionCircleOutlined />
  </span>
</Tooltip>
</Radio>
<Radio value={2}>
从当前节点审批
<Tooltip title="若流程为A-B-C，C退回至A，则C-A-C，且过程不再触发消息通知和业务规则。">
  <span
    style={{
      color: 'rgb(169,174,179)',
      marginLeft: 6
    }}
  >
    <QuestionCircleOutlined />
  </span>
</Tooltip>
</Radio>
</Radio.Group>
</Form.Item>
</>
) : (
<></>
)}
</div>

<div className={style.AUTHORITY} hidden={radioType !== 'AUTHORITY'}>
<div className={style.title}>字段权限</div>
<div className={style['field-setting-title']}>
<span className={style['setting-title-label']}>组件名称</span>

<span className={style['setting-title-label']}>编辑</span>
<span className={style['setting-title-label']}>只读</span>
</div>
<div className={style['field-setting-item-check']}>
<div className={style['field-setting-item']}>
  <div className={style['field-setting-item-label']}>日期区间</div>
  <Form.Item name="fieldsStatus" initialValue={1} style={{ marginBottom: 0 }}>
    <Radio.Group>
      <Radio value={1} style={{ width: 174 }} />
      <Radio value={2} style={{ width: 150 }} />
    </Radio.Group>
  </Form.Item>
</div>
</div>
</div>
</Drawer>
</Form>
);
});

export default DrawerDetails;