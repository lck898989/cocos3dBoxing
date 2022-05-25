import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TimerManager')
export class TimerManager extends Component {
    public static deltaTime: number = 0;
    start() {

    }

    update(deltaTime: number) {
        TimerManager.deltaTime = deltaTime;
    }
}

