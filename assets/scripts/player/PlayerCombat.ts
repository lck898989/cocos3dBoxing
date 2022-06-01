import { _decorator, Component, Node, director, animation, RigidBody, CapsuleCollider, TERRAIN_HEIGHT_BASE, Vec3, CCFloat, physics, Physics2DUtils, PhysicsSystem, geometry, Prefab, NodePool, instantiate, Collider, color, SphereCollider } from 'cc';
import { DamageObject } from '../damage/DamageObject';
import { GameManager, SFXParticleType } from '../GameManager';
import { CombatKeys, Direction } from './InputManager';
import { PlayerMovement } from './PlayerMovement';
import { PlayerState, UnitStates } from '../UnitStates';
import { IDamage } from '../damage/IDamage';
import { Enemy } from '../enemy/Enemy';
import { HealthSystem } from '../common/HealthSystem';
import { Character } from '../common/Character';
import { createRandom } from '../utils/Util';
const { ccclass, property } = _decorator;

/**
 * 
 * 玩家攻击方法
 * 
 */
@ccclass('PlayerCombat')
export class PlayerCombat extends Character {
    

    @property(Prefab)
    testCube: Prefab = null;
    
    @property({type: Vec3,tooltip: "玩家的有效攻击范围"})
    attackRange: Vec3 = new Vec3(0);
    
    @property({type: CCFloat,tooltip: "玩家开始检测攻击挂点最大距离"})
    checkAttackRange: number = 2;
    
    
    @property(CCFloat)
    jumpForce: number = 2;
    
    /** 拳击组合 */
    @property({type: [DamageObject],tooltip: "拳击组合"})
    punchCombo: DamageObject[] = [];
    
    @property({type: [DamageObject],tooltip: "踢腿组合"})
    kickCombo: DamageObject[] = [];
    
    private isJumping: boolean = false;
    private hitZRange: number = 0.5;
    /** 拳击组合索引 */
    private comboIndex: number = -1;
    /** 是否继续拳击 */
    private continuePunchCombo: boolean = false;

    /** 踢腿组合索引值 */
    private kickComoIndex: number = -1;
    /** 是否继续踢腿组合 */
    private continueKickCombo: boolean = false;

    /** 最后一次攻击的伤害对象 */
    private lastAttack: DamageObject = null;
    /** 最后一次攻击的时间 */
    private lastAttackTime: number = 0;

    private capCollider: CapsuleCollider = null;

    private playerMovement: PlayerMovement = null;

    private unitState: UnitStates = null;

    /** 是否击中目标 */
    private hasTargetHit: boolean = false;

    /** 是否着地 */
    private isGround: boolean = true;

    private attackSphere: SphereCollider = null;

    private punchAttackStateList: PlayerState[] = [PlayerState.PUNCH,PlayerState.KICK];
    private kickAttackStateList: PlayerState[] = [PlayerState.PUNCH,PlayerState.KICK];

    /** 玩家可以进行攻击的状态列表组合 */
    private attackList: PlayerState[] = [
        PlayerState.IDLE,
        PlayerState.WALK,
        PlayerState.JUMP,
        PlayerState.PUNCH,
        PlayerState.KICK,
    ] 

    onLoad() {
        this.isPlayer = true;
        
        this.playerMovement = this.node.getComponent(PlayerMovement);
        this.unitState = this.node.getComponent(UnitStates);
        this.attackSphere = this.node.getChildByName('attackRange').getComponent(SphereCollider);

        console.log('shapde is ',this.attackSphere.boundingSphere);
        // this.anim.setValue("isDead",true);
    }
    

    start() {

    }

    onEnable() {
        director.on('keydown',this.combatAction,this);
        director.on('keyup',this.keyUp,this);
    }

    onDisable() {
        director.off('keydown',this.combatAction,this);
        director.off('keyup',this.keyUp,this);
    }

    keyUp(action: Direction | CombatKeys) {
        // let moveArr = [Direction.LEFT,Direction.RIGHT,Direction.UP,Direction.DOWN];
        // if(moveArr.indexOf(action as Direction) >= 0) {
        //     this.anim.setValue('walk',false);
        // }
    }

