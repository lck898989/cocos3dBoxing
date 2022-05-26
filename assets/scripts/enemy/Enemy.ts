import { _decorator, Component, Node, CapsuleCollider, animation, Prefab, Vec3, Camera, instantiate, ParticleSystem } from 'cc';
import { HealthSystem } from '../common/HealthSystem';
import { DamageObject } from '../damage/DamageObject';
import { IDamage } from '../damage/IDamage';
import { GameManager } from '../GameManager';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('Enemy')
@requireComponent(animation.AnimationController)
@requireComponent(CapsuleCollider)
export class Enemy extends IDamage {

    @property(Node)
    hitPrefab: Node = null;

    public isDead: boolean = false;

    @property(HealthSystem)
    health: HealthSystem = new HealthSystem();

    private anim: animation.AnimationController = null;

    private capsuleCollider: CapsuleCollider = null;

    onLoad() {
        this.capsuleCollider = this.node.getComponent(CapsuleCollider);
        this.anim = this.node.getComponent(animation.AnimationController);

        // this.anim.setValue("isDeath",true);
    }

    onEnable() {
        this.capsuleCollider.on('onCollisionEnter',this.collisionEnter,this);
    }

    onDisable() {

    }

    collisionEnter() {
    }

    start() {

    }

    /**
     * @param  {DamageObject} damage
     * @param  {Vec3} pos 世界坐标
     * @returns void
     */
    public hit(damage: DamageObject,pos: Vec3): void {
        if(this.isDead) return;

        const defendAndHitRandom = Math.floor(Math.random() * 2);
        if(defendAndHitRandom) {
            // 防御
            this.anim.setValue("defend",true);
            GameManager.I.audioManager.playEffectByUrl("DefendHit");
        } else {
            GameManager.I.audioManager.playEffectByUrl("PlayerHurt1");
            // 挨打
            console.log('pos is ',pos);
            let localPos = new Vec3(0);
            this.node.inverseTransformPoint(localPos,pos);
            
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
                    GameManager.I.audioManager.playEffectByUrl("PunchHit6");
                    break;
            }
        }
        // this.anim.setValue();
        this.checkIsDeath();
    }

    checkIsDeath() {
        if(this.health.blood <= 0) {
            this.anim.setValue("isDeath",true);
            GameManager.I.audioManager.playEffectByUrl("PlayerDeath");
            this.isDead = true;
            return true;
        }
        return false;
    }


    

    

    update(deltaTime: number) {
        
    }
}

