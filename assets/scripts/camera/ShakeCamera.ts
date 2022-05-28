import { _decorator, Component, Node, Camera, CurveRange, RealCurve, QuatCurve, Vec3, math, setDefaultLogTimes, sp } from 'cc';
const { ccclass, property,requireComponent } = _decorator;

/**
 * 
 * 摄像机晃动特效
 * 
 */
@ccclass('ShakeCamera')
@requireComponent(Camera)
export class ShakeCamera extends Component {

    private camera: Camera = null;

    /** 摄像机震动多少帧 */
    public shakeFrame: number = 20;

    public curveData: Vec3[] = [];

    public originPos: Vec3 = new Vec3(0);

    private isShaking: boolean = false;

    private curShakeFrame: number = 0;

    /** 小于该dt过滤掉 */
    private filterTime: number = 1 / 60;
    private filterTotalTime: number = 0;

    onLoad() {
        this.camera = this.node.getComponent(Camera);
        /** 摄像机的原始位置 */
        this.originPos = this.node.getPosition();
        this.createShakeCurveData();
    }

    /**
     * 创建震动摄像机的curve数据
     */
    createShakeCurveData() {
        this.curveData = [];
        for(let i = 0; i < this.shakeFrame; i++) {
            // this.curveData.push();
            const x = this.createRandom('x');
            const y = this.createRandom('y');
            const z = this.createRandom('z');
            
            this.curveData[i] = new Vec3(x,y,z);
        }
    }

    createRandom(type: string) {
        let seed = [-0.02,0.02];
        switch(type) {
            case "x":
                break;
            case "y":
                seed = [-0.008,0.01];
                break;
            case "z":
                seed = [-0.01,0.01];
                break;
        }
        let random = Math.floor(Math.random() * 2);
        return seed[random];
    }

    /**
     * 
     * 敌人被击倒或者自己被打倒晃动摄像机
     * 
     */
    shake() {
        this.isShaking = true;
    }

    update(deltaTime: number) {

        if(this.isShaking) {
            this.filterTotalTime += deltaTime;
            if(this.filterTotalTime >= 0.02) {
                this.filterTotalTime = 0;
            } else {
                return;
            }
            this.node.position = this.originPos.clone().add(this.curveData[this.curShakeFrame]);
            this.curShakeFrame++;
            if(this.curShakeFrame >= this.shakeFrame) {
                this.isShaking = false;
                this.curShakeFrame = 0;
                /** 恢复摄像机的原始位置 */
                this.node.position = this.originPos;
            }
        }
    }
}

