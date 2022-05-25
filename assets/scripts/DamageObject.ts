import { _decorator, Component, Node, CCFloat, CCString, CCBoolean } from 'cc';
const { ccclass, property, menu } = _decorator;

/**
 * 
 * 伤害对象
 * 
 */
@ccclass('DamageObject')
@menu("DamageObj")
export class DamageObject {

    /** 伤害值 */
    @property({type: CCFloat,tooltip: "伤害值"})
    public damage: number = 100;
    @property({type: CCFloat,tooltip: "攻击时间"})
    public duration: number = 0.2;
    @property({type: CCFloat,tooltip: "攻击重置时间"})
    public resetTime: number = 0.5;
    @property({type: CCFloat,tooltip: "技能碰撞器高度"})
    public collHeight: number = 0;
    @property({type: CCFloat,tooltip: "技能碰撞器大小"})
    public collSize: number = 0;
    @property({type: CCFloat,tooltip: "技能距离"})
    public collDistance: number = 0;

    @property({type: CCString,tooltip: "技能名称"})
    public damageName: string = 'punch1';
    @property({type: CCString,tooltip: "动作引发的触发器"})
    public animTrigger: string = 'punch1';
    @property({type: CCString,tooltip: "击打特效名称"})
    skillSFXName: string = "x"

    @property({type: CCBoolean,tooltip: "该技能是否能够击倒敌人"})
    knockdown: boolean = false;

    // @property({type: Node, tooltip: "伤害施加"})
    /** 伤害施加者 */
    inflictor: Node = null;

    constructor(damage: number,inflictor: Node) {
        this.damage = damage;
        this.inflictor = inflictor;
    }
}

