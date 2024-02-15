const v300 = "https://script.google.com/macros/s/AKfycbzPSXRntXbqVZ-tfmJazl44EkTU8sCsv7xT0wQJKDI_DtQHYqNw2wvBKML_HJjRstcC/exec?";

/* Global states */

var activefilter = { "domain": "Clear Filter", "program": "Clear Filter", "status": "Clear Filter" }
var searchby = "NA"
var medialist = []
var compactview = true
var GPP = []            //all enteries
var filteredPP = []     //filtered all enteries
var filters = []
var user
var userrequestlist = []


/* Global states */

/* Onpage load triggers */
if (!window.location.href == "/pcpauth") {
    if (!window.location.href == "/register") {
        verifyuser()
    }
}

function onloadfacultyhome() {
    verifyuser()
    getPP()
    getfilters()
}

function onloadstudenthome() {
    verifyuser()
    displayusername()
    getPPbyemail()
    getactivedomains()
}

function onloadrequests() {
    verifyuser()
    displayusername()
    getnewrequests()
}

function accessrequests() {
    // TODO: secure routes from backend
    verifyuser()
    if (user) {
        if (user.access_status == "ADMIN") {
            // alert("Under Development")
            // alert("Redirected")
            window.location.href = "/PCP/pcprequest.html"
            displayusername()
        } else {
            alert("Access Denied")
            console.log("user", user)
        }
    } else { alert("user not found") }
}
/* Onpage load triggers */

/* Get from DB */
async function getPP() {
    data = {
        url: v300,
        params: {
            'code': 'readall'
        }
    }
    const query = encodeQuery(data)
    // console.log("query", query)
    const res = await fetch(query);
    const PS = await res.json();
    if (res.status != 200) alert("Request returnde status code", res.status);
    if (res.status === 200) {
        GPP = PS
        renderpp()
        // console.log("getPP GPP", GPP);
    }
}

async function getfilters() {
    data = {
        url: v300,
        params: {
            'code': 'getfilters'
        }
    }
    const query = encodeQuery(data)
    const response = await fetch(query);
    const res = await response.json();
    if (response.status != 200) alert("Request returnde status code", res.status);
    if (response.status === 200) {
        filters = res
        renderfilters()
    }
}

async function getnewrequests() {
    const newuser = document.getElementById("userrequestlist")
    newuser.innerHTML = `<h4>Loading Please Wait...</h4>`

    data = {
        url: v300,
        params: {
            'code': 'getnewusers'
        }
    }
    const query = encodeQuery(data)
    // console.log("query", query)
    const res = await fetch(query);
    const PS = await res.json();
    if (res.status != 200) alert("Request returned status code", res.status);
    if (res.status === 200) {
        if (PS.error) Swal.fire("An Error Occured", PS.error, "error")
        else {
            userrequestlist = PS
            renderrequestlist()
        }

    }
}

async function getPPbyemail() {
    const list = document.getElementById("PSList");
    list.innerHTML = `<h4>Loading Please wait...</h4>`;
    const user = JSON.parse(sessionStorage.getItem("user"));
    // console.log("user", user.user);
    const email = user.email;

    data = {
        url: v300,
        params: {
            'code': 'email',
            'email': email
        }
    };
    const query = encodeQuery(data);
    // console.log("query", query)
    const res = await fetch(query);
    const PS = await res.json();
    console.log("res", res.status);
    if (res.status != 200) alert("Request returned status code", res.status);
    if (res.status === 200) {
        GPP = PS
        list.innerHTML = ""
        if (GPP.length == 0) list.innerHTML = `<h1>All your Uploaded Pain Points will be displayed here</h1>`
        else {
            renderpp()
        }

    };
};


async function getactivedomains() {
    data = {
        url: v300,
        params: {
            'code': 'getactivedomains',
        }
    }
    const query = encodeQuery(data)
    const response = await fetch(query);
    const res = await response.json();
    if (response.status != 200) alert("Request returned status code", response.status);
    if (response.status === 200) {
        setactivedomains(res)
    }
    // TODO: error handling
}
/* Get from DB */

/* Send to DB */
async function tag(id, status) {
    toggletags(id)
    const spinId = `spin-${id}`;
    const spin = document.getElementById(spinId)
    const checkbox = document.getElementById(id + "+btn")

    if (spin.style.display === 'none') {
        spin.style.display = 'block';
        checkbox.style.display = 'none';
    }

    data = {
        url: v300,
        params: {
            code: "markstatus",
            uuid: id,
            status: status,
        },
    };
    const query = encodeQuery(data);
    const response = await fetch(query);
    const res = await response.json();
    if (spin.style.display === 'block') {
        spin.style.display = 'none';
        checkbox.style.display = 'block';
    }
    if (response.status != 200) alert("Request returned status code", res.status);
    if (response.status === 200) {
        if (res.status === "SUCCESS") {
            updaterow(id, status)
            updateGPP(id, status)
        }
    }

}

