import classnames from 'classnames';
import { useRef } from 'react';
import { NodeMenu, NodeToolbar } from '../components';
import FormDrawer from './form-drawer';
import style from './index.less';

import type { DrawerInstance } from '@/hooks/drawer';
import type { DefineNodePropsType } from '..';

const CustomComponent = (props: DefineNodePropsType) => {
  const { node, graph } = props;
  const STUTES = graph?.STATUS || 'READONLY';
  const data = node.getData();
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
          if (STUTES === 'EDIT') {
            formDrawerRef.current?.openDrawer();
          }
        }}
      >
        {STUTES === 'EDIT' && !data?.lastCondition ? (
          <div className={style['flow-node-toolbar']}>
            <NodeToolbar {...props} />
          </div>
        ) : null}

        <div className={style['flow-node-box']}>
          <div className={style['title-box']}>
            <span className={style['branch-title']}>条件{data?.priority + 1}</span>
            <span className={style['branch-title-priority-name']}>优先级{data?.priority + 1}</span>
          </div>
          <div className={style['flow-node-content']}>
            <div className={style['flow-node-text']}>{data?.name || '--'}</div>
          </div>
        </div>
        <div className={style.point} />
      </div>
      <NodeMenu {...props} STUTES={STUTES} />
      <FormDrawer
        ref={formDrawerRef}
        drawerInfo={{
          title: `条件${data?.priority + 1}`
        }}
        nodeProps={{ ...props }}
      />
    </div>
  );
};

export default CustomComponent;
