import { tween } from "cc";
import { GameManager } from "../GameManager";

export function createRandom(min: number,max: number) {
    return Math.floor(Math.random() * (max - min) + min);
}

/**
* 闪烁节点 但是不能将节点的active置成false 需要先禁用renderComponent
* @param  {Node} node
* @param  {boolean=true} playAudio
*/
export function tweenBlink(node: Node,playAudio: boolean = true) {
    tween(node)
    .show()
    .delay(0.5)
    .call(() => {
    playAudio && GameManager.I.audioManager.playEffectByUrl('ButtonStart');
    })
    .hide()
    .delay(0.5)
    .union()
    .repeatForever()
    .start();
}
