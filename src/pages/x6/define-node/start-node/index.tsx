import classnames from 'classnames';
import { NodeMenu } from '../components';
import style from './index.less';

import type { DefineNodePropsType } from '..';

const CustomComponent = (props: DefineNodePropsType) => {
  const { graph } = props;
  const STUTES = graph?.STATUS || 'READONLY';
  return (
    <div className={style['flow-node-container']}>
      <div
        className={
          STUTES === 'READONLY'
            ? classnames(style['flow-node'], style.disabled)
            : style['flow-node']
        }
      >
        <div className={style['flow-node-start-node']}>
          <div className={style['flow-node-fixed-box']}>
            <img src="https://img.alicdn.com/imgextra/i1/O1CN01FNx5iH1f7Ghuots0y_!!6000000003959-55-tps-20-20.svg" />
            <span>发起</span>
            <img src="https://img.alicdn.com/imgextra/i1/O1CN01k0j4pZ1fveHWWV06s_!!6000000004069-55-tps-12-12.svg" />
          </div>
        </div>
        <div className={style.point} />
      </div>
      <NodeMenu {...props} STUTES={STUTES} />
    </div>
  );
};

export default CustomComponent;
