import { _decorator, Component, Node, CCInteger, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 
 * 敌人队列
 * 
 */
@ccclass('EnemyWave')
export class EnemyWave {
    
    @property({type: CCInteger,tooltip: "该阶段敌人的数量"})
    enemyCount: number = 4;

    @property({type: [Vec3],tooltip: "敌人的生成位置"})
    enemyPosArr: Vec3[] = [];
}

