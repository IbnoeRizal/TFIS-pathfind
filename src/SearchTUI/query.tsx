import { 
    useFocus,
    Box,
    Text
 } from "ink";

import { TextInput } from "@inkjs/ui";
import { useCallback, useMemo } from "react";
import { useQuery } from "../context/querycontext.js";
import { type QueryState } from "../context/querycontext.js";
import { graphLayout } from "../utility/movement.js";

export default function Query({setQuery,queryNode}:{setQuery:React.Dispatch<React.SetStateAction<QueryState>>,queryNode:graphLayout}){

    const query = useQuery();
	
	const changeBase = useCallback((newBase:string)=>{
		return setQuery(prev=>({...prev,base:newBase}))
	},[]);

	const changePath = useCallback((newPath:string)=>{
		return setQuery(prev=>({...prev,path:newPath}));
	},[]);

    const { isFocused: isBaseFocused } = useFocus({isActive:queryNode.isActive(), id: "base" });
    const { isFocused: isPathFocused } = useFocus({isActive:queryNode.isActive(), id: "path" });

    return(
        <Box 
			justifyContent="space-between" 
			width={"80%"}
            borderStyle={"round"}
            borderColor={"yellow"}
			borderBottom={false}
			backgroundColor={queryNode.isActive() ? "black" : ""}
		>

			<Box alignSelf="flex-start" flexGrow={1} width={"40%"}>
				<Text color={"green"}>{isBaseFocused ? "▶ " : "  "}</Text>
				<TextInput placeholder="Base path.." onSubmit={changeBase} defaultValue={query.base} isDisabled={!isBaseFocused}/>
			</Box>
			<Box alignSelf="flex-end" flexGrow={2} width={"60%"}>
				<Text color={"green"}>{isPathFocused ? "▶ " : "  "}</Text>
				<TextInput placeholder="ketik Query..." onSubmit={changePath} defaultValue={query.path} isDisabled={!isPathFocused}/>
			</Box>
		</Box>
    )


}