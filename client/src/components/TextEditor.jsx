import "quill/dist/quill.snow.css"
import Quill from "quill"
import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { v4 as uuidV4 } from "uuid"
import useSocket from "../hooks/useSocket"

const TOOLBAR_OPTIONS = [
	[{ header: [1, 2, 3, 4, 5, 6, false] }],
	[{ font: [] }],
	[{ list: "ordered" }, { list: "bullet" }],
	["bold", "italic", "underline"],
	[{ color: [] }, { background: [] }],
	[{ script: "sub" }, { script: "super" }],
	[{ align: [] }],
	["image", "blockquote", "code-block"],
	["clean"],
]

function TextEditor() {
	const [quill, setQuill] = useState()
	const { id: documentId } = useParams()
	const navigate = useNavigate()

	const { socket } = useSocket()

	const wrapperRef = useCallback((wrapper) => {
		if (wrapper == null) return

		wrapper.innerHTML = ""
		const editor = document.createElement("div")
		wrapper.append(editor)
		const q = new Quill(editor, {
			theme: "snow",
			modules: { toolbar: TOOLBAR_OPTIONS },
		})
		q.disable()
		q.setText("Loading...")
		setQuill(q)
	}, [])

	useEffect(() => {
		if (socket == null || quill == null) return

		const handler = (delta, oldDelta, source) => {
			if (source !== "user") return
			socket.emit("send-changes", delta)
		}

		quill.on("text-change", handler)

		socket.on("receive-changes", (delta) => {
			quill.updateContents(delta)
		})

		return () => {
			quill.off("text-change", handler)
			socket.off("receive-changes")
		}
	}, [socket, quill])

	useEffect(() => {
		if (socket == null || quill == null) return

		if (documentId == null) {
			navigate(`/documents/${uuidV4()}`)
			return
		}

		socket.emit("get-document", documentId)

		// Load document once
		socket.once("load-document", (document) => {
			quill.setContents(document)
			quill.enable()
		})
	}, [navigate, socket, quill, documentId])

	// Save document
	useEffect(() => {
		if (socket == null || quill == null) return

		const interval = setInterval(() => {
			socket.emit("save-document", quill.getContents())
		}, 2000)

		return () => {
			clearInterval(interval)
		}
	}, [socket, quill])

	return <div className="container" ref={wrapperRef}></div>
}

export default TextEditor
