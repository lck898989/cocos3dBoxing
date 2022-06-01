import { _decorator, Component, Node, CCBoolean, CCFloat, Vec3, VERSION, physics, PhysicsSystem, ccenum, Enum, geometry, CapsuleCollider } from 'cc';
import { Character } from '../common/Character';
import { DamageObject } from '../damage/DamageObject';
import { IDamage } from '../damage/IDamage';
import { PlayerDirection } from '../GameManager';
import { TimerManager } from '../TimerManager';
import { PlayerState, UnitStates } from '../UnitStates';
import { clamp, createRandom, createRandomFlot } from '../utils/Util';
import { Enemy } from './Enemy';
const { ccclass, property } = _decorator;

/**
 * 
 * AI的战术战法
 * 
 */
 export enum AITactic {
    /** 进攻 黏住 */
    ENGAGE = 0,
    /** 保持近距离 */
    KEEPCLOSEDISTANCE = 1,
    /** 保持中等距离 */
    KEEPMEDIUMDISTANCE = 2,
    /** 保持远距离 */
    KEEPFARDISTANCE = 3,
    /** idle状态 */
    STANDSTILL = 4
}

export enum Range {
    ATTACKRANGE,
    CLOSERANGE,
    MIDRANGE,
    FARRANGE
}

@ccclass('EnemyAction')
export class EnemyAction extends Character {
    

    public target: Node = null;

    /** 敌人攻击列表 */
    @property({type: [DamageObject],tooltip: "伤害列表"})
    public attackList: DamageObject[] = [];
    
    /** 是否在攻击列表中随机选择一个 */
    @property({type: CCBoolean,tooltip: "是否从伤害列表中随机产生一个伤害对象"})
    public isPickAttackRandom: Boolean = true;
    /** 是否使用AI */
    @property({type: CCBoolean,tooltip: "是否使用AI"})
    public userAI: Boolean = true;
    
    /** 攻击的z轴方向上的攻击范围 */
    @property({type: CCFloat,tooltip: "所有攻击的z轴方向的距离"})
    public hitZRange: number = 1;
    
    /** 当受到攻击时候的防御概率 */
    @property({type: CCFloat,tooltip: "发生防御动作的概率"})
    public defendChance: number = 0;
    
    /** 攻击恢复时间 */
    @property({type: CCFloat,tooltip: "伤害重置时间，也即技能冷却时间"})
    public hitRecoveryTime: number = 0.5;

    public lastAttack: DamageObject = null;
    public lastAttackTime: number = 0;

    @property({type: CCFloat,tooltip: "攻击距离"})
    public attackDistance: number = 1.4;
    @property({type: CCFloat,tooltip: "近距离数值"})
    public closeDistance: number = 2;
    @property({type: CCFloat,tooltip: "中等距离数值"})
    public midDistance: number = 3;
    @property({type: CCFloat,tooltip: "远距离数值"})
    public farDistance: number = 4.5;

    /** 敌人行进速度 */
    @property({type: CCFloat,tooltip: "行进速度"})
    public walkSpeed: number = 1.9;
    @property({type: CCFloat,tooltip: "后退速度"})
    public walkBackSpeed: number = 1.2;

    /** 看见敌人的距离 10米以内可以看见 */
    @property({type: CCFloat,tooltip: "敌人视线范围"})
    public sighDistance: number = 10;

    /** 多长时间攻击一次 */
    @property({type: CCFloat,tooltip: "多长时间攻击一次"})
    public attackInterval: number = 1.2;
    
    @property({type: CCFloat,tooltip: "被击倒爬起来的时间"})
    public knockdownTimeout: number = 0;
    @property({type: CCFloat,tooltip: "击倒所需要的向上的力量"})
    public knockdownUpForce: number = 5;
    @property({type: CCFloat,tooltip: "击倒所需要水平方向上的力量"})
    public knockbackForce: number = 0;

    public range: Range = Range.FARRANGE;

    @property({type: Enum(AITactic)})
    /** 敌人的策略 */
    public enemyTactic: AITactic = AITactic.ENGAGE;

    public state: UnitStates = null;
    public curDir: PlayerDirection = PlayerDirection.LEFT;
    /** 发现目标 */
    public targetSpotted: boolean = false;
    /** 发现边缘 */
    public cliffSpotted: boolean = false;
    /** 发现墙壁 */
    public wallSpotted: boolean = false;

    public isGround: boolean = true;

