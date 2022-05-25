import { _decorator, Component, Node, CapsuleCollider } from 'cc';
import { DamageObject } from '../damage/DamageObject';
import { IDamage } from '../damage/IDamage';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends IDamage {

    public hit(damage: DamageObject): void {
        throw new Error('Method not implemented.');
    }

    private capsuleCollider: CapsuleCollider = null;

    onLoad() {
        this.capsuleCollider = this.node.getComponent(CapsuleCollider);
    }

    onEnable() {
        this.capsuleCollider.on('onCollisionEnter',this.collisionEnter,this);
    }

    onDisable() {

    }

    collisionEnter() {
        console.log("碰撞进入了");
    }

    start() {

    }

    

    update(deltaTime: number) {
        
    }
}

