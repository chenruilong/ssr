import { ILifecycleCtx } from 'tiger-types-react'

export default function renderRoute () {
    return async (ctx: ILifecycleCtx, next: Function) => {
        ctx.callback(true)
    }
}