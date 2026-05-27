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

import {type Packed, TsukamotoFISPathfinding } from "../classes/TFIS.js";

import { useQuery } from "../context/querycontext.js";

export default function PathList(){
    const listRef = useRef<ScrollListRef>(null);
    const query = useQuery();

    const [error,setError] = useState("no Error");
    const [pathList,setPathlist] = useState<Packed[] | string[] | []>([]);
    const [selectedIndex, setIndex] = useState(0);

    useEffect(()=>{
        if(!(query.base && query.path && query.path.length > 0)){
            setError("base path atau query tidak boleh kosong")
            return;
        };
        const TFIS = new TsukamotoFISPathfinding();

       (async()=>{
        try {
            setPathlist((await TFIS.listFilesParallel(query.path,query.base)).implication().defuzzyfication().ranking().getpathlist());
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
       })();
    },[query.base,query.path]);

     // Handle keyboard navigation in the parent
    useInput((input, key) => {
        if (key.upArrow) {
            setIndex((prev) => Math.max(prev - 1, 0));
        }
        if (key.downArrow) {
            setIndex((prev) => Math.min(prev + 1, pathList.length - 1));
        }
        if (input === "g") {
            setIndex(0); // Jump to first
        }
        if (input === "G") {
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
            borderBottom={false}
            borderTop={false}
            borderColor={"yellow"}
            borderStyle={"single"}
        >
            <ScrollList ref={listRef} selectedIndex={selectedIndex}>
                {pathList.map((item,i)=>(
                    <Box key={i}>
                        <Text color={i === selectedIndex ? "green" : "white"}>
                            {i === selectedIndex ? "> " : "  "}
                            {typeof item === 'string'? item : item.path}
                        </Text>
                    </Box>
                ))}
            </ScrollList>
        </Box>
    )
}