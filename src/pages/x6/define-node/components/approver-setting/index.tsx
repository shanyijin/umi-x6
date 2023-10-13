import { useMemo, useState } from 'react';

import { Col, Form, Radio, Row, Select, Space, Tooltip } from 'antd';

import { QuestionCircleOutlined } from '@ant-design/icons';

import UserSelect from '../user-select';

import style from './index.less';

type RoleType = 'member' | 'role' | 'manager' | 'moreManager' | 'underManager' | 'formMember';

const ApproverSetting = () => {
  const [roleType, setRoleType] = useState<RoleType>('member');

  const roleDom = useMemo(() => {
    switch (roleType) {
      case 'member':
        return (
          <>
            <div className={style.title}>选择审批人</div>
            <Form.Item name="name">
              <UserSelect />
            </Form.Item>
          </>
        );
      case 'role':
        return (
          <>
            <div className={style.title}>选择角色</div>
            <Form.Item name="name">
              <UserSelect />
            </Form.Item>
          </>
        );
      case 'manager':
        return (
          <>
            <div className={style.title}>部门主管</div>
            <Form.Item name="name">
              <Select
                options={[
                  {
                    label: '第一级主管',
                    value: 1
                  },
                  {
                    label: '第二级主管',
                    value: 2
                  },
                  {
                    label: '第三级主管',
                    value: 3
                  },
                  {
                    label: '第四级主管',
                    value: 4
                  },
                  {
                    label: '第五级主管',
                    value: 5
                  },
                  {
                    label: '第六级主管',
                    value: 6
                  }
                ]}
              />
            </Form.Item>
            <div className={style.title}>主管过滤</div>
            <Form.Item name="nameFilter">
              <Radio.Group style={{ width: '100%' }}>
                <Row>
                  <Col span={12} style={{ marginBottom: 10 }}>
                    <Radio value="member">跳过无主管的部门</Radio>
                  </Col>
                  <Col span={12} style={{ marginBottom: 10 }}>
                    <Radio value="role">找不到主管时，由上级主管代审批</Radio>
                  </Col>
                </Row>
              </Radio.Group>
            </Form.Item>
          </>
        );
      case 'moreManager':
        return (
          <>
            <div className={style.title}>多级主管</div>
            <Row>
              <Col span={12}>
                <Form.Item name="name" style={{ marginBottom: 0 }}>
                  <Select
                    options={[
                      {
                        label: '发起人',
                        value: '1'
                      }
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={11} offset={1} style={{ lineHeight: '32px' }}>
                的连续多级主管
              </Col>
            </Row>
          </>
        );
      case 'underManager':
        return (
          <>
            <div className={style.title}>直属主管</div>
            <Row>
              <Col span={11}>
                <Form.Item name="name" style={{ marginBottom: 0 }}>
                  <Select
                    options={[
                      {
                        label: '发起人',
                        value: '1'
                      }
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={1} style={{ lineHeight: '32px', textAlign: 'center' }}>
                的
              </Col>
              <Col span={11}>
                <Form.Item name="name44" style={{ marginBottom: 0 }}>
                  <Select
                    options={[
                      {
                        label: '第一级主管',
                        value: 1
                      },
                      {
                        label: '第二级主管',
                        value: 2
                      },
                      {
                        label: '第三级主管',
                        value: 3
                      },
                      {
                        label: '第四级主管',
                        value: 4
                      },
                      {
                        label: '第五级主管',
                        value: 5
                      },
                      {
                        label: '第六级主管',
                        value: 6
                      }
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        );
      case 'formMember':
        return (
          <>
            <div className={style.title}>表单成员</div>
            <Form.Item name="name">
              <UserSelect />
            </Form.Item>
          </>
        );
      default:
        return <></>;
    }
  }, [roleType]);
  return (
    <div className={style.approverSetting}>
      <div className={style.title}>审批人设置</div>
      <Radio.Group
        onChange={(v) => {
          setRoleType(v.target.value);
        }}
      >
        <Row>
          <Col span={6} style={{ marginBottom: 10 }}>
            <Radio value="member">指定成员</Radio>
          </Col>
          <Col span={6} style={{ marginBottom: 10 }}>
            <Radio value="role">指定角色</Radio>
          </Col>
          <Col span={6} style={{ marginBottom: 10 }}>
            <Radio value="manager">部门主管</Radio>
          </Col>
          <Col span={6} style={{ marginBottom: 10 }}>
            <Radio value="moreManager">多级主管</Radio>
          </Col>
          <Col span={6} style={{ marginBottom: 10 }}>
            <Radio value="underManager">直属主管</Radio>
          </Col>
          <Col span={6} style={{ marginBottom: 10 }}>
            <Radio value="formMember" disabled>
              表单成员
            </Radio>
          </Col>
        </Row>
      </Radio.Group>

      {roleDom}
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
  );
};

export default ApproverSetting;
