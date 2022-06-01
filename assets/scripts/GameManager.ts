import { _decorator, Component, Node, Prefab, NodePool, instantiate, Camera, geometry, BoxCollider } from 'cc';
import { AudioManager } from './AudioManager';
import { ShakeCamera } from './camera/ShakeCamera';
import { CollisionConst } from './CollisionConst';
import { EnemyManager } from './enemy/EnemyManager';
import { PlayerCombat } from './player/PlayerCombat';
import { UIManager } from './UI/UIManager';
const { ccclass, property } = _decorator;

export enum PlayerDirection {
    LEFT  = -1,
    RIGHT = 1
}

export enum SFXParticleType {
    DEFEND,
    DUSTLAND,
    DUSTJUMP,
    HIT
}

@ccclass('GameManager')
export class GameManager extends Component {

    @property({type: Prefab,tooltip: "碰撞检测盒子"})
    colliderBox: Prefab = null;

    @property({type: Prefab,tooltip: "跳跃灰尘粒子预制体"})
    dustJumpParticle: Prefab = null;
    @property({type: Prefab,tooltip: "落地灰尘粒子预制体"})
    dustLandParticle: Prefab = null;
    @property({type: Prefab,tooltip: "防御粒子预制体"})
    defendParticle: Prefab = null
    @property({type: Prefab,tooltip: "受伤粒子预制体"})
    hitParticle: Prefab = null

    private particleMap: Map<SFXParticleType,{pool: NodePool,prefab: Prefab}> = new Map();

    private colliderBoxPool: NodePool = null;
    
    private dustLandParticlePool: NodePool = null;
    private defendParticlePool: NodePool = null;
    private dustJumpParticlePool: NodePool = null;
    private hitParticlePool: NodePool = null;

    public static I: GameManager = null;

    public audioManager: AudioManager = null;
    public enemeyManager: EnemyManager = null;
    public UIManager: UIManager = null;

    public playerDir: PlayerDirection = PlayerDirection.RIGHT;

    @property(Node)
    public mainCamera: Node = null;

    public ground: geometry.AABB = null;
    public groundCollider: BoxCollider = null;

    public player: Node = null;


    __preload() {
        GameManager.I = this;
        this._initColliderBoxPool();
        this._initParticlePool();
        this.audioManager = this.node.getChildByName("audioManager").getComponent(AudioManager);
        console.log('audioManager is ',this.audioManager);
        this.audioManager && this.audioManager.init();
        this.enemeyManager = this.node.getChildByName('enemys').getComponent(EnemyManager);
        this.UIManager = this.node.getComponentInChildren(UIManager);
        this.player = this.node.getComponentInChildren(PlayerCombat).node;
        
    }

    public getParticlePool(type: SFXParticleType) {
        return this.particleMap.get(type).pool;
    }

    /**
     * 初始化粒子节点池
     */
    _initParticlePool() {
        this.dustJumpParticlePool = new NodePool();
        this.dustLandParticlePool = new NodePool();
        this.defendParticlePool = new NodePool();
        this.hitParticlePool = new NodePool();

        this.particleMap.set(SFXParticleType.DEFEND,{pool: this.defendParticlePool,prefab: this.defendParticle});
        this.particleMap.set(SFXParticleType.HIT,{pool: this.hitParticlePool,prefab: this.hitParticle});
        this.particleMap.set(SFXParticleType.DUSTJUMP,{pool: this.dustJumpParticlePool,prefab: this.dustJumpParticle});
        this.particleMap.set(SFXParticleType.DUSTLAND,{pool: this.dustLandParticlePool,prefab: this.dustLandParticle});

        for(let i = 0; i < 10; i++) {
            let dustJump = instantiate(this.dustJumpParticle);
            let dustLand = instantiate(this.dustLandParticle);
            let defend = instantiate(this.defendParticle);
            let hit = instantiate(this.hitParticle);

            this.defendParticlePool.put(defend);
            this.dustJumpParticlePool.put(dustJump);
            this.dustLandParticlePool.put(dustLand);
            this.hitParticlePool.put(hit);
        }
    }

    
    /**
     * 获得对应类型的粒子节点
     * @param  {SFXParticleType} type
     */
    getParticle(type: SFXParticleType) {
        const particleValue = this.particleMap.get(type);
        let item = particleValue.pool.get();
        if(!item) {
            let itemTemp = instantiate(particleValue.prefab);
            particleValue.pool.put(itemTemp);
            item = particleValue.pool.get();
        }
        return item;
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

    shakeCamera() {
        const shakeCamera = GameManager.I.mainCamera.getComponent(ShakeCamera);
        shakeCamera.shake();
    }

    onLoad() {
        this.groundCollider = this.node.getChildByPath("envs/Plane").getComponent(BoxCollider) as BoxCollider;
        // this.groundCollider.setGroup(CollisionConst.groups.GROUND);
        
        this.ground = this.groundCollider.worldBounds as geometry.AABB;
        console.log(GameManager.I);
        
    }

    start() {
        
    }

    update(deltaTime: number) {
        
    }
}

