import { 
    useFocus,
    Box,
    Text
 } from "ink";

import { TextInput } from "@inkjs/ui";
import { useCallback } from "react";
import { useQuery } from "../context/querycontext.js";
import { type QueryState } from "../context/querycontext.js";

export default function Query({setQuery}:{setQuery:React.Dispatch<React.SetStateAction<QueryState>>}){

    const query = useQuery();
	
	const changeBase = useCallback((newBase:string)=>{
		return setQuery(prev=>({...prev,base:newBase}))
	},[]);

	const changePath = useCallback((newPath:string)=>{
		return setQuery(prev=>({...prev,path:newPath}));
	},[]);

    const { isFocused: isBaseFocused } = useFocus({ id: "base" });
    const { isFocused: isPathFocused } = useFocus({ id: "path", autoFocus:true });

    return(
        <Box 
			justifyContent="space-between" 
			width={"80%"}
            borderStyle={"round"}
            borderColor={"yellow"}
			borderBottom={false}
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