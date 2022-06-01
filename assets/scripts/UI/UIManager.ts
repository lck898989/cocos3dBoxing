import { _decorator, Component, Node, CCObject, ProgressBar, Label, Sprite, tween, Vec2, Vec3, UIOpacity, macro, Tween, Renderable2D, UITransformComponent, UITransform, RenderableComponent } from 'cc';
import { GameManager } from '../GameManager';
import BaseComp from './baseComp';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends BaseComp {

    private playerBlood: ProgressBar = null;
    private playerName: Label = null;

    private enemyBlood: ProgressBar = null;
    private enemyName: Label = null;

    private teacher: Sprite = null;


    private levelComplete: UITransform = null;
    private bg: UITransform = null;
    private completeLabel: UITransform = null;
    private tapStart: UITransform = null;

    __preload() {
        this.openFilter = true;
        super.__preload();
    }

    onLoad() {
        this.hideNode(this.teacher.node);
    }

    onEnable() {
        this.tapStart.node.on(Node.EventType.TOUCH_START,this.hideLevelComplete,this);
    }

    onDisable() {
        this.tapStart.node.off(Node.EventType.TOUCH_START,this.hideLevelComplete,this);
    }

    start() {
        
    }

    update(deltaTime: number) {
        
    }

    setEnemyBlood(blood: number) {
        let ratio = blood / 100;
        this.enemyBlood.progress = ratio;
    }

    setEnemyName(name: string) {
        this.enemyName.string = name;
    }

    setPlayerBlood(blood: number) {
        let ratio = blood / 100;
        this.playerBlood.progress = ratio;
    }

    /** 显示下一步指示 */
    showNextAnimation(playAudio: boolean = true) {
        // const render = this.teacher.node.getComponent(Renderable2D);
        // const color = render.color;
        // // color.a = 100;
        // console.log();
        this.hideNode(this.teacher.node);
        const uiComponent = this.teacher.node.getComponent(UIOpacity);
        
        // this.blink(uiComponent,playAudio);
        this.tweenBlink(this.teacher.node);
        
        // tween(this.teacher.node).to(0.1,{active: true}).to(0.1,{active: false}).delay(0.2).start();
    }

    hideNode(node: Node) {
        const renders = node.getComponentsInChildren(RenderableComponent);
        for (let i = 0; i < renders.length; ++i) {
            const render = renders[i];
            render.enabled = false;
        }
    }

    /**
     * 闪烁节点 但是不能将节点的active置成false 需要先禁用renderComponent
     * @param  {Node} node
     * @param  {boolean=true} playAudio
     */
    tweenBlink(node: Node,playAudio: boolean = true) {
        tween(node)
        .show()
        .delay(0.5)
        .call(() => {
            playAudio && GameManager.I.audioManager.playEffectByUrl('HandPointer');
        })
        .hide()
        .delay(0.5)
        .union()
        .repeatForever()
        .start();
    }


    
    /**
     * 闪烁节点，需要UIOpacity
     * @param  {UIOpacity} opacityComponent
     * @param  {boolean=true} playAudio
     */
    blink(opacityComponent: UIOpacity,playAudio: boolean = true) {
        if(!opacityComponent) {
            console.warn("没有UIOpacity组件");
            return;
        }
        opacityComponent.opacity = 0;
        // opacityComponent.opacity
        // tween(color)
        // .to(0.5,{a: 0})
        // .start();
        tween(opacityComponent)
        .to(0.1,{opacity: 255})
        .call(() => {
            console.log('显示');
            playAudio && GameManager.I.audioManager.playEffectByUrl('ButtonStart');
        })
        .delay(0.5)
        .to(0.1,{opacity: 0})
        .delay(0.5)
        .union()
        .repeatForever()
        .start();
    }

    hideNextAnimation() {
        // const uiComponent = this.teacher.node.getComponent(UIOpacity);
        Tween.stopAllByTarget(this.teacher.node);
        this.hideNode(this.teacher.node);
    }


    /** 显示关卡结束的ui */
    showLevelComplete() {
        this.levelComplete.node.active = true;
        const op: UIOpacity = this.tapStart.node.getComponent(UIOpacity);
        this.blink(op,false);
        
    }

    hideLevelComplete() {
        const op: UIOpacity = this.tapStart.node.getComponent(UIOpacity);
        Tween.stopAllByTarget();
        this.levelComplete.node.active = false;
        // 进入下一个关卡
    }
}

