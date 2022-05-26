import { _decorator, Component, Node, Prefab, NodePool, instantiate } from 'cc';
import { AudioManager } from './AudioManager';
import { EnemyManager } from './enemy/EnemyManager';
import { Direction } from './player/InputManager';
const { ccclass, property } = _decorator;

export enum PlayerDirection {
    LEFT  = -1,
    RIGHT = 1
}

@ccclass('GameManager')
export class GameManager extends Component {

    @property({type: Prefab,tooltip: "碰撞检测盒子"})
    colliderBox: Prefab = null;
    
    private colliderBoxPool: NodePool = null;

    public static I: GameManager = null;

    public audioManager: AudioManager = null;
    public enemeyManager: EnemyManager = null;

    public playerDir: PlayerDirection = PlayerDirection.RIGHT;


    __preload() {
        GameManager.I = this;
        this._initColliderBoxPool();
        this.audioManager = this.node.getChildByName("audioManager").getComponent(AudioManager);
        console.log('audioManager is ',this.audioManager);
        this.audioManager && this.audioManager.init();
        this.enemeyManager = this.node.getChildByName('enemys').getComponent(EnemyManager);
        
    }

    /** 初始化碰撞盒子节点池 */
    _initColliderBoxPool() {
        this.colliderBoxPool = new NodePool();
        for(let i = 0; i < 5; i++) {
            let colliderItem = instantiate(this.colliderBox);
            this.colliderBoxPool.put(colliderItem);
        }
    }

    public getColliderBoxFromPool() {
        let item: Node = this.colliderBoxPool.get();
        if(!item) {
            const itemTemp = instantiate(this.colliderBox);
            this.colliderBoxPool.put(itemTemp);
            item = this.colliderBoxPool.get();
        }
        return item;
    }

    onLoad() {
        console.log(GameManager.I);
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}

