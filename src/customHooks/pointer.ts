import { useRef, useState } from "react";
import { MOVEMENT, graphLayout } from "../utility/movement.js";
import { useInput } from "ink";

/**
 * use this function only on the top layout of your application
 * @param rootNode 
 * @returns 
 */
export function usePointer(rootNode:graphLayout){
    const [node,setNode] = useState(rootNode);
    const lock = useRef<boolean>(false);
    const lastInput = useRef<string>("");
    const timer = useRef<null | NodeJS.Timeout>(null);

    useInput((input,key)=>{
        
        if(timer.current)clearTimeout(timer.current);
        timer.current = setTimeout(()=>{
            lastInput.current = ""
        },300)
        
        const isUnlock = lastInput.current === MOVEMENT.OUT && lock.current;
        const isLock = lastInput.current === MOVEMENT.IN || lock.current;
        lastInput.current = input;

        lock.current = isLock && !isUnlock;
        if(lock.current) return;
        
        
        switch (input) {
            case MOVEMENT.ATAS:
                setNode(prevNode=>graphLayout.goTo(prevNode,MOVEMENT.ATAS));
                break;
            case MOVEMENT.BAWAH:
                setNode(prevNode=>graphLayout.goTo(prevNode,MOVEMENT.BAWAH));
                break;
            case MOVEMENT.KIRI:
                setNode(prevNode=>graphLayout.goTo(prevNode,MOVEMENT.KIRI));
                break;
            case MOVEMENT.KANAN:
                setNode(prevNode=>graphLayout.goTo(prevNode,MOVEMENT.KANAN));
                break;
            case MOVEMENT.TOP:
                setNode(prevNode=>graphLayout.goTo(prevNode,MOVEMENT.TOP));
                break;
            case MOVEMENT.BOTTOM:
                setNode(prevNode=>graphLayout.goTo(prevNode,MOVEMENT.BOTTOM));
                break;
            case MOVEMENT.IN:
                setNode(prevNode=>graphLayout.goTo(prevNode,MOVEMENT.IN));
                break;
            case MOVEMENT.OUT:
                setNode(prevNode=>graphLayout.goTo(prevNode,MOVEMENT.OUT));
                break;
            default:
                break;
        }

    })

    return node;
}