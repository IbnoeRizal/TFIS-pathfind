import { Text, Box } from "ink";



export default function Footer(){

    return(
        <Box 
            height={1}
            width={"100%"} 
            justifyContent="flex-start"
            gap={4}
            backgroundColor={"black"}
            flexWrap="nowrap"
            aria-hidden
            alignSelf="flex-end"
            >
			<Text dimColor aria-label="CWD" >{"CWD "}</Text>
			<Text wrap={"truncate-middle"} aria-label="Current Working Directory" color={"white"} >{process.cwd()}</Text>
		</Box>
    )
}