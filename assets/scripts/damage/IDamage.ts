import { _decorator, Component, Node, Vec3 } from 'cc';
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
}

