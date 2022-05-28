import { _decorator, Component, Node, CCInteger } from 'cc';
import { GameManager } from '../GameManager';
import { EnemyWave } from './EnemyWave';
const { ccclass, property } = _decorator;

@ccclass('EnemyManager')
export class EnemyManager extends Component {

    /** 当前是第几波敌人 */
    public _curEnemyWave: number = 0;

    public _curEnemys: Node[] = [];

    public  totalWaves: number = 4;

    /** 关卡是否通关 */
    private _levelOver: boolean = false;

    public set levelOver(isOver: boolean) {
        this._levelOver = isOver;
        if(isOver) {
            GameManager.I.UIManager.showLevelComplete();
        }
    }

    public get levelOver() {
        return this._levelOver;
    }

    public get curEnemys() {
        return this._curEnemys;
    }

    public set curEnemyWave(waveIndex: number) {
        // if(waveIndex === this.totalWaves - 1) {

        // }
        this._curEnemyWave = waveIndex || 0;
        if(!this.node.getChildByName(`wave${waveIndex}`)) {
            return;
        }
        let childrens = this.node.children;
        for(let i = 0,len = childrens.length; i< len; i++) {
            let item = childrens[i];
            if(i === waveIndex) {
                // item.active = true;
                item.children.forEach(it => it.active = true)
                this._curEnemys = this.node.getChildByName(`wave${waveIndex}`).children;
                console.log('enemys is ',this._curEnemys);
            } else {
                item.children.forEach(it => it.active = false);
            }
        }
        
    }

    /**
     * 当前一波敌人是否消灭完毕
     */
    public curWaveIsOver() {
        return this.node.getChildByName(`wave${this.curEnemyWave}`).children.length <= 0;
    }

    public get curEnemyWave() {
        return this._curEnemyWave;
    }

    onLoad() {
        this.curEnemyWave = 0;
        this.totalWaves = this.node.children.length;
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}

