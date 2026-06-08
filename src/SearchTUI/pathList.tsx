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

    useEffect(()=>{
        const timer = setTimeout(() => {
            setError(null);
        }, 3000);

        if(!(query.base && query.path && query.path.length > 0)){
            setError("base path atau query tidak boleh kosong")
            return ()=>clearTimeout(timer);
        };
        const TFIS = new TsukamotoFISPathfinding();

       (async()=>{
        try {
            setPathlist((await TFIS.listFilesParallel(query.path,query.base)).implication().defuzzyfication().ranking().getcopy());
        } catch (err) {
            const error = err as NodeJS.ErrnoException
            if (error.code === 'ENOENT') {
                setError(`Folder tidak ditemukan`);
            } else if (error.code === 'EACCES') {
                setError(`Akses ditolak`);
            } else {
                setError(`Error lainnya: ${ error.message}`);
            }
        }
        return () => clearTimeout(timer)
       })();
    },[query.base,query.path]);

     // Handle keyboard navigation in the parent
    useInput((input, key) => {
        if(!pathListNode.isActive()) return;

        if (input === MOVEMENT.ATAS) {
            setIndex((prev) => Math.max(prev - 1, 0));
        }
        if (input === MOVEMENT.BAWAH) {
            setIndex((prev) => Math.min(prev + 1, pathList.length - 1));
        }
        if (input === MOVEMENT.TOP) {
            setIndex(0); // Jump to first
        }
        if (input === MOVEMENT.BOTTOM) {
            setIndex(pathList.length - 1); // Jump to last
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
                        const matchedidx = new Set(item.kemiripan.matched_idx);
                        const newpath = item.path.split("").map((char,i)=>matchedidx.has(i)
                             ? <Text key={i} bold color="yellowBright">{char}</Text>
                            : <Text key={i}>{char}</Text>
                        )
                        const selected = i === selectedIndex;
                        const rank = item.crisp_out?.toFixed(0);

                        return(
                           <Box key={i} alignItems="center" justifyContent="space-between">
                            <Text color={selected ? "green" : "white"} wrap="truncate-middle">
                                {i === selectedIndex ? "> " : "  "}
                                {newpath}
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