import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 
 * 跟随摄像机 x轴方向跟谁
 * 
 */

@ccclass('FollowCamera')
export class FollowCamera extends Component {

    @property(Node)
    targetNode: Node;

    private offset: Vec3 = new Vec3(0);
    start() {
        this.offset = this.targetNode.worldPosition.clone().subtract(this.node.worldPosition);
        // this.offset = this.targetNode.worldPosition.subtract(this.node.worldPosition);
    }

    update(deltaTime: number) {
        if(!this.targetNode) return;

        const targetNodePos = this.targetNode.worldPosition;

        let out: Vec3 = new Vec3(0);
        this.node.position = Vec3.lerp(out,this.node.position,targetNodePos.clone().subtract(this.offset),deltaTime * 2);

    }
}

