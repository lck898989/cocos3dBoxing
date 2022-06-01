import { _decorator, Component, Node, CapsuleCollider, animation, Prefab, Vec3, Camera, instantiate, ParticleSystem, tween, Tween, Material, SkinnedMeshRenderer, game, director, NodePool, RigidBody, geometry, Game, Layers, ICollisionEvent, physics, PhysicsSystem, Collider2D, Quat, CapsuleColliderComponent } from 'cc';
import { ShakeCamera } from '../camera/ShakeCamera';
import { CollisionConst } from '../CollisionConst';
import { Character } from '../common/Character';
import { HealthSystem } from '../common/HealthSystem';
import { DamageObject } from '../damage/DamageObject';
import { IDamage } from '../damage/IDamage';
import { GameManager, PlayerDirection, SFXParticleType } from '../GameManager';
import { PlayerState, UnitStates } from '../UnitStates';
import { createRandom } from '../utils/Util';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('Enemy')
@requireComponent(animation.AnimationController)
@requireComponent(CapsuleCollider)
@requireComponent(RigidBody)
export class Enemy extends Character {

    public direction: PlayerDirection = PlayerDirection.LEFT;

    private renderComp: SkinnedMeshRenderer = null;
    
    public enemyStatus: UnitStates = null;

    /** 是否着地 */
    public isGround: boolean = true;

    private defendRoot: Node = null;

    /** 水平方向上的力 */
    private horizonForce: number = 0.6;
    /** 竖直方向上的力 */
    public upForce: number = 5;

    private particleNodeMap: Map<SFXParticleType,string> = new Map();

    onLoad() {
        this.isPlayer = false;
        this._initParticleNodeMap();
        // this.capsuleCollider = this.node.getComponent(CapsuleCollider);
        this.capsuleCollider.addMask(CollisionConst.groups.GROUND || CollisionConst.groups.PLAYER);
        // this.anim = this.node.getComponent(animation.AnimationController);
        // this.rb = this.node.getComponent(RigidBody);
        this.enemyStatus = this.node.getComponent(UnitStates);

        this.renderComp = this.node.getComponentInChildren(SkinnedMeshRenderer);
        // this.anim.setValue("isDeath",true);
        this.defendRoot = this.node.getChildByPath("effect/defend");

        this.checkIsGround();
    }

    private _initParticleNodeMap() {
        let map: Map<SFXParticleType,string> = this.particleNodeMap;
        map.set(SFXParticleType.DEFEND,'defend');
        map.set(SFXParticleType.HIT,'hit');
        map.set(SFXParticleType.DUSTJUMP,'dust');
        map.set(SFXParticleType.DUSTLAND,'dust');
    }

    public getParticleInstance(type: SFXParticleType) {
        return GameManager.I.getParticle(type);
    }

    start() {

    }

    /**
     * 添加特效粒子
     * @param  {SFXParticleType} type
     */
    addEffect(type: SFXParticleType) {
        
        let root = this.node.getChildByPath(`effect/${this.particleNodeMap.get(type)}`);
        /** 回收防御节点 */
        const recycle = () => {
            const sons = root.children;

            while(sons.length) {
                const item = sons[sons.length - 1];
                GameManager.I.getParticlePool(type).put(item);
            }
        }

        recycle();
        const particleNode = this.getParticleInstance(type);

        root.addChild(particleNode);
        if(type == SFXParticleType.HIT || type == SFXParticleType.DEFEND) {
            particleNode.setWorldPosition(this.node.worldPosition.clone().add(new Vec3(this.direction * 0.05,1.3,0)));            
        } else {
            particleNode.setWorldPosition(this.node.worldPosition.clone());            
        }
    }


    /**
     * @param  {DamageObject} damage
     * @param  {Vec3} pos 世界坐标
     * @returns void
     */
    public hit(damage: DamageObject,pos: Vec3): void {
        if(this.isDead) return;

        const defendAndHitRandom = createRandom(0,6);
        this.turnToPlayer(damage.inflictor);
        if(defendAndHitRandom < 2) {
            // 防御
            this.anim.setValue("defend",true);
            GameManager.I.audioManager.playEffectByUrl("DefendHit");
            this.addEffect(SFXParticleType.DEFEND);
        } else {
            GameManager.I.shakeCamera();

            this.subHeath(damage.damage);
            GameManager.I.audioManager.playEffectByUrl("EnemyHit");
            // 挨打
            this.addEffect(SFXParticleType.HIT);
            console.log("damage is ",damage);
            this.playAudioAndEffectByDameage(damage);

            if(!damage.knockdown) {
                this.noKnockDownSequence(damage);
                this.checkIsDeath();
            } else {
                if(this.health.blood <= 0) {
                    this.isDead = true;
                }
                this.knockDownSequence(damage,() => {});
            }
        }
    }

