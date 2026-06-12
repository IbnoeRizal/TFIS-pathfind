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
    useCallback,
} from "react";

import {type PackedOutRules, TsukamotoFISPathfinding } from "../classes/TFIS.js";

import { useQuery } from "../context/querycontext.js";
import { MOVEMENT,graphLayout } from "../utility/movement.js";


export default function PathList({pathListNode}:{pathListNode:graphLayout}){
    const listRef = useRef<ScrollListRef>(null);
    const query = useQuery();

    
    //render once this component is created
    const rendereditems = useRef<React.ReactNode[]>(null);
    //save the original source
    const pathlist = useRef<PackedOutRules[] | string[]>(null);
    //forceupdate
    const [,forceUpdate] = useState(false);
    
    const [error,setError] = useState<string | null>(null);
    const [selectedIndex, setIndex] = useState(0);
    const TFIS = useMemo(()=>new TsukamotoFISPathfinding(),[]);
    const timer = useRef<NodeJS.Timeout | null>(null);

    const buildpathJsxElement = useCallback((raw:PackedOutRules[] | string[])=>{
        rendereditems.current = raw.map((item,index)=>{
            if(typeof item === 'string'){
                return(
                <Box key={item}>
                    <Text color={"gray"} wrap="truncate-middle">
                        {"  "}{ item }
                    </Text>
                </Box>)
            }else{

                const matchedidx = new Set(item.kemiripan.matched_idx);
                return(
                <Box key={item.path} alignItems="center" justifyContent="space-between">
                    <Text color={"black"} wrap="truncate-middle">
                        {"  "}
                        {item.path.split("").map((char,i)=>
                            matchedidx.has(i)?
                            <Text key={i} bold color="yellowBright">{char}</Text>
                            : <Text key={i}>{char}</Text>
                        )}
                        {item.crisp_out?.toFixed(2)}
                    </Text>
                </Box> )
            }
        })
    },[])

    const applySelect = useCallback((index:number,selected:boolean)=>{
        const item = pathlist.current?.at(index);
        if(!item) return;

        const set_color = selected ? "green" : "black";
        const set_prefix = selected ? ">  " : "   ";

        let temp:React.ReactNode;
        if(typeof item === 'string'){
            temp =(
                <Box key={item}>
                    <Text color={set_color} wrap="truncate-middle">
                        {set_prefix}{ item }
                    </Text>
                </Box>)
        }else{
            const matchedidx = new Set(item.kemiripan.matched_idx);
            temp = (
            <Box key={item.path} alignItems="center" justifyContent="space-between">
                <Text color={set_color} wrap="truncate-middle">
                    {set_prefix}
                    {item.path.split("").map((char,i)=>
                        matchedidx.has(i)?
                        <Text key={i} bold color="yellowBright">{char}</Text>
                        : <Text key={i}>{char}</Text>
                    )}
                    {item.crisp_out?.toFixed(2)}
                </Text>
            </Box> )
        }

        if(rendereditems.current){
            rendereditems.current[index] = temp;
        }
    },[])

    useEffect(()=>{
        if(timer.current)clearTimeout(timer.current);
        timer.current = setTimeout(()=>setError(null),3000);

        if(!(query.base && query.path && query.path.length > 0)){
            setError("base path atau query tidak boleh kosong")
        };

       query.base && query.path &&(async()=>{ 
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
                pathlist.current = result;
                buildpathJsxElement(result);
                applySelect(selectedIndex,true);
                forceUpdate(p=>!p);
            }
        })();
    },[query.base,query.path]);

     // Handle keyboard navigation in the parent
    useInput((input, key) => {
        let nextindex:number = selectedIndex;
        let len = pathlist.current?.length;

        if(!len) return;

        switch (input) {
            case MOVEMENT.ATAS:
                nextindex = Math.max(selectedIndex - 1, 0);
                break;
            case MOVEMENT.BAWAH:
                nextindex = Math.min(selectedIndex + 1, len - 1);
                break;
            case MOVEMENT.TOP:
                nextindex = 0
                break;
            case MOVEMENT.BOTTOM:
                nextindex= len -1; // Jump to last
                break;
            default:
                break;
        }

        if(nextindex != selectedIndex){
            applySelect(nextindex,true);
            applySelect(selectedIndex,false);
            setIndex(nextindex)
        }

        if (key.return) {
            console.log(`Selected: ${pathlist.current?.[selectedIndex]}`);
        }
    },{isActive:pathListNode.isActive()});

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
            <ScrollList 
                ref={listRef} 
                selectedIndex={selectedIndex} 
                backgroundColor={pathListNode.isActive() ? "black" : ""}
            >
                {rendereditems.current}
            </ScrollList>
        </Box>
    )
}