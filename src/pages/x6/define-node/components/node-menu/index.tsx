import { useThrottleFn } from 'ahooks';

import { ConfigProvider, Popover } from 'antd';

import { isFunction } from 'lodash';

import { addBranch, defineAddNode } from '../../util';

import style from './style.less';

import type { DefineNodePropsType } from '../..';

import type { X6Graph } from '@/components/X6';

const NodeMenu = (props: DefineNodePropsType & { STUTES: X6Graph['STATUS'] }) => {
  const { node, STUTES } = props;
  const graph = node?.model?.graph;

  const menu = [
    {
      key: 1,
      title: '人工节点',
      node: [
        {
          key: '1-1',
          imgSrc:
            'https://img.alicdn.com/imgextra/i1/O1CN01KwtNNl1Omd0U28NEe_!!6000000001748-55-tps-28-28.svg',
          text: '审批人',
          onclick: () => {
            if (graph && node) {
              defineAddNode(graph, node, {
                height: 80,
                width: 200,
                shape: 'examine-react-node'
              });
            }
          }
        },
        {
          key: '1-2',
          imgSrc:
            'https://img.alicdn.com/imgextra/i1/O1CN01KwtNNl1Omd0U28NEe_!!6000000001748-55-tps-28-28.svg',
          text: '执行人',
          onclick: () => {
            if (graph && node) {
              defineAddNode(graph, node, {
                height: 80,
                width: 200,
                shape: 'executor-react-node'
              });
            }
          }
        },
        {
          key: '1-3',
          imgSrc:
            'https://img.alicdn.com/imgextra/i1/O1CN01KwtNNl1Omd0U28NEe_!!6000000001748-55-tps-28-28.svg',
          text: '抄送人',
          onclick: () => {
            if (graph && node) {
              defineAddNode(graph, node, {
                height: 80,
                width: 200,
                shape: 'send-react-node'
              });
            }
          }
        }
      ]
    },
    {
      key: 2,
      title: '条件节点',
node: [
    {
      key: '2-1',
      imgSrc:
        'https://img.alicdn.com/imgextra/i1/O1CN01wvPXLu1YFKNSyYwGo_!!6000000003029-55-tps-28-28.svg',
      text: '条件分支',
      onclick: () => {
        if (graph && node) {
          addBranch(graph, node);
        }
      }
    }
  ]
},
{
  key: 3,
  title: '消息节点',
  node: [
    {
      key: '3-1',
      imgSrc:
        'https://img.alicdn.com/imgextra/i1/O1CN01KwtNNl1Omd0U28NEe_!!6000000001748-55-tps-28-28.svg',
      text: '通知消息'
    },
    {
      key: '3-2',
      imgSrc:
        'https://img.alicdn.com/imgextra/i1/O1CN01KwtNNl1Omd0U28NEe_!!6000000001748-55-tps-28-28.svg',
      text: '发送邮件'
    }
  ]
},
{
  key: 6,
  title: '数据节点',
  node: [
    {
      key: '6-1',
      imgSrc:
        'https://img.alicdn.com/imgextra/i1/O1CN01KwtNNl1Omd0U28NEe_!!6000000001748-55-tps-28-28.svg',
      text: '新增数据'
    },
    {
      key: '6-2',
      imgSrc:
        'https://img.alicdn.com/imgextra/i1/O1CN01KwtNNl1Omd0U28NEe_!!6000000001748-55-tps-28-28.svg',
      text: '更新数据'
    },
    {
      key: '6-3',
      imgSrc:
        'https://img.alicdn.com/imgextra/i1/O1CN01KwtNNl1Omd0U28NEe_!!6000000001748-55-tps-28-28.svg',
      text: '删除数据'
    }
  ]
},
{
  key: 7,
  title: '卡片节点',
  node: [
    {
      key: '7-1',
      imgSrc:
        'https://img.alicdn.com/imgextra/i1/O1CN01KwtNNl1Omd0U28NEe_!!6000000001748-55-tps-28-28.svg',
      text: '发送卡片'
    },
    {
      key: '7-2',
      imgSrc:
        'https://img.alicdn.com/imgextra/i1/O1CN01KwtNNl1Omd0U28NEe_!!6000000001748-55-tps-28-28.svg',
      text: '更新卡片'
    }
  ]
}
];

const { run } = useThrottleFn(
(fn?: () => void) => {
  if (isFunction(fn)) {
    fn?.();
  }
},
{
  wait: 200
}
);


return (
      <div className={style['flow-node-handler-wrapper']} hidden={STUTES === 'READONLY'}>
        <Popover
          placement="rightTop"
          showArrow={false}
          content={
            <div className={style['node-menu']}>
              {menu.map((item) => (
                <div className={style['editor-nodes-panel-category']} key={item.key}>
                  <div className={style['editor-nodes-panel-category-title']}>人工节点</div>
                  <div className={style['editor-nodes-panel-items-container']}>
                    {item.node.map((nodeItem) => (
                      <div
                        key={nodeItem.key}
                        className={style['editor-node-panel-node']}
                        onClick={() => run(nodeItem?.onclick)}
                      >
                        < img src={nodeItem.imgSrc} />
                        <span>{nodeItem.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          }
          trigger={['hover']}
          overlayInnerStyle={{
            background: '#000',
            borderRadius: '8px',
            boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.24)'
          }}
        >
          <div className={style['flow-node-handler']}>+</div>
        </Popover>
      </div>
  );
};

export default NodeMenu;