import { ILifecycleCtx } from "tiger-types-react"
  
export default function loading () {
    return async (ctx: ILifecycleCtx, next: Function) => {
        if (ctx.progress) ctx.progress.start()
        await next()
    }
}