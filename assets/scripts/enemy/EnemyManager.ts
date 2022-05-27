import { _decorator, Component, Node } from 'cc';
import { EnemyWave } from './EnemyWave';
const { ccclass, property } = _decorator;

@ccclass('EnemyManager')
export class EnemyManager extends Component {

    /** 当前是第几波敌人 */
    public _curEnemyWave: number = 0;

    public _curEnemys: Node[] = [];

    public get curEnemys() {
        return this._curEnemys;
    }

    public set curEnemyWave(waveIndex: number) {
        
        this._curEnemyWave = waveIndex || 0;
        if(!this.node.getChildByName(`wave${waveIndex}`)) {
            return;
        }
        this._curEnemys = this.node.getChildByName(`wave${waveIndex}`).children;
        console.log('enemys is ',this._curEnemys);
    }

    public get curEnemyWave() {
        return this._curEnemyWave;
    }

    onLoad() {
        this.curEnemyWave = 0;
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}

