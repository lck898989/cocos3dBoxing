import { _decorator, Component, Node } from 'cc';
import { AudioManager } from './AudioManager';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    public static I: GameManager = null;

    public audioManager: AudioManager = null;


    __preload() {
        GameManager.I = this;
        this.audioManager = this.node.getChildByName("audioManager").getComponent(AudioManager);
        console.log('audioManager is ',this.audioManager);
        this.audioManager && this.audioManager.init();
        
    }

    onLoad() {
        console.log(GameManager.I);
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}

