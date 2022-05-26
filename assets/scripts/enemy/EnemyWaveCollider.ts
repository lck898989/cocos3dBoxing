import { _decorator, Component, Node, BoxCollider, ITriggerEvent } from 'cc';
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
        console.log("触发新的一波敌人");
    }   
}

