import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CollisionConst')
export class CollisionConst {

    static groups = {
        PLAYER: 1,
        GROUND: 1 << 1,
        ENEMY :  1 << 2
    }
    
}