async function handlenewuserrequest(btn) {
    Swal.fire("Please wait")
    const status = btn.innerText
    const userID = btn.id
    let code = "rejectaccess"
    console.log("status", status);

    if (status == "Accept") code = "grantaccess";
    data = {
        url: v300,
        params: {
            'code': code,
            'uuid': userID
        }
    }
    const query = encodeQuery(data)
    // console.log("query", query)
    const res = await fetch(query);
    const PS = await res.json();
    if (res.status != 200) alert("Request returned status code", res.status);
    if (res.status === 200) {
        if (PS.error) Swal.fire("An Error Occured", PS.error, "error")
        else {
            Swal.fire("Success!", "Accepted Successfully", "success");
            getnewrequests()
        }
    }
}
/* Send to DB */

/* show on page functions */
function renderfilters() {
    const domainfilter = document.getElementById("domainfilter")
    const programfilter = document.getElementById("programfilter")
    const Statusfilter = document.getElementById("Statusfilter")

    programfilter.innerHTML = ""
    domainfilter.innerHTML = ""
    Statusfilter.innerHTML = ""

    const domainlist = filters.domain
    const programlist = filters.program
    programfilter.innerHTML = `<li><div class="dropdown-item" onclick=programactive(this)>Clear Filter</div></li>`
    domainfilter.innerHTML = `<li><div class="dropdown-item" onclick=domainactive(this)>Clear Filter</div></li>`

    domainlist.forEach(i => {
        domainfilter.innerHTML += `<li><div class="dropdown-item" onclick=domainactive(this)>${i}</div></li>`
    })

    programlist.forEach(i => {
        programfilter.innerHTML += `<li><div class="dropdown-item" onclick=programactive(this)>${i}</div></li>`
    })

    Statusfilter.innerHTML = `
    <li><div class="dropdown-item" onclick=Statusactive(this)>Clear Filter</div></li>
    <li><div class="dropdown-item" onclick=Statusactive(this)>Accepted</div></li>
    <li><div class="dropdown-item" onclick=Statusactive(this)>Rejected</div></li>
    `

}

function renderpp() {
    const user = JSON.parse(sessionStorage.getItem('user'))
    console.log("renderpp", user.access_status);
    if (user.access_status == "ADMIN" || user.access_status == "FACULTY") renderfacultypp()
    if (user.access_status == "STUDENT") renderstudentpp()
}