    /** 动作响应方法 */
    combatAction(action: CombatKeys) {
        if(this.isDead) return;
        /** 玩家的状态必须在可攻击的列表内 */
        if(this.attackList.indexOf(this.unitState.curState) < 0) return;

        switch(action) {
            case CombatKeys.PUNCH:
                console.log("玩家状态：",PlayerState[this.unitState.curState]);
                if(this.punchAttackStateList.indexOf(this.unitState.curState) < 0 && this.isGround) {
                    this.unitState.curState = PlayerState.PUNCH;
                    let isInAttackTime = this.lastAttack ? new Date().getTime() < this.lastAttack.duration + this.lastAttackTime + this.lastAttack.resetTime : false;
                    // 是否在攻击窗口内
                    let insideCombatWindow = this.lastAttack !== null && isInAttackTime;
                    console.log(`inWindow is ${insideCombatWindow}, lastAttack is ${this.lastAttack}, 是否在攻击窗口内：${isInAttackTime}`);
                    if(insideCombatWindow && !this.continuePunchCombo && this.comboIndex < this.punchCombo.length - 1) {
                        this.comboIndex++;
                    } else {
                        this.comboIndex = 0;
                    }

                    if(this.punchCombo[this.comboIndex]) {
                        this.doAttack(this.punchCombo[this.comboIndex],PlayerState.PUNCH,action);
                        return;
                    }
                } 
                console.log("当前状态已经是出拳状态了");

                if(this.unitState.curState === PlayerState.PUNCH && !this.continuePunchCombo && this.comboIndex < this.punchCombo.length - 1 && this.isGround) {
                    this.continuePunchCombo = true;
                    this.continueKickCombo = false;
                    return;
                }
                break;
            case CombatKeys.KICK:
                if(this.kickAttackStateList.indexOf(this.unitState.curState) < 0 && this.isGround) {
                    this.anim.setValue('kick1',true);
                    this.unitState.curState = PlayerState.KICK;
                    // 是否在攻击窗口内
                    let isKickAttackWindow = this.kickComoIndex < this.kickCombo.length && ((this.lastAttack) && (this.lastAttackTime + this.lastAttack.duration + this.lastAttack.resetTime) > new Date().getTime());
                    if(isKickAttackWindow) {
                        this.kickComoIndex++
                    } else {
                        this.kickComoIndex = 0;
                    }

                    if(this.kickCombo[this.kickComoIndex]) {
                        this.doAttack(this.kickCombo[this.kickComoIndex],PlayerState.KICK,action);
                        return;
                    }

                }
                if(this.unitState.curState === PlayerState.KICK && !this.continueKickCombo && this.kickComoIndex < this.kickCombo.length - 1 && this.isGround) {
                    this.continueKickCombo = true;
                    this.continuePunchCombo = false;
                    return;
                }

                break;
            case CombatKeys.JUMP:
                if(!this.isJumping) {
                    this.setVelocity(new Vec3(0,Vec3.UP.y * this.jumpForce,0));
                    this.anim.setValue('jump',true);
                    this.isGround = false;
                    this.isJumping = true;
                }
                break;
        }
    }

    /** 开始攻击 */
    doAttack(damageObj: DamageObject,playerState: PlayerState,inputState: CombatKeys) {
        console.log("damageobj is ",damageObj.animTrigger);
        this.anim.setValue(damageObj.animTrigger,true);
        damageObj.inflictor = this.node;

        this.unitState.curState = playerState;
        this.rb.setLinearVelocity(Vec3.ZERO);
        this.lastAttack = damageObj;
        this.lastAttackTime = new Date().getTime();
        if(playerState == PlayerState.JUMP) return;
        let id = setTimeout(() => {
            clearTimeout(id);
            this.ready();
        },damageObj.duration * 1000);
    }

    /** 前一个动作执行完毕，如果有继续输入了拳击或者脚踢的话就就绪执行下一个动作 */
    ready() {
        // 击中敌人了之后重置最后一次攻击时间
        if(!this.hasTargetHit) {
            this.continuePunchCombo = this.continueKickCombo = false;
            this.lastAttackTime = 0;
        }

        if(this.continuePunchCombo) {
            // 是否继续输入了拳击关掉
            this.continuePunchCombo = false;
            if(this.comboIndex < this.punchCombo.length - 1) {
                this.comboIndex++;
            } else {
                this.comboIndex = 0;
            }

            this.doAttack(this.punchCombo[this.comboIndex],PlayerState.PUNCH,CombatKeys.PUNCH);
            return;
        }

        if(this.continueKickCombo) {
            this.continueKickCombo = false;
            if(this.kickComoIndex < this.kickCombo.length - 1) {
                this.kickComoIndex++
            } else {
                this.kickComoIndex = 0;
            }
            this.doAttack(this.kickCombo[this.kickComoIndex],PlayerState.KICK,CombatKeys.KICK);
            return;
        }

        this.unitState.curState = PlayerState.IDLE;
    }