    playAudioAndEffectByDameage(damage: DamageObject) {
        switch(damage.animTrigger) {
            case "punch1":
                this.anim.setValue('hit2',true);
                GameManager.I.audioManager.playEffectByUrl("PunchHit1");
                break;
            case "punch2":
                this.anim.setValue('hit1',true);
                GameManager.I.audioManager.playEffectByUrl("PunchHit2");
                break;
        }
    }

    /**
     * 不是倒地的击打
     * @param  {DamageObject} damage
     */
    noKnockDownSequence(damage: DamageObject) {
        // 施加力
        this.addForce(new Vec3(-this.direction * this.horizonForce,0,0));
    }

    /** 倒地的一系列动作 */
    public async knockDownSequence(damage: DamageObject,callback: Function) {
        
        this.enemyStatus.curState = PlayerState.KNOCKDOWN;
        this.addForce(new Vec3(-this.direction * 5,this.upForce,0));
        this.anim.setValue('knockDownUp',true);

        let velocity = new Vec3(0);
        this.rb.getLinearVelocity(velocity);
        console.log('velocity y is ',velocity.y);

        let id = setInterval(() => {
            let velocity = new Vec3(0);
            this.rb.getLinearVelocity(velocity);

            if(velocity.y < 0) {
                // 开始下落播放knockdown
                clearInterval(id);
                this.anim.setValue("knockDown",true);

                console.log("取消计时器");
                // PhysicsSystem.instance.raycast()
                // this.capsuleCollider.addMask(1 << Layers.nameToLayer("ground"));
                // this.capsuleCollider.on("onCollisionEnter",this.onCollisionEnter,this);
                
                if(this.checkIsGround()) {
                    GameManager.I.shakeCamera();
                    GameManager.I.audioManager.playEffectByUrl("Ground");
                    this.addEffect(SFXParticleType.DUSTLAND);
                    this.anim.setValue('knockDownEnd',true);
                    if(this.isDead) {
                        GameManager.I.audioManager.playEffectByUrl("KO");
                    }
                    this.scheduleOnce(() => {
                        if(!this.isDead) {
                            this.anim.setValue('standUp',true);
                            this.enemyStatus.curState = PlayerState.IDLE;
                        } else {
                            this.flickerEnemy();
                            this.enemyStatus.curState = PlayerState.DEATH;
                        }
                    },this.isDead ? 0.1 : 1);
                    
                }
            }
            
        },5);

    }

    /*** 检查敌人是否触地 */
    checkIsGround() {
        let startPos = this.node.worldPosition.clone().add(new Vec3(0,0.0,0));
        let dir = new Vec3(0,-1,0);

        let ray = geometry.Ray.create(startPos.x,startPos.y,startPos.z,dir.x,dir.y,dir.z);
        let res = PhysicsSystem.instance.raycast(ray,0xffffffff,1,false);
        console.log('res is ',res);
        return res;
    }

    onCollisionEnter(event: ICollisionEvent) {
        if(this.enemyStatus.curState == PlayerState.KNOCKDOWN) {
            console.log('event is ',event);
        }
    }

    /** 朝向玩家 */
    turnToPlayer(player: Node) {
        if(player.worldPosition.x - this.node.worldPosition.x > 0) {
            this.direction = PlayerDirection.RIGHT;
        } else {
            this.direction = PlayerDirection.LEFT;
        }

        let quat = new Quat();
        let quat2 = new Quat();
        Quat.fromEuler(quat,0,this.direction * 90,0);
        Quat.slerp(quat2,quat,this.node.rotation,0.1);
        this.node.setRotation(quat2);
        
    }

    checkIsDeath() {
        if(this.health.blood <= 0) {
            this.anim.setValue("isDead",true);
            // GameManager.I.audioManager.playEffectByUrl("PlayerDeath");
            GameManager.I.audioManager.playEffectByUrl("KO");
            this.flickerEnemy();
            // this.node.
            this.isDead = true;
            return true;
        }
        return false;
    }

    /** 敌人死亡的时候闪烁 */
    flickerEnemy() {
        this.scheduleOnce(() => {
            let render = this.renderComp;
            // render.enabled 
            this.node.getChildByName('effect').active = false;
            let show = true;
            let i = 0;
            let id = setInterval(() => {
                if(i >= 8) {
                    clearInterval(id);
                    this.node.destroy();
                    
                    setTimeout(() => {
                        const curWaveIsOver = GameManager.I.enemeyManager.curWaveIsOver();
                        console.log('本轮敌人是否消灭完毕：',curWaveIsOver);

                        if(curWaveIsOver && GameManager.I.enemeyManager.totalWaves - 1 !== GameManager.I.enemeyManager.curEnemyWave) {
                            GameManager.I.UIManager.showNextAnimation();
                        } 

                        if(curWaveIsOver && GameManager.I.enemeyManager.totalWaves - 1 === GameManager.I.enemeyManager.curEnemyWave) {
                            GameManager.I.enemeyManager.levelOver = true;
                        }
                        
                    },100)
                }
                show = !show;
                this.node && (this.node.active = show);
                i++;
            },100);
            
        },2);
    }

    update(deltaTime: number) {
        
    }
}