function renderfacultypp() {
    const PSlist = document.getElementById("PSList");
    const filterbar = document.getElementById("filterbar")
    const PSHeader = document.getElementById("PSHeader")
    filterbar.removeAttribute("hidden")
    filterbar.classList.add("d-flex")
    PSHeader.removeAttribute("hidden")
    PSlist.innerHTML = ""

    if (filteredPP.length <= 0) {
        if (activefilter.status != "Clear Filter" || activefilter.domain != "Clear Filter" || activefilter.program != "Clear Filter") {
            PSlist.innerHTML = `<h1>No items found, Clear filters and try again</h1>`
            return
        }
        filteredPP = GPP
    }
    filteredPP.forEach((i) => {
        const checkboxId = `check-${i.uuid}`;
        const spinId = `spin-${i.uuid}`;
        const formattedDate = formatTimestamp(`${i.timestamp}`);

        if (!i.tag) {
            PSlist.innerHTML += `
                <div id="${i.uuid}" class="flex-container">
                    <div id="${i.uuid}+row_tick" class="row-tick">
                        <button data-bs-toggle="popover" class="row-button" onclick="toggletags('${i.uuid}')" id="${i.uuid}+btn" type="button" value=" " style="display: block;">
                            <img id="${i.uuid}+checkbox" src="./assets/img/uncheck.svg" alt="unmarked" width="100%" height="100%">
                        </button>
                        <div class="loader" id="${spinId}" style="display: none;"></div>
                        <div id="${i.uuid}+tags" class="custom_pill" style="display: none;">
                            <img class="selectionboxleft " src="./assets/img/accepted.svg" alt="check" onclick="tag('${i.uuid}','accepted')">
                            <img class="selectionboxright " src="./assets/img/rejected.svg" alt="cross" onclick="tag('${i.uuid}','rejected')">
                        </div>
                    </div>
                    <div id="${i.uuid}+row_title" class="row-title-bg">
                        <div class="row-title-ps-title">
                            ${i.title}
                        </div>
                        <div class="row-title-ps-domain">
                            ${i.domain}
                        </div>
                        <div class="row-title-ps-number">
                            ${i.uuid}
                            <div class="row-title-ps-time">${formattedDate}</div>
                        </div>
                    </div>
                    <div id="${i.uuid}+row_desc" class="row-desc-bg">
                        <div class="row-desc-ps-desc">
                            ${i.description}
                        </div>
                    </div>
                    <div id="${i.uuid}+row_sol" class="row-sol-bg">
                        <div class="row-sol-ps-sol">
                            ${i.solution}
                        </div>
                    </div>
                    <div id="${i.uuid}+row_img" class="row-img-bg" onclick="renderviewMore('${i.uuid}')">
                        <div class="row-img-flex">
                            <div class="row-img-view-picture-icon"></div>
                            <div class="row-img-info-icon"></div>
                            <div class="row-img-add-comment-icon"></div>
                        </div>
                        <div class="row-img-font">
                            View More
                        </div>
                    </div>
                </div>
                <div style="height: 5px"></div>
                `;
        } else if (i.tag === "accepted") {
            PSlist.innerHTML += `
                <div id="${i.uuid}" class="flex-container">
                    <div id="${i.uuid}+row_tick" class="row-tick-green">
                        <button data-bs-toggle="popover" data-bs-trigger="focus" class="row-button" onclick="toggletags('${i.uuid}')" id="${i.uuid}+btn" type="button" value="accepted" style="display: block;">
                            <img id="${i.uuid}+checkbox" src="./assets/img/accepted.svg" alt="unmarked" width="100%" height="100%">
                        </button>
                        <div class="loader" id="${spinId}" style="display: none;"></div>
                        <div id="${i.uuid}+tags" class="custom_pill" style="display: none;">
                            <img class="selectionboxleft " src="./assets/img/accepted.svg" alt="check" onclick="tag('${i.uuid}','accepted')">
                            <img class="selectionboxright " src="./assets/img/rejected.svg" alt="cross" onclick="tag('${i.uuid}','rejected')">
                        </div>
                    </div>
                    <div id="${i.uuid}+row_title" class="row-title-bg-green">
                        <div class="row-title-ps-title">
                            ${i.title}
                        </div>
                        <div class="row-title-ps-domain">
                            ${i.domain}
                        </div>
                        <div class="row-title-ps-number">
                            ${i.uuid}
                            <div class="row-title-ps-time">${formattedDate}</div>
                        </div>
                    </div>
                    <div id="${i.uuid}+row_desc" class="row-desc-bg-green">
                        <div class="row-desc-ps-desc">
                            ${i.description}
                        </div>
                    </div>
                    <div id="${i.uuid}+row_sol" class="row-sol-bg-green">
                        <div class="row-sol-ps-sol">
                            ${i.solution}
                        </div>
                    </div>
                    <div id="${i.uuid}+row_img" class="row-img-bg-green" onclick="renderviewMore('${i.uuid}')">
                        <div class="row-img-flex">
                            <div class="row-img-view-picture-icon"></div>
                            <div class="row-img-info-icon"></div>
                            <div class="row-img-add-comment-icon"></div>
                        </div>
                        <div class="row-img-font">
                            View More
                        </div>
                    </div>
                </div>
                <div style="height: 5px"></div>
                `;
        } else if (i.tag === "rejected") {
            PSlist.innerHTML += `
                <div id="${i.uuid}" class="flex-container">
                    <div id="${i.uuid}+row_tick" class="row-tick-red">
                        <button class="row-button" onclick="toggletags('${i.uuid}')" id="${i.uuid}+btn" type="button" value="rejected" style="display: block;" data-bs-trigger="focus" data-bs-toggle="popover">
                            <img id="${i.uuid}+checkbox" src="./assets/img/rejected.svg" alt="unmarked" width="100%" height="100%">
                        </button>
                        <div class="loader" id="${spinId}" style="display: none;"></div>
                        <div id="${i.uuid}+tags" class="custom_pill" style="display: none;">
                            <img class="selectionboxleft " src="./assets/img/accepted.svg" alt="check" onclick="tag('${i.uuid}','accepted')">
                            <img class="selectionboxright " src="./assets/img/rejected.svg" alt="cross" onclick="tag('${i.uuid}','rejected')">
                        </div>
                    </div>
                    <div id="${i.uuid}+row_title" class="row-title-bg-red">
                        <div class="row-title-ps-title">
                            ${i.title}
                        </div>
                        <div class="row-title-ps-domain">
                            ${i.domain}
                        </div>
                        <div class="row-title-ps-number">
                            ${i.uuid}
                            <div class="row-title-ps-time">${formattedDate}</div>
                        </div>
                    </div>
                    <div id="${i.uuid}+row_desc" class="row-desc-bg-red">
                        <div class="row-desc-ps-desc">
                            ${i.description}
                        </div>
                    </div>
                    <div id="${i.uuid}+row_sol" class="row-sol-bg-red">
                        <div class="row-sol-ps-sol">
                            ${i.solution}
                        </div>
                    </div>
                    <div id="${i.uuid}+row_img" class="row-img-bg-red" onclick="renderviewMore('${i.uuid}')">
                        <div class="row-img-flex">
                            <div class="row-img-view-picture-icon"></div>
                            <div class="row-img-info-icon"></div>
                            <div class="row-img-add-comment-icon"></div>
                        </div>
                        <div class="row-img-font">
                            View More
                        </div>
                    </div>
                </div>
                <div style="height: 5px"></div>
                `;
        }
    });
}

