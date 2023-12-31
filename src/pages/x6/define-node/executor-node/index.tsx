import classnames from 'classnames';
import { useRef } from 'react';
import { NodeMenu, NodeToolbar } from '../components';
import FormDrawer from './form-drawer';
import style from './index.less';

import type { DrawerInstance } from '@/hooks/drawer';
import type { DefineNodePropsType } from '..';

const CustomComponent = (props: DefineNodePropsType) => {
  const { graph } = props;
  const STUTES = graph?.STATUS || 'READONLY';
  const data = props.node.getData();
  const formDrawerRef = useRef<DrawerInstance>(null);

  return (
    <div className={style['flow-node-container']}>
      <div
        className={
          STUTES === 'READONLY'
            ? classnames(style['flow-node'], style.disabled)
            : style['flow-node']
        }
        style={{ borderColor: !data?.name ? '#ff5219' : '#fff' }}
        onClick={() => {
          formDrawerRef.current?.openDrawer();
        }}
      >
        <div className={style['flow-node-toolbar']}>
          <NodeToolbar {...props} />
        </div>

        <div className={style['flow-node-box']}>
          <div className={style['box-title']}>
            <img src="https://img.alicdn.com/imgextra/i1/O1CN01sI1pB01PZdOfWnFTH_!!6000000001855-55-tps-28-28.svg" />
            执行人
          </div>
          <div className={style['flow-node-content']}>
            <div className={style['flow-node-text']}>{data?.name || '--'}</div>
            <img src="https://img.alicdn.com/imgextra/i1/O1CN01o2m7uy1v0t2dUa6fc_!!6000000006111-55-tps-16-16.svg" />
          </div>
        </div>
        <div className={style.point} />
      </div>
      <NodeMenu {...props} STUTES={STUTES} />
      <FormDrawer
        ref={formDrawerRef}
        drawerInfo={{
          title: '执行人'
        }}
        nodeProps={{ ...props }}
      />
    </div>
  );
};

export default CustomComponent;
