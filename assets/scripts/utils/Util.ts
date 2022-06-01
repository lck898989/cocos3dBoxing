import {  TERRAIN_MAX_LAYER_COUNT, tween, ValueType } from "cc";
import { GameManager } from "../GameManager";

export function createRandom(min: number,max: number) {
    return Math.floor(Math.random() * (max - min) + min);
}

export function createRandomFlot(min: number,max: number) {
    return Math.random() * (max - min) + min;
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

/**
 * 将给定的值约束到指点的氛围内
 * @param  {number} value 目标值
 * @param  {number} min 约束范围的最小值
 * @param  {number} max 约束范围的最大值
 */
export function clamp(value: number,min: number,max: number) {
    if(value >= min && value <= max) {
        return value;
    } else if(value <= min) {
        return min;
    } else if(value >= max) {
        return max;
    }
}