function renderrequestlist() {
    const newuser = document.getElementById("userrequestlist")
    newuser.innerHTML = ""
    if (userrequestlist.length == 0) newuser.innerHTML = `<h1>No new request</h1>`
    else {
        userrequestlist.forEach(i => {
            newuser.innerHTML += `
    <div class="card m-3 shadow">
            <div class="card-body">
                <div class="d-flex flex-row justify-content-between align-items-center">
                    <div>
                    <div>UserID: ${i.uuid}</div>
                    <div>Name:  ${i.name} </div>
                    <div>Email:  ${i.email} </div>
                    <div>Program:  ${i.program} </div>
                    <div>Student Id/ Roll no. :  ${i.stdid} </div>
                    </div>
                    <div class="justify-center ">
                        <div class="btn btn-outline-success btn-green d-flex flex-row m-2" onclick="handlenewuserrequest(this)" id="${i.uuid}">Accept</div>
                        <div class="btn btn-outline-danger btn-light d-flex flex-row m-2" onclick="handlenewuserrequest(this)" id="${i.uuid}">Reject</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`
        })
    }
}

function renderstudentpp() {
    // render add btn
    const addbtn = document.getElementsByClassName("fixedButton")
    addbtn[0].classList.remove("hidden")

    const PSList = document.getElementById("PSList")
    PSList.innerHTML = ""
    console.log("renderstudentpp", GPP);
    GPP.forEach(i => {

        const formattedDate = formatTimestamp(`${i.timestamp}`);
        PSList.innerHTML += `
        <div class="card m-1" onclick=viewfullpagepp("${i.uuid}")>
            <div class="card-body">
                <h5 class="card-title subsection-header ">${i.title}</h5>
                <p class="card-text subsection-header ">${i.domain}</p>
                <div class="d-flex justify-content-between">
                    <p class="subsection-content">${i.uuid}</p>
                    <p class="subsection-content">${formattedDate}</p>
                </div>
            </div>
        </div>
        `
    })



}

function viewfullpagepp(uuid) {
    // get the item clicked data form local global variable
    var pp
    GPP.forEach(i => {
        if (i.uuid == uuid) {
            pp = i
            return
        }
    })

    // hide add btn
    const addbtn = document.getElementsByClassName("fixedButton")
    addbtn[0].classList.add("hidden")

    const PSList = document.getElementById("PSList")
    PSList.innerHTML = ""
    PSList.innerHTML += `
    <div class="d-flex flex-row">
        <div class="d-flex flex-column btn back_btn" onclick="renderstudentpp()">
            <img src="./assets/img/circle-arrow-left-solid.svg" alt="Back to Pain PointList">
        </div>
        <div class="d-flex flex-column" style="background-color: rgb(255, 255, 255); width: 100%;">
            <div class="d-flex justify-content-between ">
                <div>
                    <div id="P-title" class="h4 title">
                        <span id="P-ID">${pp.uuid}</span>
                        ${pp.title}
                    </div>
                    <div id="P-domain" class="domain">${pp.domain}</div>
                </div>
            </div>

            <div class="d-flex flex-column p-2">
                <div class="subsection-header">Description</div>
                <div class="subsection-content" id="description">
                    ${pp.description}
                </div>
            </div>
            <div class="d-flex flex-column p-2">
                <div class="subsection-header">Solution</div>
                <div class="subsection-content" id="solution">
                    ${pp.solution}
                </div>
            </div>

            <div class="p-2" id="media"></div>
            <div class="line"></div>
            <div id="RemarksSection"></div>
        </div>
    </div>
    `
    // render media if present
    const mediadiv = document.getElementById("media")

    if (pp.media.length != 0) {
        mediadiv.innerHTML = `<h5>Media</h5>`
        var media = JSON.parse(pp.media)
        media.forEach(i => {
            mediadiv.innerHTML += `
            <a class="p-1 media-card btn" href="${i.fileUrl}" target="_blank">
                <div class="domain">${i.filename}</div>
            </a>
            `
        })

    }
    getremarks(uuid)
}

