import { _decorator, Component, Node, Enum, enumerableProps } from 'cc';
const { ccclass, property } = _decorator;

/** 人物状态 */
export enum PlayerState {
    IDLE,
    WALK,
    KICK1,
    KICK2,
    PUNCH1,
    PUNCH2,
    PUNCH3,

    DEATH,
    JUMP,

    KNOCKDOWN,

}

/**
 * 
 * 人物状态组件
 * 
 */
@ccclass('UnitStates')
export class UnitStates extends Component {

    @property({
        type: Enum(PlayerState)
    })
    /** 人物的当前状态 */
    private _curState: PlayerState = PlayerState.IDLE;
    @property({
        type: PlayerState
    })
    public get curState() {
        return this._curState;
    }

    public set curState(state: PlayerState) {
        this._curState = state;
    }

    

}

