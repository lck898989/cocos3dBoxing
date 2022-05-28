import { _decorator, Component, Node, CCFloat } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;


@ccclass('HealthSystem')
export class HealthSystem {
    
    @property({type: CCFloat,tooltip: "血量"})
    private _blood: number = 100;

    @property({type: CCFloat,tooltip: "血量"})
    public get blood() {
        return this._blood;
    }

    public set blood(blood: number) {
        this._blood = blood;
        // GameManager.I.UIManager.setEnemyBlood();
    }
}

