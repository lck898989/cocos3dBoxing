import { _decorator, Component, Node, SkinnedMeshRenderer, Material } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {

    @property(SkinnedMeshRenderer)
    render: SkinnedMeshRenderer = null;

    @property(Material)
    deadMat: Material = null;
    @property(Material)
    normalMat: Material = null;

    start() {
        console.log("node's worldPos is ",this.node.worldPosition);
        console.log(this.render.sharedMaterial.passes);

        this.render.material.onPassStateChange(false);

        let matLen = this.render.materials.length;
        this.scheduleOnce(() => {
            for(let i = 0; i < matLen; i++) {
                this.render.setMaterial(this.deadMat,i)
                // this.render.material = this.deadMat;
            }
        },2);
        
    }

    update(deltaTime: number) {
        
    }
}

