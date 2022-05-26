import { _decorator, Component, Node, BoxCollider, ITriggerEvent, Layers, CCString, SphereCollider, geometry } from 'cc';
import { IDamage } from './IDamage';
const { ccclass, property } = _decorator;

@ccclass('DamageCollider')
export class DamageCollider extends Component {

    private layer: number = -1; 
    private sphereCollider: SphereCollider = null;

    onLoad() {
        this.sphereCollider = this.node.getComponent(SphereCollider);
        this.layer = this.node.parent.layer;
        console.log("group is ",this.layer,this.node.layer);
    }

    onEnable() {
        this.sphereCollider.on("onTriggerEnter",this.triggerEnter,this);
    }

    onDisable() {

    }

    triggerEnter(event: ITriggerEvent) {
        if(event.otherCollider.node.layer === this.layer) return;
        console.log("手击中目标了");
        console.log(event.otherCollider.node.layer);

        const damageComp = event.otherCollider.node.getComponent<IDamage>(IDamage);
        // damageComp.hit();
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}