function renderviewMore(uuid) {
    // get the item clicked data form local global variable
    var pp
    GPP.forEach(i => {
        if (i.uuid == uuid) {
            pp = i
            return
        }
    })
    const PSList = document.getElementById("PSList")
    const filterbar = document.getElementById("filterbar")
    const PSHeader = document.getElementById("PSHeader")
    filterbar.setAttribute("hidden", true)
    filterbar.classList.remove("d-flex")
    PSHeader.setAttribute("hidden", true)
    PSList.innerHTML = ""
    PSList.innerHTML += `
        
    <div class="d-flex flex-row">
                <div class="d-flex flex-column btn back_btn" onclick="renderfacultypp()">
                    <img src="./assets/img/circle-arrow-left-solid.svg" alt="Back to Pain PointList">
                </div>
                <div class="d-flex flex-column" style="background-color: rgb(255, 255, 255); width: 100%;">
                    <div class="d-flex justify-content-between ">
                        <div>
                            <div id="P-title" class="h4 title">
                                <span id="P-ID">${pp.uuid}</span>
                                ${pp.title}
                            </div>
                            <div id="P-domain" class="domain">${pp.domain}</div>
                        </div>
                    </div>

                    <div class="d-flex flex-column p-2">
                        <div class="subsection-header">Description</div>
                        <div class="subsection-content" id="description">
                            ${pp.description}
                        </div>
                    </div>
                    <div class="d-flex flex-column p-2">
                        <div class="subsection-header">Solution</div>
                        <div class="subsection-content" id="solution">
                            ${pp.solution}
                        </div>
                    </div>

                    <div class="p-2" id="media">

                    </div>
                    <div class="studentinfoSectiondiv">
                        <div class="subsection-header">Student Info</div>
                        <div class="subsection-content">
                            <table>
                                <tr class="">
                                    <td class="studentinforow col p-1">Name</td>
                                    <td class="studentinforow col p-1">: ${pp.name}</td>
                                </tr>
                                <tr class="">
                                    <td class="studentinforow col p-1">Program</td>
                                    <td class="studentinforow col p-1">: ${pp.program}</td>
                                </tr>
                                <tr class="">
                                    <td class="studentinforow col p-1">ID/Roll no</td>
                                    <td class="studentinforow col p-1">: ${pp.std_ID}</td>
                                </tr>
                                <tr class="">
                                    <td class="studentinforow col p-1">Email</td>
                                    <td class="studentinforow col p-1">: ${pp.email}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <div class="p-2" id="remarkssection">
                        <div class="mb-3">
                            <label for="remarkedittext" class="form-label subsection-header">Remarks</label>
                            <textarea class="form-control description purple_border" id="remarkedittext"
                                rows="3"></textarea>
                            <div class="mt-3 mb-3 d-flex justify-content-end">

                                <button id="saveremarkbtn" type="button" class="btn btn-outline-primary shadow purple_border"
                                    onclick=saveremark()>Save</button>
                            </div>
                            <div class="line"></div>
                            <div id="RemarksSection">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        `
    // render media if present
    const mediadiv = document.getElementById("media")

    if (pp.media.length != 0) {
        mediadiv.innerHTML = `<h5>Media</h5>`
        var media = JSON.parse(pp.media)
        media.forEach(i => {
            mediadiv.innerHTML += `
            <a class="p-1 media-card btn" href="${i.fileUrl}" target="_blank">
                <div class="title">${i.filename}</div>
            </a>
                `
        })
    }
    getremarks(uuid)
}

function toggletags(uuid) {
    var options = document.getElementById(uuid + "+tags")
    if (options.style.display == "none") options.style.display = "block"
    else options.style.display = "none"
}

function updaterow(id, status) {
    if (status == "accepted") {
        document.getElementById(id + "+row_tick").className = ""
        document.getElementById(id + "+row_tick").classList.toggle("row-tick-green")
        document.getElementById(id + "+row_title").className = ""
        document.getElementById(id + "+row_title").classList.toggle("row-title-bg-green")
        document.getElementById(id + "+row_desc").className = ""
        document.getElementById(id + "+row_desc").classList.toggle("row-desc-bg-green")
        document.getElementById(id + "+row_sol").className = ""
        document.getElementById(id + "+row_sol").classList.toggle("row-sol-bg-green")
        document.getElementById(id + "+row_img").className = ""
        document.getElementById(id + "+row_img").classList.toggle("row-img-bg-green")
        document.getElementById(id + "+checkbox").src = "./assets/img/accepted.svg"
    } else {
        document.getElementById(id + "+row_tick").className = ""
        document.getElementById(id + "+row_tick").classList.toggle("row-tick-red")
        document.getElementById(id + "+row_title").className = ""
        document.getElementById(id + "+row_title").classList.toggle("row-title-bg-red")
        document.getElementById(id + "+row_desc").className = ""
        document.getElementById(id + "+row_desc").classList.toggle("row-desc-bg-red")
        document.getElementById(id + "+row_sol").className = ""
        document.getElementById(id + "+row_sol").classList.toggle("row-sol-bg-red")
        document.getElementById(id + "+row_img").className = ""
        document.getElementById(id + "+row_img").classList.toggle("row-img-bg-red")
        document.getElementById(id + "+checkbox").src = "./assets/img/rejected.svg"
    }

}

function updateGPP(id, status) {
    for (let i = 0; i < GPP.length; i++) {
        const item = GPP[i];
        if (item.uuid == id) {
            item.tag = status
            return
        }
    }
}


/* show on page functions */

/* Remarks Section */
async function getremarks(uuid) {
    const RemarksSection = document.getElementById("RemarksSection");
    RemarksSection.innerText = "Loading remarks";
    data = {
        url: v300,
        params: {
            code: "readremarks",
            uuid: uuid,
        },
    };
    console.log("remarks data", data);

    const query = encodeQuery(data);
    const response = await fetch(query);
    const res = await response.json();
    if (response.status != 200) alert("Request returnde status code", res.status);
    if (response.status === 200) {
        console.log("remarks", res);
        if (res.length == 0) {
            RemarksSection.innerText = "No Remarks yet";
            return
        }

        let sortedres = res.sort(function (a, b) {
            return b.timestamp.localeCompare(a.timestamp);
        });

        RemarksSection.innerHTML = "";

        sortedres.forEach((i) => {
            RemarksSection.innerHTML += `
            <div class="remark_header m-1">
                ${i.givenby}
            </div>
            <div class="card shadow p-2">
                <div class="d-flex flex-row">
                    <div class="remark_content"> ${i.remark}</div>
                </div>
            </div>
            `;
        });
    }
}


