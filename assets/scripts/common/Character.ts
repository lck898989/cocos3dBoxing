import { _decorator, Component, Node, CCBoolean, animation, RigidBody, CapsuleCollider, Vec3, Game } from 'cc';
import { DamageObject } from '../damage/DamageObject';
import { IDamage } from '../damage/IDamage';
import { GameManager } from '../GameManager';
import { HealthSystem } from './HealthSystem';
const { ccclass, property } = _decorator;

/**
 * 
 * 角色基类
 * 
 */
@ccclass('Character')
export class Character extends IDamage {
    
    @property(HealthSystem)
    health: HealthSystem = null;
    /** 是否存活 */
    public isDead: boolean = false;

    @property(CCBoolean)
    isPlayer: boolean = true;

    public anim: animation.AnimationController = null;
    public rb: RigidBody = null;
    public capsuleCollider: CapsuleCollider = null;

    __preload() {
        this.anim = this.node.getComponent(animation.AnimationController);
        this.rb = this.node.getComponent(RigidBody);
        this.capsuleCollider = this.node.getComponent(CapsuleCollider);
    }

    public subHeath(damage: number) {
        this.health.blood -= damage;
        if(this.isPlayer) {
            GameManager.I.UIManager.setPlayerBlood(this.health.blood);
        } else {
            GameManager.I.UIManager.setEnemyBlood(this.health.blood);
        }
        if(this.health.blood <= 0) {
            this.isDead = true;
            if(this.isPlayer) {
                GameManager.I.audioManager.playEffectByUrl("PlayerDeath");
            }
        }
    }

    public hit(damage: DamageObject,pos?: Vec3) {};
}

