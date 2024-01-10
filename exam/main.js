const HOST = "http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/";
const apiKey = "?api_key=a049a0ac-2113-478f-a672-b329fce6f952";
let now = new Date();
var tomorrowDate = now.getFullYear() + "-" + ("0" + (now.getMonth() 
+ 1)).slice(-2) + "-" + ("0" + (now.getDate() + 1)).slice(-2);
var days = [
    "1-1",
    "1-2",
    "1-3",
    "1-4",
    "1-5",
    "1-6",
    "1-7",
    "1-8",
    "2-23",
    "3-8",
    "5-1",
    "5-9",
    "6-12",
    "11-4"];

function showAlert() {
    let alert = document.getElementById('alert');
    alert.classList.remove('d-none');
    setTimeout(() => {
        alert.classList.add('d-none');
    }, 2000);
}

function isThisDayOff(formDate) {
    let date = new Date(formDate);
    let weekDay = date.getDay();
    let monthDay = (date.getMonth() + 1) + '-' + date.getDate();
    let multiply = 1;
    if (weekDay === 0 || weekDay === 6 || days.includes(monthDay)) {
        multiply = 1.5;
    }
    return multiply;
}

function isExpensiveTime(formTime) {
    let hours = Number(formTime.slice(0, 2));
    let addCost = 0;
    if (hours >= 9 && hours < 12) {
        addCost = 400;
    } else if (hours >= 20 && hours < 23) {
        addCost = 1000;
    }
    return addCost;
}

function countOfVisitors(people) {
    let addCost = 0;
    if (people >= 5 && people < 10) {
        addCost = 1000;
    } else if (people >= 10 && people <= 20) {
        addCost = 1500;
    }
    return addCost;
}

function totalPrice(pricePerHour, duration, date, time, count) {
    let total = pricePerHour * duration * isThisDayOff(date);
    let pensionOption = document.getElementById('addition2');
    let interOption = document.getElementById('addition1');
    total += isExpensiveTime(time) + countOfVisitors(count);
    if (pensionOption.checked) {
        total *= 0.75;
    }
    if (interOption.checked) {
        total *= 1.5;
    }
    let message = document.getElementById('totalPrice');
    message.innerHTML = Math.round(total);
}

async function getRoutes() {
    let responce = await fetch(HOST + 'routes' + apiKey);
    let commit = await responce.json();
    return commit;
}

async function getGuides(id) {
    let responce = await fetch(HOST + `routes/${id}/guides` + apiKey);
    let commit = await responce.json();
    return commit;
}

async function postOrder(formData) {
    const responce = await fetch(HOST + 'orders' + apiKey, {
        method: "POST",
        body: formData,
    });
    console.log(await responce.text());
}

function showOrderModal(arr = []) {
    const orderModal = new bootstrap.Modal('#orderModal');
    let checkFirst = 0;
    let checkSecond = 0;
    let pricePerHour = Number(arr[4]);
    let formDuration = document.getElementById('formDuration');
    let duration = Number(formDuration.value);
    let pensionOption = document.getElementById('addition2');
    let interOption = document.getElementById('addition1');
    let now = new Date();
    let day = ("0" + (now.getDate() + 1)).slice(-2);
    let month = ("0" + (now.getMonth() + 1)).slice(-2);
    var tomorrowDate = now.getFullYear() + "-" + month + "-" + day;
    let formDate = document.getElementById('formDate');
    formDate.value = tomorrowDate;
    let formRouteName = document.getElementById('formRouteName');
    formRouteName.value = arr[3];
    let formGuideName = document.getElementById('formGuideName');
    formGuideName.value = arr[1];
    let formTime = document.getElementById('formTime');
    formTime.value = "12:00";
    let formCount = document.getElementById('countOfPersons');
    let count = Number(formCount.value);
    let message = document.getElementById('totalPrice');
    totalPrice(pricePerHour, duration, formDate.value, formTime.value, count);
    let changeHandlers = [formTime, formDate, formDuration, formCount];
    let cklickHandlers = [pensionOption, interOption];
    changeHandlers.forEach(change => {
        change.onchange = function() {
            count = Number(formCount.value);
            duration = Number(formDuration.value);
            totalPrice(pricePerHour, duration, 
                formDate.value, formTime.value, count);
        };
    });
    cklickHandlers.forEach(cklick => {
        cklick.onclick = function() {
            count = Number(formCount.value);
            duration = Number(formDuration.value);
            totalPrice(pricePerHour, duration, 
                formDate.value, formTime.value, count);
        };
    });
    let order = document.getElementById('orderForm');
    order.addEventListener('submit', (event) => {
        event.preventDefault();
        if (interOption.checked) {
            checkFirst = 1;
        }
        if (pensionOption.checked) {
            checkSecond = 1;
        }
        const data = {
            date: `${formDate.value}`,
            duration: `${formDuration.value}`,
            guide_id: `${arr[0]}`,
            id: 2,
            optionFirst: `${checkFirst}`,
            optionSecond: `${checkSecond}`,
            persons: `${formCount.value}`,
            price: `${message.textContent}`,
            route_id: `${arr[2]}`,
            time: `${formTime.value}`,
            student_id: 10700
        };
        console.log(interOption.checked);
        console.log(pensionOption.checked);
        const formData = new FormData();
        for (const key in data) {
            formData.append(key, data[key]);
        }
        postOrder(formData);
        showAlert();
        orderModal.hide();
        window.scrollTo(0, 0);
    });
    orderModal.show();
}

