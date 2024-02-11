function goUp(cond: (n: Element) => boolean, e:Element): Element {
    return cond(e.parentElement!) ? e.parentElement! : goUp(cond,e.parentElement!)
}
function succ(e: Element | Element[]): (Element | Element[] | null) {
    if (Array.isArray(e))
        return e[0].parentElement
    return null
}
function generateUp(e: Element | null | Element[]): (Element | Element[])[] {
    if (Array.isArray(e))
        return [e, ...generateUp(e[0].parentElement)] 
    return e ? [e, ...generateUp(e.parentElement)] : []
}
export function f(d: Document, uuid: string) {
    const matches = Array.from(d.getElementsByClassName('_' + uuid))
    const root = goUp(e => e.getElementsByClassName('_' + uuid).length == matches.length, matches[0])
    return generateUp(root)
}