async function saveremark() { // continue here 06/02
    // swal.fire("Info", "Please wait", "info");
    var remarkedittext = document.getElementById("remarkedittext");
    var saveremarkbtn = document.getElementById("saveremarkbtn");
    var remark = remarkedittext.value;
    console.log("remark value", remark.length);
    if (remark.length <= 0) {
        swal.fire("Error", "Remark cannot be empty", "error");
        return
    }
    swal.fire("Info", "Please wait", "info");
    saveremarkbtn.setAttribute("disabled", true)
    var uuid = document.getElementById("P-ID").innerText
    data = {
        url: v300,
        params: {
            code: "remark",
            uuid: uuid,
            givenby: user.name,
            remark: remark,
        },
    };
    const query = encodeQuery(data);
    const response = await fetch(query);
    const res = await response.json();
    saveremarkbtn.removeAttribute("disabled")
    if (response.status != 200) alert("Request returned status code", res.status);
    if (response.status === 200) {
        swal.fire("Success", "Remark Added Successfully", "success");
        remarkedittext.value = ""
        getremarks(uuid);
    }
}

/* Remarks Section End*/

/* PP Upload form  */
/* 
// TODO:
1. Delete file does not work
2. description is not uploaded
1. disable upload until there is file present in the block
2. clear indicators on file upload step
3. loader after submit pp
 */

async function checkSubmission() {
    /* creating parallel read streams for every file 
    */
    const uploadfile = document.getElementById(`uploadfile`);
    const fr = new FileReader();
    Swal.fire("Please wait", "Uploading Pain Point", "info")
    disablesubmit()
    if (uploadfile.files.length > 0) {
        Swal.fire("Please wait", "Uploading Files", "info")
        for (let i = 0; i < uploadfile.files.length; i++) {
            const file = uploadfile.files[i];
            var media = await readBuffer(file)
        }
        checkforupload(uploadfile.files.length)
    } else {
        ppformsubmit()
    }
}

function checkforupload(uploadfile) {
    /* checking if files selected for upload have been uploaded
    every 3 sec until files found are equal to files uploaded    
    */
    var timer
    timer = setInterval(function () {
        if (medialist.length == uploadfile) {
            clearInterval(timer);
            console.log("medialist", medialist);
            ppformsubmit()
        }
    }, 3000)
}


const form = document.getElementById('ppform');
function ppformsubmit() {
    /* Gathering all values from the form
     */
    const user = JSON.parse(sessionStorage.getItem("user"))
    var domain = document.getElementById("ActiveDomainbtn").innerText
    var title = document.getElementById("PSTitle").value
    var description = document.getElementById("PSDescription").value
    var solution = document.getElementById("PSSolution").value
    var media = JSON.stringify(medialist)
    if (PSformval(user, domain, title, description)) {
        console.log("Submitted");
        submitpp(user, domain, title, description, media, solution)
    } else {
        enablesubmit()
    }
}

async function submitpp(user, domain, title, description, media, solution) {
    data = {
        url: v300,
        params: {
            'code': 'addpp',
            'email': user.email,
            'name': user.name,
            'stdID': user.roll_id,
            'program': user.program,
            'domain': domain,
            'title': title,
            'description': description,
            'media': media,
            'solution': solution,
        }
    }
    const query = encodeQuery(data)
    const response = await fetch(query);
    const res = await response.json();
    if (res.status == "SUCCESS") {
        Swal.fire("Success", "Pain Point has been submitted", "success")
        window.location.reload()
    }
    else {
        enablesubmit()
        Swal.fire("Upload failed", res.message, "error")
    }
}


function readBuffer(file) {
    const fr = new FileReader();
    fr.readAsArrayBuffer(file);
    fr.onload = f => {
        const url = "https://script.google.com/macros/s/AKfycbw9xdNLGkgYPJJ5eEdnDpYJ3tMYJj5pawthFfceoZ-A6bEH7CEXUje6CpO5uQRyrXodjg/exec";  // <--- Please set the URL of Web Apps.
        // https://script.google.com/macros/s/AKfycbw9xdNLGkgYPJJ5eEdnDpYJ3tMYJj5pawthFfceoZ-A6bEH7CEXUje6CpO5uQRyrXodjg/exec?
        const qs = new URLSearchParams({ filename: file.name, mimeType: file.type });
        fetch(`${url}?${qs}`, {
            method: "POST", body: JSON.stringify([...new Int8Array(f.target.result)]), redirect: 'follow', headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
        })
            .then(res => res.json())
            .then(e => addmediatolist(e))
            .catch(err => handlerror("upload", err, file.name));
    }
}

function addmediatolist(result) {
    medialist.push(result)
}

function handlerror(fn, error, name) {
    console.error(fn, error);
    Swal.fire(`Error while uploading file : ${name}`, error, "error")
}


