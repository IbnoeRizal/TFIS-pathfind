import { 
    ScrollList, 
    type ScrollListRef
} from "ink-scroll-list";
import { 
    Box,
    Text, 
    useInput,
} from "ink";
import { 
    useRef,
    useState,
    useEffect,
    useMemo,
} from "react";

import {type PackedOutRules, TsukamotoFISPathfinding } from "../classes/TFIS.js";

import { useQuery } from "../context/querycontext.js";
import { MOVEMENT,graphLayout } from "../utility/movement.js";


export default function PathList({pathListNode}:{pathListNode:graphLayout}){
    const listRef = useRef<ScrollListRef>(null);
    const query = useQuery();

    const [error,setError] = useState<string | null>(null);
    const [pathList,setPathlist] = useState<PackedOutRules[] | string[] | []>([]);
    const [selectedIndex, setIndex] = useState(0);
    const TFIS = useMemo(()=>new TsukamotoFISPathfinding(),[]);
    const timer = useRef<NodeJS.Timeout | null>(null);

    useEffect(()=>{
        if(timer.current)clearTimeout(timer.current);
        timer.current = setTimeout(()=>setError(null),3000);

        if(!(query.base && query.path && query.path.length > 0)){
            setError("base path atau query tidak boleh kosong")
        };

       query.base && query.path 
       &&(async()=>{
            
            const result = (await TFIS.listFilesParallel(query.path,query.base))
                .implication()
                .defuzzyfication()
                .ranking()
                .getcopy()
            

            if(result.length === 0){
                timer.current && clearTimeout(timer.current);
                setError("tidak ditemukan file atau folder");
                timer.current = setTimeout(()=>setError(null),3000);
            }else{
                setPathlist(result);
            }
        })();
    },[query.base,query.path]);

    const renderedPathlist = useMemo(()=>{
        const render = [];
        for(const item of pathList){
            if(typeof item === 'string') return null;

            const matchedidx = new Set(item.kemiripan.matched_idx);
            
            render.push(
                item.path.split("").map((char,i)=>
                    matchedidx.has(i)?
                    <Text key={i} bold color="yellowBright">{char}</Text>
                    : <Text key={i}>{char}</Text>
                )
            )
        }
        
        return render;
    },[pathList]);

     // Handle keyboard navigation in the parent
    useInput((input, key) => {
        if(!pathListNode.isActive()) return;

        switch (input) {
            case MOVEMENT.ATAS:
                setIndex((prev) => Math.max(prev - 1, 0));
                break;
            case MOVEMENT.BAWAH:
                setIndex((prev) => Math.min(prev + 1, pathList.length - 1));
                break;
            case MOVEMENT.TOP:
                setIndex(0); // Jump to first
                break;
            case MOVEMENT.BOTTOM:
                setIndex(pathList.length -1); // Jump to last
                break;
            default:
                break;
        }

        if (key.return) {
            console.log(`Selected: ${pathList[selectedIndex]}`);
        }
    });

    return(
        <Box 
            height={"70%"} 
            flexDirection="column" 
        >
            <Box borderTop={false} backgroundColor={"black"} justifyContent="center" alignItems="center">
                <Text color={"red"}>
                    {error}
                </Text>
            </Box>
            <ScrollList ref={listRef} selectedIndex={selectedIndex} backgroundColor={pathListNode.isActive() ? "black" : ""}>
                {pathList.map((item,i)=>{
                    const isString = typeof item == 'string';
                    if(isString){
                        return(
                        <Box key={i}>
                            <Text color={i === selectedIndex ? "green" : "gray"} wrap="truncate-middle">
                                {i === selectedIndex ? "> " : "  "}
                                { item }
                            </Text>
                        </Box>
                        )
                    }else{

                        const selected = i === selectedIndex;
                        const rank = item.crisp_out?.toFixed(0);

                        return(
                           <Box key={i} alignItems="center" justifyContent="space-between">
                            <Text color={selected ? "green" : "white"} wrap="truncate-middle">
                                {i === selectedIndex ? "> " : "  "}
                                {renderedPathlist && renderedPathlist[i]}
                            </Text>
                            <Text color={selected ? "green" : "white"}>
                               {rank}
                            </Text>
                        </Box> 
                        )
                    }
                })}
            </ScrollList>
        </Box>
    )
}