async function createGuidesTable(routeId, routeName) {
    const table = document.querySelector('.guides-table');
    const container = document.getElementById('guides-container');
    let title = document.querySelector('.guides-table-title');
    title.textContent = `Список гидов по маршруту: ${routeName}`;
    container.classList.remove('d-none');
    let guides = await getGuides(routeId);
    let item = "";
    for (let guide of guides) {
        item += `
        <tr>
            <td><i class="bi bi-person-square fs-3"><i></td>
            <th>${guide.name}</th>
            <td>${guide.language}</td>
            <td>${guide.workExperience}</td>
            <td>${guide.pricePerHour}</td>
            <td>
                <button class="selectGuide" 
                id="${guide.id}" data-price="${guide.pricePerHour}" 
                data-guide-name="${guide.name}">
                    Выбрать
                </button>
            </td>
        </tr>`;
    }
    table.innerHTML = item;
    document.querySelectorAll('.selectGuide').forEach(btn => {
        btn.addEventListener('click', function () {
            let id = this.getAttribute('id');
            let name = this.getAttribute('data-guide-name');
            let pricePerHour = this.getAttribute('data-price');
            let arr = [id, name, routeId, routeName, pricePerHour];
            this.parentElement.parentElement.classList.add('table-light');
            showOrderModal(arr);
        });
    });
}

function createPageBtn(page, classes = [], text) {
    let li = document.createElement('li');
    classes.push('page-item');
    for (cls of classes) {
        li.classList.add(cls);
    }
    let btn = document.createElement('a');
    btn.classList.add('page-link');
    btn.classList.add('text-dark');
    btn.dataset.page = page;
    btn.innerHTML = text;
    li.append(btn);
    return li;
}

function createPaginationElems(total, page) {
    let btn;
    let text = 'Первая страница';
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';
    if (page == 1) {
        btn = createPageBtn(1, ['disabled'], text);
    } else {
        btn = createPageBtn(1, [], text);
    }
    paginationContainer.append(btn);
    const start = Math.max(page - 2, 1);
    const end = Math.min(Number(page) + 2, total);
    for (let i = start; i <= end; i++) {
        btn = createPageBtn(i, i == page ? ['active'] : [], i);
        paginationContainer.append(btn);
    }
    text = 'Последняя страница';
    if (page == total) {
        btn = createPageBtn(total, ['disabled'], text);
    } else {
        btn = createPageBtn(total, [], text);
    }
    paginationContainer.append(btn);
}

async function createRouteTable(page = 1) {
    const table = document.querySelector('.routes-table');
    let item = "";
    let data = await getRoutes();
    let total = Math.ceil(data.length / 10);
    createPaginationElems(total, page);
    let start = (page - 1) * 10;
    let end = start + 10;
    let pagedRoutes = data.slice(start, end);
    for (let route of pagedRoutes) {
        item += `
        <tr>
            <th>${route.name}</th>
            <td>${route.description}</td>
            <td>${route.mainObject}</td>
            <td>
                <button class="selectRoute" 
                id="${route.id}" data-route-name="${route.name}">
                    Выбрать
                </button>
            </td>
        </tr>`;
    }
    table.innerHTML = item;
    document.querySelectorAll('.selectRoute').forEach(btn => {
        btn.addEventListener('click', function () {
            let routeId = this.getAttribute('id');
            let routeName = this.getAttribute('data-route-name');
            this.parentElement.parentElement.classList.add('table-light');
            createGuidesTable(routeId, routeName);
        });
    });
}

function pageBtnHandler(event) {
    if (event.target.dataset.page) {
        createRouteTable(event.target.dataset.page);
    }
}

window.onload = function () {
    createRouteTable();
    let pagination = document.querySelector('.pagination');
    pagination.addEventListener('click', pageBtnHandler);
    window.scrollTo(0, 0);
};