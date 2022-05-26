import { _decorator, Component, Node, CCFloat } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('HealthSystem')
export class HealthSystem {
    
    @property({type: CCFloat,tooltip: "血量"})
    blood: number = 100;
}

