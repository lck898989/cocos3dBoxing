import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {
    start() {
        console.log("node's worldPos is ",this.node.worldPosition);
    }

    update(deltaTime: number) {
        
    }
}

