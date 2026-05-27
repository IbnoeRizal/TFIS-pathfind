import { 
	Box,
	Spacer,
	Text,
	useWindowSize,
 } from "ink";

import Footer from "./footer.js";
import Query from "./query.js";


import { QueryContext } from "../context/querycontext.js";
import { useState } from "react";
import PathList from "./pathList.js";



export default function Layout(){
	
	const {columns,rows} = useWindowSize();
	const [query,setQuery] = useState({
		base:"./",
		path:""
	})


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
				<Box alignContent="flex-start" width={"80%"} borderStyle={"single"} borderColor={"yellow"}>
					<Text>
						{`row * col = ${rows} * ${columns}`}
					</Text>
				</Box>
				<PathList/>
				<Spacer />
				<Query setQuery={setQuery}/>
				<Footer/>
			</QueryContext>

		</Box>
	)
}