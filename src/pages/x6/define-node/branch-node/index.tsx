import classnames from 'classnames';
import type { DefineNodePropsType } from '../components';
import { NodeMenu } from '../components';
import type { BranchesType } from '../util';
import { addCondition } from '../util';
import style from './index.less';

const CustomComponent = (props: DefineNodePropsType) => {
  const { node, graph } = props;
  const STUTES = graph?.STATUS || 'READONLY';

  const data: { branches: BranchesType[] } = node.getData();

  // 根据节点数量最多的一条分支确定高度
  const branchItemSize = data.branches.reduce(
    (obj, val) => {
      return {
        height: val.nextNodesHeight > obj.height ? val.nextNodesHeight : obj.height
      };
    },
    { height: 0 }
  );

  // 分支条件的位置，跟据当前节点位置和线条数量确定

  return (
    <div className={style['flow-branch-node-container']}>
      <div
        className={
          STUTES === 'READONLY'
            ? classnames(style['flow-branch-node'], style.disabled)
            : style['flow-branch-node']
        }
      >
        <div
          className={style['flow-node-branch-adder']}
          onClick={() => {
            if (graph && node) {
              addCondition(graph, node);
            }
          }}
        >
          添加条件
        </div>
        <div className={style['flow-branch-branch-box']}>
          {data?.branches.map((item) => {
            return (
              <div
                className={style['simple-flow-canvas-branch-item']}
                key={item.priority}
                style={{ width: item.nextNodesWidth + 80, height: branchItemSize.height + 40 + 4 }}
              >
                <div className={style['item-line']} />
              </div>
            );
          })}
        </div>
        <div className={style.point} />
      </div>
      <NodeMenu {...props} STUTES={STUTES} />
    </div>
  );
};

export default CustomComponent;