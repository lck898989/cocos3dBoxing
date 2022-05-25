import { _decorator, Component, Node, AudioSource, AudioClip, director, game } from 'cc';
import { resourceManager } from './resourceManager';
import BaseComp from './UI/baseComp';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends BaseComp {
    private _audio: AudioSource = null;

    public init() {
        if(!this.node.getComponent(AudioSource)) {
            this._audio = this.node.addComponent(AudioSource) as AudioSource;
        } else {
            this._audio = this.node.getComponent(AudioSource) as AudioSource;
        }
        game.addPersistRootNode(this.node);
    }

    public playEffect(audio: AudioSource) {
        if(!audio) return;
        audio.play();
    }

    public async playEffectByBundleUrl(bundleName: string,url: string) {
        let clip: AudioClip = await resourceManager.loadAseetByBundleName(bundleName,url,AudioClip);
        if(!this._audio) {
            console.error("缺少audioSource组件");
            return;
        }
        this._audio.clip = clip;
        this._audio.play();
    }
}


