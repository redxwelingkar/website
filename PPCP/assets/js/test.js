const api_url = "https://script.google.com/macros/s/AKfycbxLNOXKn86kq1HcVYxhersvP6YWAirdmWskOBukKxKJnESS4zL4AC0w6GFSUkA7o0jC7w/exec?";
// const api_url = "https://script.google.com/macros/s/AKfycbzPSXRntXbqVZ-tfmJazl44EkTU8sCsv7xT0wQJKDI_DtQHYqNw2wvBKML_HJjRstcC/exec?";
var result1 = "NA"

function adduploadbtn() {
    const media = document.getElementById("Media")

    console.log("media", media.children.length);
    var count = 0 + media.children.length
    media.innerHTML += `
    
        <div class="input-group" id="uploadgroup${count}">
            <input name="file" id="uploadfile" type="file" class="form-control" multiple>
            <div id="submit" class="btn btn-outline-secondary" onclick="upload(${count})" text="Upload">Upload</div>
        </div>
    
    `
}

var medialist = []
async function submit() {
    console.log("submit clicked");
    const uploadfile = document.getElementById(`uploadfile`);
    const fr = new FileReader();
    for (let i = 0; i < uploadfile.files.length; i++) {
        const file = uploadfile.files[i];
        var media = await readBuffer(file)
        // medialist.push(await readBuffer(file))
    }
    checkforupload(uploadfile.files.length)
}

function checkforupload(uploadfile) {
    var timer
    timer = setInterval(function () {
        console.log("timer", 1);
        console.log("list", `${medialist.length}, ${uploadfile}`);
        if (medialist.length == uploadfile) {
            clearInterval(timer);
            console.log("medialist", medialist);
        }
    }, 3000)
}

function readBuffer(file) {
    const fr = new FileReader();
    fr.readAsArrayBuffer(file);
    fr.onload = f => {
        // loading(count)
        const url = "https://script.google.com/macros/s/AKfycbw9xdNLGkgYPJJ5eEdnDpYJ3tMYJj5pawthFfceoZ-A6bEH7CEXUje6CpO5uQRyrXodjg/exec";  // <--- Please set the URL of Web Apps.
        // https://script.google.com/macros/s/AKfycbw9xdNLGkgYPJJ5eEdnDpYJ3tMYJj5pawthFfceoZ-A6bEH7CEXUje6CpO5uQRyrXodjg/exec?
        const qs = new URLSearchParams({ filename: file.name, mimeType: file.type });
        fetch(`${url}?${qs}`, {
            method: "POST", body: JSON.stringify([...new Int8Array(f.target.result)]), redirect: 'follow', headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
        })
            .then(res => res.json())
            .then(e => checkresult(e))
            .catch(err => handlerror("upload", err, file.name));
    }
}

function handlerror(fn, error, name) {
    console.error(fn, error);
    Swal.fire(`Error while uploading file : ${name}`, error, "error")
}

function checkresult(result) {
    medialist.push(result)
    console.info("result", result);
    // checkforupload()
}

async function doPost() {
    const url = "https://script.google.com/macros/s/AKfycby90UOLo3KpUu8wtvcBA7mLiu6CfZ2Y8Ic4NNsp4Vx6QnRpvT2ucEe-Y4fdk0FwVX3U/exec";

    result1 = await fetch(url, {
        method: "POST",
        // params: {
        //     data1: "This is data1",
        //     data2: "This is data2",
        // },
        body: {
            data1: "This is data1",
            data2: "This is data2",
        },
        // mode: "no-cors",
        redirect: 'follow',
        headers: {
            "Content-Type": "json",
            // "Content-Type": "text/plain",
            "Host": "script.google.com",
        }
    }).then(res => {
        console.log("res.json", res);
    }).then(result => {
        console.log("result", result);
    }).catch(error => {
        console.log("error", error);
    })

}