function openAdd() {
    document.getElementById("uploadform").style.display = "block";
    document.getElementById("uploadformbg").style.display = "block";
}
function closeAdd() {
    document.getElementById("uploadform").style.display = "none";
    document.getElementById("uploadformbg").style.display = "none";
}
function  enablesubmit() {
    document.getElementById(`submitbtn`).removeAttribute("disabled")
}
function disablesubmit() {
    document.getElementById(`submitbtn`).setAttribute("disabled", "disabled");
}
function setactivedomains(res) {
    const ActiveDomain = document.getElementById("ActiveDomain")
    ActiveDomain.innerHTML = ""
    const domainlist = res.domain
    domainlist.forEach(i => {
        ActiveDomain.innerHTML += `<li><div class="dropdown-item" onclick=selectdomain(this)>${i}</div></li>`
    })
}

function selectdomain(item) {
    const ActiveDomainbtn = document.getElementById("ActiveDomainbtn")
    ActiveDomainbtn.innerText = item.innerText
}

function PSformval(user, domain, title, description) {
    /* form Validation for PP form */
    if (user == "") {
        console.log("no user");
        Swal.fire("user not found please login and try again", "", "error")
        return false
    }
    if (domain == "Select Domain") {
        console.log("no domain");
        Swal.fire("Please select domain", "", "info")
        return false
    }

    if (title.length <= 0) {
        console.log("no title");
        Swal.fire("Please Enter Title", "", "info")
        return false
    }
    if (description.length <= 0) {
        console.log("no description");
        Swal.fire("Please Enter Description", "", "info")
        return false
    }
    return true
}

/* Depricated in favor of multiple file upload
function adduploadbtn() {
    const media = document.getElementById("Media")

    console.log("media", media.children.length);
    var count = 0 + media.children.length
    media.innerHTML += `
    
        <div class="input-group" id="uploadgroup${count}">
            <input name="file" id="uploadfile${count}" type="file" class="form-control">
            <div id="submit" class="btn btn-outline-secondary" onclick="upload(${count})" text="Upload">Upload</div>
        </div>
    
    `
}
 

async function upload(count) {
    const file = document.getElementById(`uploadfile${count}`);

    const fr = new FileReader();
    fr.readAsArrayBuffer(file.files[0]);
    fr.onload = f => {
        loading(count)
        const url = "https://script.google.com/macros/s/AKfycbw9xdNLGkgYPJJ5eEdnDpYJ3tMYJj5pawthFfceoZ-A6bEH7CEXUje6CpO5uQRyrXodjg/exec";  // <--- Please set the URL of Web Apps.
        // https://script.google.com/macros/s/AKfycbw9xdNLGkgYPJJ5eEdnDpYJ3tMYJj5pawthFfceoZ-A6bEH7CEXUje6CpO5uQRyrXodjg/exec?
        const qs = new URLSearchParams({ filename: file.files[0].name, mimeType: file.files[0].type });
        fetch(`${url}?${qs}`, {
            method: "POST", body: JSON.stringify([...new Int8Array(f.target.result)]), redirect: 'follow', headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
        })
            .then(res => res.json())
            .then(e => checkresult(e, count))
            .catch(err => handlerror("upload", err, file.files[0].name));
    }
}



function handlerror(fn, error, name) {
    console.error(fn, error);
    Swal.fire(`Error while uploading file : ${name}`, error, "error")
}

function loading(count) {
    const file = document.getElementById(`uploadgroup${count}`);
    document.getElementById(`submitbtn`).setAttribute("disabled", "disabled");
    file.innerHTML =
        `
    <div class="loader"></div>
    `
}

function checkresult(result, count) {
    document.getElementById(`uploadgroup${count}`).innerHTML = '';
    if (result.fileUrl) {
        medialist.push(result)
        // sessionStorage.setItem("medialist",JSON.stringify(medialist))
        displayuploads()
        document.getElementById(`submitbtn`).removeAttribute("disabled");
    } else {
        file.innerHTML =
            `
    <div>${result}</div>
    `
    }
}

function displayuploads() {
    const files = document.getElementById(`Media`);
    console.log("medialist", medialist);
    files.innerHTML = ''
    medialist.forEach(i => {
        files.innerHTML += `
        <div class="input-group mb-3">
            <span  class="form-control"><a href="${i.fileUrl}" target="_blank">${i.filename}</a></span>
            <button class="btn btn-outline-secondary" type="button" onclick="deletefile('${i.fileId}')"><img class="del"
                    src="./assets/img/delete.png" alt="delete" srcset=""></button>
        </div>
        `
    })
}

async function deletefile(fileId) {
    data = {
        url: v300,
        params: {
            'code': 'deleteFile',
            'fileId': fileId
        }
    }
    const query = encodeQuery(data)
    const response = await fetch(query);
    const res = await response.json();
    console.log("delete file", res);
    if (res.status == "SUCCESS") {
        removeformMedialist(fileId)
    }

    // setactivedomains(res)
}

function removeformMedialist(fileId) {
    console.log("medialist", medialist);
    for (let i = 0; i < medialist.length; i++) {
        const item = medialist[i];
        if (item.fileId == fileId) {
            medialist.splice(i)
            displayuploads()
            return
        }
    }
}
*/

/* PP Upload form  */

/* Active filters */
let domainfilteractive = null;
let programfilteractive = null;
let statusfilteractive = null;

