import { render } from "ink";
import Layout from "./SearchTUI/layout.js";

const app = render(<Layout/>);
await app.waitUntilExit();