let username;
let socket = io()
do {
    username = prompt("Enter Your User Name: ");
} while (!username);

const textArea = document.querySelector("#textarea");
const submitBtn = document.querySelector("#submitbtn");

const commentBox = document.querySelector(".comment_box");

submitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    let comment = textArea.value;

    if (!comment) {
        return;
    }
    postComment(comment);
})

function postComment(comment) {
    // Append Comment to DOM
    let data = {
        username: username,
        comment: comment,

    }
    appendToDom(data);
    textArea.value = "";
    // Broadcast

    broadComment(data);
    //sync with mongodb
    syncWithDb(data);
}

function appendToDom(data) {
    const lTag = document.createElement('li');
    lTag.classList.add("comment", "mb-3");
    let markup = `
    <div class="card border-light mb-3">
                            <div class="card-body">
                                <h6>${data.username}</h6>
                                <p>${data.comment}</p>
                                <div>
                                    <small>${moment(data.time).format('LT')}</small>
                                </div>
                            </div>
                        </div>
    
    `;
    lTag.innerHTML = markup;
    commentBox.prepend(lTag);
}

function broadComment(data) {
    // Socket
    socket.emit('comment', data);
}

socket.on('comment', (data) => {
    appendToDom(data);
})
let timerId = null;

function debounce(func, timer) {
    if (timerId) {
        clearTimeout(timerId)
    }
    timerId = setTimeout(() => {
        func();
    }, timer)
}

let typingDiv = document.querySelector(".typing");
socket.on('typing', (data) => {
    typingDiv.innerText = `${data.username} is Typing.....`
    debounce(function() {
        typingDiv.innerText = '';
    }, 1000);
});
//Event Listener on text area

textArea.addEventListener('keyup', (e) => {
    socket.emit('typing', { username: username });
})

//api Calls
function syncWithDb(data) {
    const headers = {
        'Content-Type': 'application/json'
    }
    fetch('/api/comments', { method: 'Post', body: JSON.stringify(data), headers })
        .then(response => response.json())
        .then(result => {
            console.log(result);

        })
}

function fetchComments() {
    fetch('/api/comments').then(res => res.json()).then(result => {
        result.forEach((comment) => {
            comment.time = comment.createdAt;
            appendToDom(comment)

        })
        console.log(result);

    })
}

window.onload = fetchComments();