import { _decorator, Component, Node, CCFloat, Vec3 } from 'cc';
import { Character } from '../common/Character';
import { IDamage } from '../damage/IDamage';
import { GameManager } from '../GameManager';
import { PlayerState, UnitStates } from '../UnitStates';
import { createRandom, createRandomFlot } from '../utils/Util';
import { Enemy } from './Enemy';
import { EnemyAction } from './EnemyAction';
const { ccclass, property } = _decorator;



@ccclass('EnemyAI')
export class EnemyAI extends EnemyAction {

    onLoad() {
        this.target = GameManager.I.player;
        this.targetDamageObj = this.target.getComponent(Character) as Character;
    }

}

