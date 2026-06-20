import { 
	Box,
	Spacer,
	useWindowSize,
 } from "ink";

import { 
	graphLayout 
 } from "../utility/movement.js";
import Footer from "./footer.js";
import Query from "./query.js";


import { QueryContext } from "../context/querycontext.js";
import { useMemo, useState } from "react";
import PathList from "./pathList.js";
import { usePointer } from "../customHooks/pointer.js";



export default function Layout(){
	
	const {columns,rows} = useWindowSize();
	const [query,setQuery] = useState({
		base:"./",
		path:""
	});
	
	const [pathlist_node,query_node] = useMemo(()=>{
		const pathlist_node = new graphLayout({});
		const query_node = new graphLayout({atas:pathlist_node});

		pathlist_node.bawah = query_node;

		return [pathlist_node,query_node];
	},[]);

	const activeNode = usePointer(pathlist_node);


	return(
		<Box 
			alignSelf="center" 
			alignItems="center"
			justifyContent="flex-start"
			overflow="hidden" 
			flexDirection="column" 
			width={"100%"} 
			height={rows * 0.9} 
			borderStyle={"round"} 
			borderColor={"yellow"}
		>
			<QueryContext value={query}>
				<PathList pathListNode={pathlist_node}/>
				<Spacer />
				<Query setQuery={setQuery} queryNode={query_node}/>
				<Footer/>
			</QueryContext>

		</Box>
	)
}