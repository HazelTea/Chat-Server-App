const socket = io();

/// Elements ///
const form = document.getElementById("chat_form");
const input = document.getElementById("chat_input_field");
const chatList = document.getElementById("chat_msg_list");
const fileSender = document.getElementById("chat_file_sender")
const chatFrame = document.getElementById("chat_frame")
const imageFullViewFrame = document.getElementById("image__full_view__frame")

/// Templates ///
const chatMessageTemplate = document.getElementById("chat_msg_template").content
const fileFrameTemplate = document.getElementById("file_frame_template").content
const imageFrameTemplate = document.getElementById("image_frame_template").content

input.focus()

const messages = fetch('/messages?chat=all')
messages.then((res) => {
    res.json().then((res) => {
        res.messages.forEach(message => {
            utils.CreateTaskElement(message)
        });
        utils.ScrollToBottom()
    })
})

input.addEventListener("keypress",(e) => {
    if(e.key === "Enter" && !e.shiftKey) {
        utils.OnFormSubmit(e)
    }
});

input.addEventListener("input", utils.UpdateInputPosition) 

socket.emit("set username", "username");
socket.on("msg_send", (data) => utils.CreateTaskElement(data));

fileSender.addEventListener("click", () => input.focus())
imageFullViewFrame.addEventListener("click", () => imageFullViewFrame.style.display = "none")
chatFrame.addEventListener("paste", (e) => utils.OnChatFilesPasted(e))
form.addEventListener("submit", (e) => utils.OnFormSubmit(e));

utils.UpdateInputPosition()