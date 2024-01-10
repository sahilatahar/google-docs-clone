import TextEditor from "./components/TextEditor"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" exact element={<TextEditor />} />
				<Route path="/documents/:id" element={<TextEditor />} />
			</Routes>
		</Router>
	)
}

export default App
