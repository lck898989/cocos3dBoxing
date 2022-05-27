import { _decorator, Component, Node, Vec3, RigidBody } from 'cc';
import { DamageObject } from './DamageObject';
const { ccclass, property } = _decorator;

/**
 * 
 * 可接受伤害的物体 统一接口
 * 
 */
@ccclass('IDamage')
export class IDamage extends Component {
    /** 受伤方法 */
    public hit(damage: DamageObject,pos: Vec3) {};

    /** 给受击打单位施加力 */
    public addForce(force: Vec3) {
        const rb = this.node.getComponent(RigidBody);
        if(!rb) {
            console.error("受击打对象没有刚体组件");
            return;
        }

        // rb.applyImpulse(force);
        rb.setLinearVelocity(force);
    }
}

