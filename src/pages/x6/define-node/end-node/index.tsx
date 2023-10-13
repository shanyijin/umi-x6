import style from './index.less';

const CustomComponent = () => {
  return (
    <div className={style['flow-node-container']}>
      <div className={style['flow-node']}>
        <div className={style['flow-node-end-node']}>
          <div className={style['flow-node-fixed-box']}>
            <span>结束</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomComponent;
