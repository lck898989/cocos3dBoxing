import { _decorator, Component, Node, input, Input, EventKeyboard, macro, KeyCode, director } from 'cc';
const { ccclass, property } = _decorator;

export enum Direction {
    /** 向左键 */
    LEFT_KEY = KeyCode.ARROW_LEFT,
    /** 向右键 */
    RIGHT_KEY = KeyCode.ARROW_RIGHT,
    /** 向上键 */
    UP_KEY = KeyCode.ARROW_UP,
    /** 向下键 */
    DOWN_KEY = KeyCode.ARROW_DOWN
}
export enum CombatKeys {
    /** 出拳键 */
    PUNCH = KeyCode.KEY_Z,
    /** 踢腿 */
    KICK = KeyCode.KEY_X,
    /** 跳跃 */
    JUMP = KeyCode.SPACE

    
}

@ccclass('InputManager')
export class InputManager extends Component {

    onLoad() {
        
    }

    onEnable() {
        console.log('onEnable');
        input.on(Input.EventType.KEY_DOWN,this.keyDown,this);
        input.on(Input.EventType.KEY_UP,this.keyUp,this);
        input.on(Input.EventType.KEY_PRESSING,this.keyPress,this);

    }

    keyPress(event: EventKeyboard) {
        const code = event.keyCode;
        director.emit('keypress',code);
    }

    keyDown(event: EventKeyboard) {
        const code = event.keyCode;
        director.emit('keydown',code);
    }

    keyUp(event: EventKeyboard) {
        const code = event.keyCode;
        director.emit('keyup',code);
    }



    onDisable() {
        console.log('onEnable');
        input.off(Input.EventType.KEY_DOWN,this.keyDown,this);
        input.off(Input.EventType.KEY_UP,this.keyUp,this);

    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}