    /** 检查伤害 */
    checkForHit() {
        console.log("检查伤害");
        if(this.lastAttack) {
            console.log("lastAttach is ",this.lastAttack);

            const attackHeight = this.lastAttack.collHeight;
            const attackDistance = this.lastAttack.collDistance;
            const attackSize = this.lastAttack.collSize;
            const attackZRange = this.hitZRange;

            const targetPos = this.node.worldPosition.clone().add(new Vec3(attackDistance * GameManager.I.playerDir,attackHeight,-GameManager.I.playerDir * 0));
            const localTarget = this.node.position.clone().add(new Vec3(attackDistance * GameManager.I.playerDir,attackHeight,-GameManager.I.playerDir * 0));
            let ray = geometry.Ray.create(targetPos.x,targetPos.y,targetPos.z,GameManager.I.playerDir,0,0);

            // 检测该波所有敌人距离自己的距离，如果在攻击范围内就开始射线监测，否则不会进行射线检测
            const curEnemyWaveAllEnemys = GameManager.I.enemeyManager.curEnemys;
            // 这里的敌人的世界坐标为什么那么大？
            const closetEnemies = curEnemyWaveAllEnemys.filter(item => {
                const enemyComp = item.getComponent(Enemy);
                let offset = item.worldPosition.clone().subtract(this.node.worldPosition.clone()).length();
                return (offset <= this.checkAttackRange) && (enemyComp && !enemyComp.isDead);
            });

            if(closetEnemies.length === 0) {
                console.log("没有距离近的敌人，攻击无效");
                return;
            };

            let hasTarget = false;
            closetEnemies.forEach(item => {
                const collider = item.getComponent(Collider);

                let targetAABB = collider.worldBounds as geometry.AABB;
                // 创建一个虚拟盒子碰撞检测使用
                let sphere = geometry.AABB.create(targetPos.x,targetPos.y,targetPos.z,attackSize / 2,attackSize / 2,attackZRange);
                let t = geometry.intersect.aabbWithAABB(sphere,targetAABB);
                console.log(`与enemey${collider.node.name}"是否相交"`);
                if(t) {
                    hasTarget = true;
                    let damageObj = collider.node.getComponent(IDamage);
                    damageObj && damageObj.hit(this.lastAttack,targetPos);
                }
                
            })
            this.hasTargetHit = hasTarget;
        }
    }

    public hit(damage: DamageObject, pos?: Vec3) {
        if(this.isDead) return;

        // 设置主角状态
        this.unitState.curState = PlayerState.HIT;

        console.log("主角受伤",damage);
        // 减血
        this.subHeath(damage.damage);

        if(this.isDead) {
            this.anim.setValue("isDead",true);
            this.unitState.curState = PlayerState.DEATH;
            return;
        } else {
            // 播放受击打声音
            const hitAudioName = `PlayerHurt${createRandom(1,5)}`;
            GameManager.I.audioManager.playEffectByUrl(hitAudioName);
    
            // 播放受击打动画
            damage.enemyTrigger && this.anim.setValue(damage.enemyTrigger,true);

            this.addEffect(SFXParticleType.HIT);
        }
        

    }

    /**
     * 添加特效粒子
     * @param  {SFXParticleType} type
     */
     addEffect(type: SFXParticleType) {
        
        let root = this.node;
        /** 回收防御节点 */
        const recycle = () => {
            const sons = root.children;

            while(sons.length && sons.some(it => it.name == 'effect')) {
                const item = sons[sons.length - 1];
                if(item.name === 'effect') {
                    GameManager.I.getParticlePool(type).put(item);
                }
            }
        }

        recycle();
        const particleNode = GameManager.I.getParticle(type);
        particleNode.name = 'effect';

        root.addChild(particleNode);
        if(type == SFXParticleType.HIT || type == SFXParticleType.DEFEND) {
            particleNode.setWorldPosition(this.node.worldPosition.clone().add(new Vec3(GameManager.I.playerDir * 0.05,1.3,0.2)));            
        } else {
            particleNode.setWorldPosition(this.node.worldPosition.clone());            
        }
    }

    playAudio(audioName: string) {
        console.log('audioName is ',audioName);
        audioName = audioName.slice(0,1).toUpperCase() + audioName.slice(1);
        GameManager.I.audioManager.playEffectByBundleUrl('audios',audioName);
    }

    setVelocity(velocity: Vec3) {
        this.playerMovement.setVelocity(velocity);
    }

    update(deltaTime: number) {
        if(this.isJumping && this.node.position.y <= 0.1) {
            this.isGround = true;
            this.anim.setValue("jump",false);
            this.isJumping = false;
            console.log("跳跃完毕设置人物idle状态");
            this.unitState.curState = PlayerState.IDLE;
        }
    }
}