    public distanceToTarget: Vec3 = new Vec3(0);
    public dirToTarget: Vec3 = new Vec3(0);

    public defendStates = [PlayerState.IDLE,PlayerState.WALK,PlayerState.DEFEND,PlayerState.ATTACK];
    public activeAIStates = [PlayerState.IDLE,PlayerState.WALK];
    /** 不能移动的状态集合 */
    public noMoveStates = [PlayerState.DEATH,PlayerState.IDLE,PlayerState.DEFEND,PlayerState.ATTACK,PlayerState.HIT,PlayerState.STANDUP];
    /** 可以攻击的状态集合 */
    public hitableStates = [PlayerState.IDLE,PlayerState.WALK,PlayerState.DEFEND,PlayerState.ATTACK,PlayerState.HIT,PlayerState.KICK,PlayerState.PUNCH,PlayerState.STANDUP];

    private distance: number = 0;

    private enemy: Enemy = null;

    private zSpread: number = 0;

    private moveDirection: Vec3 = new Vec3(0);

    private rangeMargin: number = 1;

    private direction: PlayerDirection = PlayerDirection.LEFT;

    public  targetDamageObj: Character = null;


    start() {
        this._init();
        
        this.userAI = true;
        // this.scheduleOnce(() => {
        //     this.anim.setValue("attack3",true);
        // },3)

    }

    private _init() {
        this.state = this.getComponent(UnitStates);
        // 随机化移动敌人防止敌人扎堆
        this.setRandomValues()
        this.enemy = this.node.getComponent(Enemy);
        this.setZSpread();
        console.log('walkSpeed is ',this.walkSpeed);
    }

    setZSpread() {
        this.zSpread = this.attackDistance - 0.1;   
    }

    setRandomValues() {
        this.walkSpeed = createRandomFlot(0.8,1.2);
        this.walkBackSpeed = createRandomFlot(0.7,1.5);
        this.attackInterval = createRandomFlot(2,2.5);
        this.knockdownTimeout = createRandomFlot(0.7,1.5);
        this.knockdownUpForce = createRandomFlot(3,5);
        this.knockbackForce = createRandomFlot(0.7,1.5);
    }

    update(deltaTime: number) {

        if(!this.target || this.targetDamageObj.isDead) {
            this.ready();
            return;
        } else {

            if(this.target.getComponent(IDamage))
            this.range = this.getDistanceToTarget();
        }

        if(!this.isDead) {
            // console.log('range: ',Range[this.range]);
            // console.log("状态：",PlayerState[this.state.curState]);
            if(this.activeAIStates.indexOf(this.state.curState) >= 0 && this.targetSpotted && this.userAI) {
                this.AI();
            } else {
                console.log("玩家是否在视线内：",this.distanceToTarget.length() < this.sighDistance)
                // 寻找主角 如果自己的距离到达目标点的距离小于可视范围内就认为探测到目标
                if(this.distanceToTarget.length() < this.sighDistance) this.targetSpotted = true;

            }
        }

    }

    /** 执行敌人的AI动作 */
    public AI() {
        this.turnToPlayer();

        if(this.range == Range.ATTACKRANGE) {
            if(!this.cliffSpotted) {
                const offset = new Date().getTime() - this.lastAttackTime;
                let canAttack = offset >= this.attackInterval * 1000;

                if(canAttack) {
                    console.log("可以攻击: "," offset is ",offset);
                    this.attack();
                } else {
                    this.ready();
                }
            }
        } else {
            if(this.enemyTactic == AITactic.ENGAGE) this.walkTo(this.attackDistance,this.rangeMargin);
            if(this.enemyTactic == AITactic.KEEPCLOSEDISTANCE) this.walkTo(this.closeDistance,this.rangeMargin);
            if(this.enemyTactic == AITactic.KEEPMEDIUMDISTANCE) this.walkTo(this.midDistance,this.rangeMargin);
            if(this.enemyTactic == AITactic.STANDSTILL) this.ready();
        }
    }

    /**
     * 
     * 敌人攻击方法
     * 
     */
    attack() {
        this.move(Vec3.ZERO,0);
        this.rb.setLinearVelocity(new Vec3(0));
        this.anim.setValue("walkSpeed",0);

        this.doAttack();
    }