function domainactive(div) {
    const filterbtn = document.getElementById("domainfilterbtn")
    if (div.innerText == "Clear Filter") filterbtn.innerText = "Filter by Domain"
    else filterbtn.innerText = div.innerText
    activefilter.domain = div.innerText
    applyfilter()
}

function programactive(div) {
    const filterbtn = document.getElementById("programfilterbtn")
    if (div.innerText == "Clear Filter") filterbtn.innerText = "Filter by Program"
    else filterbtn.innerText = div.innerText
    activefilter.program = div.innerText
    console.log("program innertext", div.innerText);
    console.log("program activefilter", activefilter);
    applyfilter()

}

function Statusactive(div) {
    const filterbtn = document.getElementById("Statusfilterbtn")
    if (div.innerText == "Clear Filter") filterbtn.innerText = "Filter by Status"
    else filterbtn.innerText = div.innerText
    var statustmp
    if (div.innerText == "Accepted") statustmp = "accepted"
    else if (div.innerText == "Rejected") statustmp = "rejected"
    else if (div.innerText == "Clear Filter") statustmp = "Clear Filter"
    activefilter.status = statustmp
    applyfilter()
}

function applyfilter() {
    console.log('GPP', GPP);
    const PSList = document.getElementById("PSList")
    PSList.innerHTML = ""
    console.log("activefilter", activefilter);
    filteredPP = []
    /* 3 filters active */
    if (activefilter.status != "Clear Filter" && activefilter.program != "Clear Filter" && activefilter.domain != "Clear Filter") {
        GPP.forEach(i => {
            if (i.program == activefilter.program && i.tag == activefilter.status && i.domain == activefilter.domain)
                filteredPP.push(i)
        })
    }
    /* 2 filters active */
    if (activefilter.program != "Clear Filter" && activefilter.domain != "Clear Filter" && activefilter.status == "Clear Filter") {
        GPP.forEach(i => {
            if (i.program == activefilter.program && i.domain == activefilter.domain)
                filteredPP.push(i)
        })
    }
    if (activefilter.domain != "Clear Filter" && activefilter.status != "Clear Filter" && activefilter.program == "Clear Filter") {
        GPP.forEach(i => {
            if (i.tag == activefilter.status && i.domain == activefilter.domain)
                filteredPP.push(i)
        })
    }
    if (activefilter.status != "Clear Filter" && activefilter.program != "Clear Filter" && activefilter.domain == "Clear Filter") {
        GPP.forEach(i => {
            if (i.program == activefilter.program && i.tag == activefilter.status)
                filteredPP.push(i)
        })
    }
    /* 1 filter active */
    if (activefilter.status != "Clear Filter" && activefilter.program == "Clear Filter" && activefilter.domain == "Clear Filter") {
        GPP.forEach(i => {
            if (i.tag == activefilter.status)
                filteredPP.push(i)
        })
    }
    if (activefilter.status == "Clear Filter" && activefilter.program != "Clear Filter" && activefilter.domain == "Clear Filter") {
        GPP.forEach(i => {
            if (i.program == activefilter.program)
                filteredPP.push(i)
        })
    }
    if (activefilter.status == "Clear Filter" && activefilter.program == "Clear Filter" && activefilter.domain != "Clear Filter") {
        GPP.forEach(i => {
            if (i.domain == activefilter.domain)
                filteredPP.push(i)
        })
    }
    // GPP.forEach(i => {
    //     if (activefilter.program != "Clear Filter") if (i.program == activefilter.program) filteredPP.push(i)
    //     if (activefilter.domain != "Clear Filter") if (i.domain == activefilter.domain) filteredPP.push(i)
    //     if (activefilter.status != "Clear Filter") if (i.tag == activefilter.status) filteredPP.push(i)
    // })
    // var filteredPP = [ ...new Set(filteredPP) ]
    renderpp()
}

/* Active filters */



/* Abstraction */
function encodeQuery(data) {
    let query = data.url
    for (let d in data.params)
        query += encodeURIComponent(d) + '='
            + encodeURIComponent(data.params[d]) + '&';
    return query.slice(0, -1)
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    // Months array to convert numeric month to string
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    // Get day, month, year
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    // Get hours and minutes
    let hours = date.getHours();
    const minutes = ("0" + date.getMinutes()).slice(-2);

    // AM or PM
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12;

    // Format the string
    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;

    return formattedDate;
}

function verifyuser() {
    user = JSON.parse(sessionStorage.getItem("user"))
    console.log("user", user);
    if (user) {
        displayusername()
        // var displayName = document.getElementById("profile-name")
        // displayName.innerText = user.name
    } else {
        alert("Session Expired, Please try Logining IN again or use a different browser")
        window.location = "/PCP/pcpauth.html"
    }
}

function displayusername() {
    user = JSON.parse(sessionStorage.getItem("user"))
    // console.log("displayusername", user);
    document.getElementById("profile-name").innerText = user.name
}

function logout() {
    sessionStorage.removeItem("user")
    window.location = "/PCP/pcpauth.html"

}
/* Abstraction */
