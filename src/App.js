import React, { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
	const [inputText, setInputText] = useState([]);
	const [chatHistory, setChatHistory] = useState([]);
	const [userResponse, setUserResponse] = useState("");
	const [description, setdescription] = useState([]);
	const chatContainerRef = useRef(null);
	const [imageFile, setImageFile] = useState(null);
	var enter = true;
	const handleImageChange = (event) => {
		const file = event.target.files[0];
		setImageFile(file);
	};

	function isImageLink(text) {
		console.log(text);
		return text?.match(/\.(jpeg|jpg|gif|png)$/) != null;
	}

	const handleUpload = async () => {
		if (!imageFile) {
			console.log("No image selected.");
			return;
		}

		const formData = new FormData();
		formData.append("image", imageFile);
		// setImageFile(null);
		formData.append("description", description);
		console.log(description);
		setdescription("");
		setChatHistory((prevChatHistory) => [
			...prevChatHistory,
			{ text: "Uploaded", user: true, ig: "no" },
		]);
		try {
			const response = await fetch("http://127.0.0.1:5000/upload", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();
			setChatHistory((prevChatHistory) => [
				...prevChatHistory,
				{ text: data.text, user: false, ig: data.ig },
			]);
			console.log("Image uploaded:", data);
		} catch (error) {
			console.error("Error uploading image:", error);
		}
	};
	const sendRequest = async () => {
		if (inputText.trim() === "") return;
		setChatHistory([
			...chatHistory,
			{ text: inputText, user: true, ig: "false" },
		]);
		var val = inputText;
		setInputText("");
		var response;
		if (val.indexOf("tell my preferences") !== -1) {
			response = await fetch("http://127.0.0.1:5000/read_file");
		} else if (val.indexOf("remember") !== -1) {
			response = await fetch("http://127.0.0.1:5000/write_to_file", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ data: inputText }),
			});
		} else {
			response = await fetch(
				`https://flask-app-ey.onrender.com/answer/${encodeURIComponent(
					inputText
				)}`
			);
		}

		var data = await response.json();
		if (
			data.response_key === "body_shape" ||
			data.response_key === "age" ||
			data.response_key === "place"
		) {
			const response = inputText;
			setUserResponse(response);

			const saveResponse = await fetch("http://127.0.0.1:5000/save_response", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					data: response,
					response_key: data.response_key,
				}),
			});
		}
		setChatHistory((prevChatHistory) => [
			...prevChatHistory,
			{ text: data.text, user: false, ig: data.ig },
		]);

		if (data.text === "Generating....") {
			const r = await fetch(
				`http://127.0.0.1:5000/answer/${encodeURIComponent("suprise maj")}`
			);
			const d = await r.json();
			setChatHistory((prevChatHistory) => [
				...prevChatHistory,
				{ text: d.text, user: false, ig: d.ig },
			]);
		}
	};

	useEffect(() => {
		chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
	}, [chatHistory]);

	return (
		<div className="App">
			<div className="left-panel">
				<div className="welcome-message">
					Experience the magic of a personalized journey with our EY RetailBot.
				</div>
			</div>
			<div className="right-panel">
				<div className="chat-container" ref={chatContainerRef}>
					{chatHistory.map((message, index) => (
						<div
							key={index}
							className={`message ${message.user ? "user" : "bot"}`}
						>
							{isImageLink(message.ig) ? (
								<div>
									<img
										src={message.ig}
										alt="preview"
										className="image-response"
									/>
									<p className="latest-trends-text">{message.text}</p>
									{message.text === "Please tell your body shape" ? (
										<p></p>
									) : (
										<a href="" className="buy-now-link">
											Buy now on flipkart
										</a>
									)}
								</div>
							) : (
								<div className="message-text">{message.text}</div>
							)}
						</div>
					))}
				</div>

				<div className="input-container">
					<input
						type="text"
						value={description}
						onChange={(e) => setdescription(e.target.value)}
						placeholder="Enter description..."
					/>
					<input
						type="file"
						accept="image/*"
						className="input"
						onChange={handleImageChange}
					/>
					<button className="upload-button" onClick={handleUpload}>
						Upload Image
					</button>
				</div>

				<div className="input-container">
					<input
						type="text"
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						placeholder="Type your message..."
					/>
					<div />
					<button onClick={sendRequest}>Send</button>
				</div>
			</div>
		</div>
	);
}

export default App;
