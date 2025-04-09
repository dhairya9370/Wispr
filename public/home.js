//sidebar
        let btns = document.querySelectorAll(".icons");
        let gear = document.getElementById("gear");
        btns.forEach((btn, index) => {
            btn.addEventListener("click", () => {
                btns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                if (index !== 4) {
                    gear.style.transform = "rotate(-45deg)";
                }
            });

            btn.addEventListener("mouseover", () => {
                // Placeholder for hover functionality
            });
        });
        btns[0].click();
        gear.addEventListener("click", () => {
            gear.style.transform = gear.style.transform === "rotate(45deg)" ? "rotate(0deg)" : "rotate(45deg)";
        });

        //resizer
        const resizer = document.getElementById("resizer");
        const chat_container = document.getElementById("chat-container");
        const chat_window = document.getElementById("chat-window");
        let isResizing = false;
        function onMouseMove(event) {
            if (!isResizing) return;
            let containerWidth = document.body.clientWidth - 60; // Adjust for sidebar width
            let newWidth = event.clientX - 60; // Adjust for sidebar offset
            if (newWidth > 100 && newWidth < containerWidth - 100) { // Prevent extreme resizing
                chat_container.style.flex = `0 0 ${newWidth}px`;
                chat_window.style.flex = `1`;
            }
        }
        resizer.addEventListener("mousedown", (event) => {
            isResizing = true;
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", () => {
                isResizing = false;
                document.removeEventListener("mousemove", onMouseMove);
            });
        });

        //onclick chatbox
        // const btId =  btId ;
        // let receivedMsgsObj= JSON.parse('<%- received_messages %>');
        // let sentMsgsObj= JSON.parse('<%- sent_messages %>');
        //    for chatList , put the last message in received_messages in one variable and sent_messages in anothe
        // console.log("received:   ",receivedMsgsObj);
        // console.log("sent:   ",sentMsgsObj);


        let chatContainer = document.querySelector(".chatting-container");
        chatContainer.style.display = "none";//empty
        let emptyContainer = document.querySelector("#empty-chat-window-container");
        let receiver_name = document.querySelector("#receiever-name");
        let receiver_id = document.querySelector("#receiver-id");
        let sortedMsgs = [];
        async function sortChats(active_receiver_id) {

            const response = await fetch("/api/getAllMessages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chats_with: active_receiver_id.toString() }),
            });
            const result = await response.json();
            // console.log(result.received,result.sent);
            let receivedMsgsObj = result.received;
            let sentMsgsObj = result.sent;
            let receivedUnsorted = [];
            for (msg of receivedMsgsObj) {
                if (msg.from_id == active_receiver_id) {
                    let p = document.createElement("p");
                    p.innerText = msg.message;
                    let time = document.createElement("div");
                    time.className = "chattingbox-chat-time";
                    time.innerText = msg.at;
                    let message = document.createElement("div");
                    message.className = "message received";
                    message.appendChild(p);
                    message.appendChild(time);
                    receivedUnsorted.push(message);

                }
            }
            let sentUnsorted = [];
            for (msg of sentMsgsObj) {
                if (msg.to_id == active_receiver_id) {
                    let p = document.createElement("p");
                    p.innerText = msg.message;
                    let time = document.createElement("div");
                    time.className = "chattingbox-chat-time";
                    time.innerText = msg.at;
                    let message = document.createElement("div");
                    message.className = "message sent";
                    message.appendChild(p);
                    message.appendChild(time);
                    sentUnsorted.push(message);

                }
            }
            let unsorted = receivedUnsorted.concat(sentUnsorted);
            // console.log(unsorted);
            let sortedMsgs = await unsorted.sort((a, b) => {
                let timeA = new Date(a.querySelector(".chattingbox-chat-time").innerText);
                let timeB = new Date(b.querySelector(".chattingbox-chat-time").innerText);
                return timeA - timeB;
            });


            return sortedMsgs;
        }

        //recent chat, recent chat time, for chat list's chat boxes
        function formatTimestamp(dateString) {
            const inputDate = new Date(dateString);
            const currentDate = new Date();

            const inputDay = inputDate.getDate();
            const inputMonth = inputDate.getMonth();
            const inputYear = inputDate.getFullYear();

            const todayDay = currentDate.getDate();
            const todayMonth = currentDate.getMonth();
            const todayYear = currentDate.getFullYear();

            // Check if it's today
            if (
                inputDay === todayDay &&
                inputMonth === todayMonth &&
                inputYear === todayYear
            ) {
                // Convert to 12-hour format
                let hours = inputDate.getHours();
                let minutes = inputDate.getMinutes();
                let ampm = hours >= 12 ? 'PM' : 'AM';

                hours = hours % 12;
                hours = hours ? hours : 12; // 0 => 12
                minutes = minutes < 10 ? '0' + minutes : minutes;

                return `${hours}:${minutes} ${ampm}`;
            }

            // Check if it's yesterday
            const yesterdayDate = new Date();
            yesterdayDate.setDate(todayDay - 1);

            if (
                inputDay === yesterdayDate.getDate() &&
                inputMonth === yesterdayDate.getMonth() &&
                inputYear === yesterdayDate.getFullYear()
            ) {
                return 'Yesterday';
            }

            // Else, return DD-MM-YYYY
            const day = inputDay < 10 ? '0' + inputDay : inputDay;
            const month = inputMonth + 1 < 10 ? '0' + (inputMonth + 1) : (inputMonth + 1);

            return `${day}-${month}-${inputYear}`;
        }

        function addTimeStampsInChats(dateString) {
            dateString = dateString.toString();
            const inputDate = new Date(dateString);
            const currentDate = new Date();

            // Extract hours and minutes for 12-hour format
            let hours = inputDate.getHours();
            let minutes = inputDate.getMinutes();
            let ampm = hours >= 12 ? 'PM' : 'AM';

            hours = hours % 12 || 12; // Convert 0 to 12
            minutes = minutes.toString().padStart(2, '0'); // Ensure two-digit minutes

            let time = `${hours}:${minutes} ${ampm}`;

            // Extract date parts
            const inputDay = inputDate.getDate();
            const inputMonth = inputDate.getMonth() + 1; // Months are 0-indexed
            const inputYear = inputDate.getFullYear();

            const today = currentDate.getDate();
            const thisMonth = currentDate.getMonth() + 1;
            const thisYear = currentDate.getFullYear();

            // Check if the date is Today
            if (inputDay === today && inputMonth === thisMonth && inputYear === thisYear) {
                return { time, date: "Today" };
            }

            // Check if the date is Yesterday
            const yesterday = new Date();
            yesterday.setDate(today - 1);

            if (
                inputDay === yesterday.getDate() &&
                inputMonth === yesterday.getMonth() + 1 &&
                inputYear === yesterday.getFullYear()
            ) {
                return { time, date: "Yesterday" };
            }

            // Otherwise, return in DD-MM-YYYY format
            let date = `${String(inputDay).padStart(2, '0')}-${String(inputMonth).padStart(2, '0')}-${inputYear}`;

            return { time, date };

        };

        async function fetch_latest() {
            for (receiver of document.querySelectorAll(".chatbox")) {
                let sorted = await sortChats(receiver.querySelector("#to_id").innerText);
                // console.log(sorted[sorted.length-1].classList[1]);

                let time = sorted[sorted.length - 1].children[1].innerText.toString();
                // console.log(time);
                receiver.querySelector("#time").innerText = formatTimestamp(time);

                if (sorted[sorted.length - 1].classList[1].toString() == "sent") {
                    receiver.querySelector("#recent-chat").innerText = "You: " + sorted[sorted.length - 1].children[0].innerText.toString();
                } else {
                    receiver.querySelector("#recent-chat").innerText = sorted[sorted.length - 1].children[0].innerText.toString();
                }
            }
        };
        fetch_latest();

        document.querySelectorAll(".chatbox").forEach(chatbox => {
            chatbox.addEventListener("mouseover", function () {
                this.style.background = "#e9ecef"; // Light gray on hover
            });

            chatbox.addEventListener("mouseout", function () {
                this.style.background = ""; // Reset background on hover out
            });

            chatbox.addEventListener("mousedown", function () {
                this.style.background = "#d6d8db";

            });

            chatbox.addEventListener("mouseup", function () {
                this.style.background = "#e9ecef"; // Back to hover color after release
            });

            chatbox.addEventListener("click", async function () {

                receiver_name.innerText = this.children.block2.children["block2-1"].children[1].innerText;
                receiver_id.innerText = this.children.block2.children["block2-1"].children[0].innerText;

                sortedMsgs = await sortChats(receiver_id.innerText.toString());

                //add time stamps

                let prev = addTimeStampsInChats(sortedMsgs[sortedMsgs.length - 1].querySelector(".chattingbox-chat-time").innerText.toString()).date;
                for (i = sortedMsgs.length - 1; i >= 0; i--) {
                    let present = addTimeStampsInChats(sortedMsgs[i].querySelector(".chattingbox-chat-time").innerText.toString()).date;
                    if (prev == present) {//move up
                        if (i == 0) {
                            //insert at index '0'
                            sortedMsgs[i].querySelector(".chattingbox-chat-time").innerText = addTimeStampsInChats(sortedMsgs[i].querySelector(".chattingbox-chat-time").innerText).time;
                            let date = document.createElement("div");
                            date.className = "messageTimeStamp";
                            date.innerText = prev;
                            sortedMsgs.splice(0, 0, date);
                            break;
                        }
                    }
                    else {
                        let date = document.createElement("div");
                        date.className = "messageTimeStamp";
                        date.innerText = prev;
                        prev = present;
                        sortedMsgs.splice(i + 1, 0, date);

                    }
                    sortedMsgs[i].querySelector(".chattingbox-chat-time").innerText = addTimeStampsInChats(sortedMsgs[i].querySelector(".chattingbox-chat-time").innerText).time;

                }
                let chatBox = document.querySelector("#chatBox");
                chatBox.innerHTML = "";
                await sortedMsgs.forEach(msg => chatBox.appendChild(msg));
                emptyContainer.style.display = "none";
                chatContainer.style.display = "flex";
                await chatBox.scrollTo({ top: chatBox.scrollHeight });

            });
        });

        function toggleEmojiPicker() {
            let dropdown = document.getElementById("emojiDropdown");
            dropdown.style.display = (dropdown.style.display === "block") ? "none" : "block";
        }
        function addEmoji(emoji) {
            let inputField = document.getElementById("messageInput");
            inputField.value += emoji; // Emoji append karega
            inputField.focus(); // Input field active karega
            inputField.dispatchEvent(new Event("input", { bubbles: true })); // Send button toggle karega

            let emojiDropdown = document.getElementById("emojiDropdown");
            if (emojiDropdown.style.display !== "none") {
                emojiDropdown.style.display = "none"; // Dropdown close karega
            }
        }
        let messageInput = document.querySelector("#messageInput");
        let sendBtn = document.querySelector("#sendBtn");
        let voiceBtn = document.querySelector("#voiceBtn");
        sendBtn.style.display = "none";
        messageInput.addEventListener("input", function () {
            if (messageInput.value.trim() !== "") {
                sendBtn.style.display = "inline"; // Send button show
                voiceBtn.style.display = "none";
            } else {
                sendBtn.style.display = "none";
                voiceBtn.style.display = "inline";
            }
        });

        let BTID = JSON.parse('<%- Id %>');
        BTID = BTID.btId.toString();
        sendBtn.addEventListener("click", async () => {
            const message = messageInput.value.trim(); // Trim whitespace

            if (!message) {
                console.error("Message is empty!"); // Debugging output
                return; // Stop if the message is empty
            }

            try {
                const toId = document.querySelector("#receiver-id").innerText;
                const fromId = BTID.toString();
                const response = await fetch("/api/sendMessage", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ from_id: fromId, message, to_id: toId }), // Send the message and to_id
                });
                const result = await response.json();
                // await console.log(result.message.message);
                let chatBox = document.querySelector("#chatBox");
                let p = document.createElement("p");
                p.innerText = result.message.message;
                let time = document.createElement("div");
                time.className = "chattingbox-chat-time";

                time.innerText = addTimeStampsInChats(result.message.at).time;

                let msg = document.createElement("div");
                msg.className = "message sent";
                msg.appendChild(p);
                msg.appendChild(time);
                if (addTimeStampsInChats(sortedMsgs[sortedMsgs.length - 1].querySelector(".chattingbox-chat-time").innerText).date != addTimeStampsInChats(result.message.at).date) {
                    let receiver_chatboxes = document.querySelectorAll(".chatbox");

                    for (i = 0; i < receiver_chatboxes.length; i++) {
                        if (receiver_chatboxes[i].children.block2.children[0].children[0].innerText == toId) {
                            // console.log(receiver_chatboxes[i].children.block2.children[0].children[0].innerText);
                            receiver_chatboxes[i].click(); break;

                        }
                    }
                }
                else {
                    chatBox.appendChild(msg);//on sender's system
                    chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: "smooth" });
                } messageInput.value = ""; messageInput.dispatchEvent(new Event('input'));


            } catch (error) {
                console.error("Error sending message:", error); // Debugging output
            }
        });

        messageInput.addEventListener("keypress", function (event) {
            if (event.key === "Enter" && messageInput.value != "") {// Prevent form submission (if inside a form)
                document.getElementById("sendBtn").click(); // Trigger button click
            }
        });
    