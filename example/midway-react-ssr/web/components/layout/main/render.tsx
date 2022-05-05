import React from "react"

export default function MainLayout (props: any) {
    return (
        <>
            <header style={{width: '100%', height: '56px', lineHeight: '56px', textAlign: 'center'}}>Header</header>
            {props.children}
        </>
    )
}