    doAttack() {
        this.lastAttackTime = new Date().getTime();
        this.state.curState = PlayerState.ATTACK;
        let attackIndex = 0;
        if(this.isPickAttackRandom) {
            let randomAttackIndex = createRandom(1,4);
            attackIndex = randomAttackIndex - 1;
        }
        this.lastAttack = this.attackList[attackIndex];
        
        let attack = this.lastAttack;
        console.log("动画名字：",attack.animTrigger);
        let animName = attack.animTrigger;

        this.anim.setValue(animName,true);
        // setTimeout(() => {
        //     this.ready();
        // },attack.resetTime);
    }

    checkForHit() {
        console.log("检查伤害",this.lastAttack.animTrigger);
        let attack = this.lastAttack;
        let h = attack.collHeight;
        let x = attack.collDistance;
        let size = attack.collSize;

        let targetPos = this.node.worldPosition.clone().add(new Vec3(x * this.direction,h,0));

        let targetBox = this.target.getComponent(CapsuleCollider).worldBounds as geometry.AABB;
        let attackBox = geometry.AABB.create(targetPos.x,targetPos.y,targetPos.z,size / 2,size / 2,size / 2);

        let isHit = geometry.intersect.aabbWithAABB(targetBox,attackBox);
        console.log("是否击中目标",isHit);
        if(isHit) {
            const damageComp = this.target.getComponent(IDamage);
            damageComp.hit(this.lastAttack);
        }

    }

    // 向目标走去
    walkTo(distance: number,time: number) {
        this.state.curState = PlayerState.WALK;

        if(this.enemyTactic == AITactic.ENGAGE) {
            this.dirToTarget = this.target.worldPosition.clone().subtract(this.node.worldPosition.clone().add(new Vec3(0,0,clamp(0,0,this.attackDistance))));
        } else {
            this.dirToTarget = this.target.worldPosition.clone().subtract(this.node.worldPosition.clone().add(new Vec3(0,0,this.zSpread)));
        }

        // 距离主角太远 移动近一点
        if(this.distance >= distance) {
            this.moveDirection = new Vec3(this.dirToTarget.x,0,this.dirToTarget.z);
            if(this.isGround) {
                this.move(this.moveDirection.normalize(),this.walkSpeed);
                let v = new Vec3();
                this.rb.getLinearVelocity(v);
                this.anim.setValue("walkSpeed",v.length());
                return;
            }
        }

        // 距离主角太近离远一点
        if(this.distance <= distance - time) {

        }

        this.move(Vec3.ZERO,0);
        this.anim.setValue('walkSpeed',0);
    }

    
    /**
     * 根据一个给定的方向，移动节点
     * @param  {Vec3} dir
     * @param  {number} speed
     */
    private move(dir: Vec3,speed: number) {
        const rb = this.rb;
        if(this.noMoveStates.indexOf(this.state.curState) >= 0) {
            rb.setLinearVelocity(Vec3.ZERO);
        } else {
            let velocity = new Vec3(0);
            rb.getLinearVelocity(velocity);
            rb.setLinearVelocity(new Vec3(dir.x * speed,velocity.y + PhysicsSystem.instance.gravity.y * TimerManager.deltaTime,dir.z * speed));
        }

    }

    private turnToPlayer() {
        this.target && this.enemy.turnToPlayer(this.target);
        this.direction = this.enemy.direction;
    }

    /** 获取自己距离目标的距离 每一帧获取敌人和目标的距离 来给AI方法做策略制定使用 */
    getDistanceToTarget(): Range {
        if(!this.target) return Range.FARRANGE;

        this.distanceToTarget = this.target.worldPosition.clone().subtract(this.node.worldPosition.clone());
        this.distance = Vec3.distance(this.target.worldPosition,this.node.worldPosition);

        let disX = Math.abs(this.distanceToTarget.x);
        let disZ = Math.abs(this.distanceToTarget.z);

        if(disX <= this.attackDistance) {
            if(disZ < (this.hitZRange / 2)) {
                return Range.ATTACKRANGE;
            } else {
                return Range.CLOSERANGE;
            }
        }

        if(disX > this.attackDistance && disX < this.midDistance) return Range.CLOSERANGE;
        if(disX > this.closeDistance && disX < this.farDistance) return Range.MIDRANGE;
        if(disX > this.farDistance ) return Range.FARRANGE;

    }

    public hit(damage: DamageObject, pos?: Vec3) {

    }

    ready() {
        this.rb.setLinearVelocity(new Vec3(0));
        this.anim.setValue("walkSpeed",0);
        this.state.curState = PlayerState.IDLE;
        this.move(Vec3.ZERO,0);
    }
}

