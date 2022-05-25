import { _decorator, Component, Node, director, animation, RigidBody, CapsuleCollider, TERRAIN_HEIGHT_BASE, Vec3, CCFloat, physics, Physics2DUtils, PhysicsSystem, geometry, Prefab, NodePool, instantiate, Collider, color } from 'cc';
import { DamageObject } from '../damage/DamageObject';
import { GameManager } from '../GameManager';
import { CombatKeys, Direction } from './InputManager';
import { PlayerMovement } from './PlayerMovement';
import { PlayerState, UnitStates } from '../UnitStates';
const { ccclass, property } = _decorator;

/**
 * 
 * 玩家攻击方法
 * 
 */
@ccclass('PlayerCombat')
export class PlayerCombat extends Component {

    private isJumping: boolean = false;
    
    @property({type: Node,tooltip: "左手碰撞检测挂点"})
    leftHandMountPoint: Node = null;
    @property({type: Node,tooltip: "右手碰撞检测挂点"})
    rightHandMountPoint: Node = null;

    @property(Prefab)
    testCube: Prefab = null;
    

    @property(CCFloat)
    jumpForce: number = 2;

    /** 拳击组合 */
    @property({type: [DamageObject]})
    punchCombo: DamageObject[] = [];

    private hitZRange: number = 2;
    /** 攻击组合索引 */
    private comboIndex: number = -1;
    private continuePunchCombo: boolean = false;

    /** 最后一次攻击的伤害对象 */
    private lastAttack: DamageObject = null;
    /** 最后一次攻击的时间 */
    private lastAttackTime: number = 0;

    private animController: animation.AnimationController = null;
    private rb: RigidBody = null;
    private capCollider: CapsuleCollider = null;

    private playerMovement: PlayerMovement = null;

    private unitState: UnitStates = null;

    /** 是否着地 */
    private isGround: boolean = true;

    onLoad() {
        this.animController = this.node.getComponent(animation.AnimationController);
        this.rb = this.node.getComponent(RigidBody);
        this.capCollider = this.node.getComponent(CapsuleCollider);
        this.playerMovement = this.node.getComponent(PlayerMovement);
        this.unitState = this.node.getComponent(UnitStates);

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
        //     this.animController.setValue('walk',false);
        // }
    }

    /** 动作响应方法 */
    combatAction(action: CombatKeys) {
        switch(action) {
            case CombatKeys.PUNCH:
                console.log("玩家状态：",PlayerState[this.unitState.curState]);
                if(this.unitState.curState != PlayerState.PUNCH1 && this.isGround) {
                    this.unitState.curState = PlayerState.PUNCH1;
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
                        this.doAttack(this.punchCombo[this.comboIndex],PlayerState.PUNCH1,action);
                        return;
                    }
                } 
                console.log("当前状态已经是出拳状态了");

                if(this.unitState.curState === PlayerState.PUNCH1 && !this.continuePunchCombo && this.comboIndex < this.punchCombo.length - 1 && this.isGround) {
                    this.continuePunchCombo = true;
                    return;
                }
                break;
            case CombatKeys.KICK:
                this.animController.setValue('kick1',true);
                break;
            case CombatKeys.JUMP:
                if(!this.isJumping) {
                    this.setVelocity(new Vec3(0,Vec3.UP.y * this.jumpForce,0));
                    this.animController.setValue('jump',true);
                    this.isGround = false;
                    this.isJumping = true;
                }
                break;
        }
    }

    /** 开始攻击 */
    doAttack(damageObj: DamageObject,playerState: PlayerState,inputState: CombatKeys) {
        console.log("damageobj is ",damageObj.animTrigger);
        this.animController.setValue(damageObj.animTrigger,true);
        damageObj.inflictor = this.node;

        this.addAttackBoxCollider(damageObj);

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

    addAttackBoxCollider(damageObj: DamageObject) {
        switch(damageObj.damageName) {
            case "punch1":
                const box = GameManager.I.getColliderBoxFromPool();
                const attackHeight = damageObj.collHeight;
                const attackDistance = damageObj.collDistance;
                const attackZRange = this.hitZRange;
                box.parent = this.leftHandMountPoint;
                break;
        }
    }

    /** 前一个动作执行完毕，如果有继续输入了拳击或者脚踢的话就就绪执行下一个动作 */
    ready() {
        if(this.continuePunchCombo) {
            // 是否继续输入了拳击关掉
            this.continuePunchCombo = false;
            if(this.comboIndex < this.punchCombo.length - 1) {
                this.comboIndex++;
            } else {
                this.comboIndex = 0;
            }

            this.doAttack(this.punchCombo[this.comboIndex],PlayerState.PUNCH1,CombatKeys.PUNCH);
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
            const attackZRange = this.hitZRange;

            const targetPos = this.node.worldPosition.add(new Vec3(attackDistance * GameManager.I.playerDir,attackHeight,-GameManager.I.playerDir * 0));
            const localTarget = this.node.position.add(new Vec3(attackDistance * GameManager.I.playerDir,attackHeight,-GameManager.I.playerDir * 0));
            let ray = geometry.Ray.create(targetPos.x,targetPos.y,targetPos.z,GameManager.I.playerDir,0,0);

            // 后期优化比较所有的敌人距离自己的距离最近的如果在检测范围内才开始射线检测否则不检测直接返回 没有命中敌人
            // PhysicsSystem.instance.raycastClosestResult()
            let isCollision = PhysicsSystem.instance.raycastClosest(ray);
            PhysicsSystem.instance.raycast(ray);
            console.log(PhysicsSystem.instance.raycastResults);
            if(isCollision) {
                const result: physics.PhysicsRayResult = PhysicsSystem.instance.raycastClosestResult;
                let targetAABB = result.collider.worldBounds as geometry.AABB;
                // 创建一个虚拟球
                let sphere = geometry.Sphere.create(targetPos.x,targetPos.y,targetPos.z,attackZRange);
                let isCollision = geometry.intersect.sphereAABB(sphere,targetAABB);
                console.log("是否相交",isCollision);
            }

            // let capsule = geometry
            // geometry.intersect.sphereCapsule();

            // let ray = new geometry.Ray.create(attackDistance,attackHeight,0,);
            
            // geometry.intersect.aabbWithOBB();

        
        }
    }

    playAudio(audioName: string) {
        audioName = audioName.slice(0,1).toUpperCase() + audioName.slice(1);
        GameManager.I.audioManager.playEffectByBundleUrl('audios',audioName);
    }

    addForce(force: number) {

    }

    

    setVelocity(velocity: Vec3) {
        this.playerMovement.setVelocity(velocity);
    }

    update(deltaTime: number) {
        if(this.isJumping && this.node.position.y <= 0.1) {
            this.isGround = true;
            this.animController.setValue("jump",false);
            this.isJumping = false;
            console.log("跳跃完毕设置人物idle状态");
            this.unitState.curState = PlayerState.IDLE;
        }
    }
}

