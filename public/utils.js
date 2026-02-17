
function isNearBottom(el, threshold = 0) {
  return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
}

const utils = {
    CreateTaskElement : (data) => {
        const message = chatMessageTemplate.cloneNode(true);
        const frame = message.children[0]
        const frame_children = frame.children
        const frame_images = frame.children.images
        const frame_files = frame.children.files
        frame_children.author.textContent = data.ip+" | "+data.username
        frame_children.content.textContent = data.message
        const files = data.files

        let imageFound = false;
        if (files && files.length > 0) {
            files.forEach(file => {
                const fileName = file.name
                const fileUrl = file.url
                const isImage = fileName.match(/\.(jpg|png|gif)$/)
                if (isImage) {
                    frame_images.style.display = "flex"
                    imageFound = true
                    const imgFrame = imageFrameTemplate.cloneNode(true).children.image_frame;
                    const children = imgFrame.children
                    const img = children.image
                    const dbutton = children.button
                    dbutton.href = fileUrl;
                    dbutton.download = fileName;
                    img.src = fileUrl;
                    frame_images.appendChild(imgFrame)

                    img.addEventListener('click', () => {
                        imageFullViewFrame.style.display = "flex"
                        imageFullViewFrame.children.image.src = img.src
                    })

                } else {
                    frame_files.style.display = "flex"
                    const fileFrame = fileFrameTemplate.cloneNode(true).children.file_frame;
                    fileFrame.href = fileUrl;
                    fileFrame.download = fileName;
                    fileFrame.children.file_name.textContent = fileName;
                    frame_files.appendChild(fileFrame)
                }
            });
        } 

        if (imageFound) frame_images.style.height = "230px";

        frame_images.addEventListener('wheel', (e) => {
        if (frame_images.scrollWidth > frame_images.clientWidth) {
            e.preventDefault();
            frame_images.scrollBy({
                left: e.deltaY,
            });
        }
        }, { passive: false });

        const shouldScroll = isNearBottom(chatList, 100);

        chatList.appendChild(message);

        if (chatList && shouldScroll) utils.ScrollToBottom()
    }, 
    OnFormSubmit : async (event) => {
        event.preventDefault();
        let emitJson = {}

        if (input.value) emitJson.message = input.value
        const files = fileSender.files;

        if (files.length > 0) {
            emitJson.files = []

            for (let index = 0; index < files.length; index++) {
                const file = files[index]
                const formData = new FormData();
                formData.append("file", file);

                const res = await fetch("/upload", {
                    method: "POST",
                    body: formData
                });

                const data = await res.json();
                const fileObject = new Object({
                    url : data.url,
                    name : file.name
                }) 
                emitJson.files.push(fileObject)
                
            }
        }

        emitJson.chat = "all"
        if (input.value || files) socket.emit("msg_send", emitJson);
        input.value = "";
        utils.UpdateInputPosition()
        utils.ScrollToBottom()
        fileSender.value = "";
    },
    OnChatFilesPasted : (event) => {
        const items = event.clipboardData.items;
        let hasFiles = false
        if (items.length > 0) {
            const dataTransfer = new DataTransfer()
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.kind === "file") {
                    hasFiles = true
                    const file = item.getAsFile();
                    dataTransfer.items.add(file)
                }
            }
            if (hasFiles) {
                
                event.preventDefault()
                fileSender.files = dataTransfer.files
                console.log(input)
                input.focus()
            }
        }
    },
    UpdateInputPosition : (event) => {  
        input.style.height = "";
        input.style.height = `calc( ${input.scrollHeight}px - 0.5em)`
        input.parentElement.style.bottom = `calc( ${input.scrollHeight / 2 - 10}px)`
    },

    ScrollToBottom : () => {
        chatList.scrollTo({
            top: chatList.scrollHeight,
            behavior: "smooth"
        });
    }
}