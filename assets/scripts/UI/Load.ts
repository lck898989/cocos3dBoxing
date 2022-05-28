import { _decorator, Component, Node, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Load')
export class Load extends Component {

    start() {
        director.preloadScene("game",() => {
            director.loadScene("game");
        })
        
    }

    update(deltaTime: number) {
        
    }
}

