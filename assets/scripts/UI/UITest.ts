import { _decorator, Component, Node, Label, Quat, CCObject, EditBox, Vec3 } from 'cc';
import BaseComp from './baseComp';
const { ccclass, property } = _decorator;

@ccclass('UITest')
export class UITest extends BaseComp {

    private initRotateNumber: number = 90;

    private lookAtX: Label = null;
    private lookAtY: Label = null;
    private lookAtZ: Label = null;

    private EditBoxX: EditBox = null;
    private EditBoxY: EditBox = null;
    private EditBoxZ: EditBox = null;

    @property(Node)
    playerNode: Node = null!;

    @property(Node)
    sphere: Node = null;

    @property(Label)
    forwardLabel: Label = null;

    private lookAt: Vec3 = new Vec3(0);

    __preload() {
        this.openFilter = true;
        super.__preload();
    }


    start() {
        this.forwardLabel.string = this.playerNode.forward.toString();

        this.EditBoxX.string = 0 + '';
        this.EditBoxY.string = 0 + '';
        this.EditBoxZ.string = 0 + '';

        // this.playerNode.lookAt(this.lookAt);
    }

    rotatePlayer() {
        this.initRotateNumber += 90;

        let rot: Quat = new Quat();
        Quat.fromEuler(rot,0,this.initRotateNumber,0);
        this.playerNode.setRotation(rot);

        this.forwardLabel.string = this.playerNode.forward.toString();
    }

    setSphereToLookAt() {
        this.sphere.setPosition(this.lookAt);
        this.playerNode.lookAt(this.sphere.worldPosition);
    }

    editXOver(event: EditBox) {
        console.log('event is ',event);
        this.lookAt.x = +event.string
        console.log('lookAt is ',this.lookAt);
        this.setSphereToLookAt();
    }

    editYOver(event: EditBox) {
        this.lookAt.y = +event.string
        console.log('lookAt is ',this.lookAt);
        this.setSphereToLookAt();
    }

    editZOver(event: EditBox) {
        this.lookAt.z = +event.string;
        console.log('lookAt is ',this.lookAt);
        this.setSphereToLookAt();
    }

    update(deltaTime: number) {
        
    }
}

