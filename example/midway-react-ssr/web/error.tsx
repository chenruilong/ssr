import React from "react"
import { ErrorPageProps } from "tiger-types-react"

export default (props: ErrorPageProps) => {
    return (
        <div style={{color: "red"}}>
            code: ${props.code},
            message: ${props.message}
        </div>
    )
}