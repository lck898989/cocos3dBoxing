import { _decorator, Component, Node, BoxCollider, ITriggerEvent } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property,requireComponent } = _decorator;

@ccclass('EnemyWaveCollider')
@requireComponent(BoxCollider)
export class EnemyWaveCollider extends Component {
    
    private boxCollider: BoxCollider = null;

    onLoad() {
        this.boxCollider = this.node.getComponent(BoxCollider);
    }

    onEnable() {
        this.boxCollider.on("onTriggerEnter",this.playerIn,this);
    }

    onDisable() {
        this.boxCollider.on("onTriggerEnter",this.playerIn,this);
    }

    playerIn(event: ITriggerEvent) {
        /** 所有波段的敌人都已经消灭了不在处罚生成敌人的操作 */
        if(GameManager.I.enemeyManager.levelOver) return;

        if(GameManager.I.enemeyManager.curWaveIsOver()) {
            console.log("触发新的一波敌人");
            GameManager.I.enemeyManager.curEnemyWave++;
            GameManager.I.UIManager.hideNextAnimation();
        } else {
            console.log("上一波敌人没有消灭完毕");
        }
    }   
}

