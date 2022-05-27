import { _decorator, Component, Node, CapsuleCollider, animation, Prefab, Vec3, Camera, instantiate, ParticleSystem, tween, Tween, Material, SkinnedMeshRenderer, game, director, NodePool } from 'cc';
import { ShakeCamera } from '../camera/ShakeCamera';
import { HealthSystem } from '../common/HealthSystem';
import { DamageObject } from '../damage/DamageObject';
import { IDamage } from '../damage/IDamage';
import { GameManager, PlayerDirection } from '../GameManager';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('Enemy')
@requireComponent(animation.AnimationController)
@requireComponent(CapsuleCollider)
export class Enemy extends IDamage {

    @property(Node)
    hitPrefab: Node = null;

    @property(Prefab)
    defendPrefab: Node = null;

    public isDead: boolean = false;

    @property(HealthSystem)
    health: HealthSystem = new HealthSystem();

    public direction: PlayerDirection = PlayerDirection.LEFT;

    private defendNodePool: NodePool = null;

    // @property(Material)
    // deadMat: Material = null;

    private anim: animation.AnimationController = null;

    private capsuleCollider: CapsuleCollider = null;

    private renderComp: SkinnedMeshRenderer = null;

    private effectRoot: Node = null;

    /** 水平方向上的力 */
    private horizonForce: number = 1.5;
    /** 竖直方向上的力 */
    public upForce: number = 3;

    onLoad() {
        this._initNodePool();
        this.capsuleCollider = this.node.getComponent(CapsuleCollider);
        this.anim = this.node.getComponent(animation.AnimationController);
        this.renderComp = this.node.getComponentInChildren(SkinnedMeshRenderer);
        // this.anim.setValue("isDeath",true);
        this.effectRoot = this.node.getChildByPath("effect");
    }

    _initNodePool() {
        this.defendNodePool = new NodePool();
        for(let i = 0; i < 5; i++) {
            this.defendNodePool.put(instantiate(this.defendPrefab));
        }
    }

    public getDefendInstance() {
        let item: Node = this.defendNodePool.get();
        if(!item) {
            const itemTemp = instantiate(this.defendPrefab);
            this.defendNodePool.put(itemTemp);
            item = this.defendNodePool.get();
        }
        return item;
    }

    start() {

    }

    addDefendEffect() {
        const defendNode = this.getDefendInstance();
        this.effectRoot.addChild(defendNode);
        defendNode.setWorldPosition(this.node.worldPosition.clone().add(new Vec3(this.direction * 0.1,1.3,0)));
    }

    /**
     * @param  {DamageObject} damage
     * @param  {Vec3} pos 世界坐标
     * @returns void
     */
    public hit(damage: DamageObject,pos: Vec3): void {
        if(this.isDead) return;

        const defendAndHitRandom = Math.floor(Math.random() * 2);
        this.turnToPlayer();
        if(defendAndHitRandom) {
            // 防御
            this.anim.setValue("defend",true);
            GameManager.I.audioManager.playEffectByUrl("DefendHit");
            this.addDefendEffect();
        } else {
            if(!damage.knockdown) {
                this.noKnockDownSequence(damage);
            } else {
                this.knockDownSequence(damage);
            }
            this.checkIsDeath();
        }
    }

    /**
     * 不是倒地的击打
     * @param  {DamageObject} damage
     */
    noKnockDownSequence(damage: DamageObject) {
        // const camera = 
        const shakeCamera = GameManager.I.mainCamera.getComponent(ShakeCamera);
        shakeCamera.shake();
        
        // 施加力
        this.addForce(new Vec3(-this.direction,0,0));
        GameManager.I.audioManager.playEffectByUrl("PlayerHurt1");
        // 挨打
        this.hitPrefab.setWorldPosition(this.node.worldPosition.clone().add(new Vec3(0,1.3,0)));

        // this.hitPrefab.setPosition(localPos);
        const hitParticle = this.hitPrefab.getComponent(ParticleSystem);
        hitParticle.stop();
        hitParticle.play();

        this.health.blood -= damage.damage;

        console.log("挨打",damage);
        switch(damage.animTrigger) {
            case "punch1":
                this.anim.setValue('hit2',true);
                GameManager.I.audioManager.playEffectByUrl("PunchHit1");

                break;
            case "punch2":
                this.anim.setValue('hit1',true);
                GameManager.I.audioManager.playEffectByUrl("PunchHit2");
                break;
            case "punch3":
                this.anim.setValue('hit1',true);
                GameManager.I.audioManager.playEffectByUrl("HeavyHit2");
                break;
        }
    }

    /** 倒地击打的一系列动作 */
    knockDownSequence(damage: DamageObject) {

    }

    /** 朝向玩家 */
    turnToPlayer() {

    }


    checkIsDeath() {
        if(this.health.blood <= 0) {
            this.anim.setValue("isDeath",true);
            GameManager.I.audioManager.playEffectByUrl("PlayerDeath");


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
                console.log("i is ",i);
                if(i >= 8) {
                    clearInterval(id);
                    this.node.destroy();
                }
                show = !show;
                this.node.active = show;
                i++;
            },100);
            
        },2);
    }

    update(deltaTime: number) {
        
    }
}

