const HOST = "http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/";
const apiKey = "?api_key=a049a0ac-2113-478f-a672-b329fce6f952";
let now = new Date();
var tomorrowDate = now.getFullYear() + "-" + ("0" + (now.getMonth() 
+ 1)).slice(-2) + "-" + ("0" + (now.getDate() + 1)).slice(-2);
var holidays = [
    "01-01",
    "01-02",
    "01-03",
    "01-04",
    "01-05",
    "01-06",
    "01-07",
    "01-08",
    "02-23",
    "03-08",
    "05-01",
    "05-09",
    "06-12",
    "11-04"];

function isThisDayOff(formDate) {
    let date = new Date(formDate);
    let day = date.getDay();
    let MonthDay = (date.getMonth() + 1) + '-' + date.getDate();
    let multiply = 1;
    if (day === 0 || day === 6 || holidays.includes(MonthDay)) {
        multiply = 1.5;
    }
    return multiply;
}

function isExpensiveTime(formTime) {
    let time = new Date(formTime);
    let hours = time.getHours();
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
    total += isExpensiveTime(time) + countOfVisitors(count);
    let message = document.getElementById('totalPrice');
    message.innerHTML = `Итоговая стоимость в рублях: ${total}`;
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

function showOrderModal(arr = []) {
    const orderModal = new bootstrap.Modal('#orderModal');
    let pricePerHour = Number(arr[4]);
    let duration = Number(document.getElementById('formDuration').value);
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
    let count = Number(document.getElementById('countOfPersons').value);
    totalPrice(pricePerHour, duration, formDate.value, formTime.value, count);
    console.log(pricePerHour, duration, formDate.value, formTime.value, count);
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
            <td><img src="./images/person-square.svg"></td>
            <th>${guide.name}</th>
            <td>${guide.language}</td>
            <td>${guide.workExperience}</td>
            <td>${guide.pricePerHour}</td>
            <td>
                <button class="selectGuide" 
                data-guide-id="${guide.id}" data-price="${guide.pricePerHour}" 
                data-guide-name="${guide.name}">
                    Выбрать
                </button>
            </td>
        </tr>`;
    }
    table.innerHTML = item;
    document.querySelectorAll('.selectGuide').forEach(btn => {
        btn.addEventListener('click', function () {
            let id = this.getAttribute('data-guide-id');
            let name = this.getAttribute('data-guide-name');
            let pricePerHour = this.getAttribute('data-price');
            let arr = [id, name, routeId, routeName, pricePerHour];
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
                data-route-id="${route.id}" data-route-name="${route.name}">
                    Выбрать
                </button>
            </td>
        </tr>`;
    }
    table.innerHTML = item;
    document.querySelectorAll('.selectRoute').forEach(btn => {
        btn.addEventListener('click', function () {
            let routeId = this.getAttribute('data-route-id');
            let routeName = this.getAttribute('data-route-name');
            createGuidesTable(routeId, routeName);
        });
    });
}

function pageBtnHandler(event) {
    if (event.target.dataset.page) {
        createRouteTable(event.target.dataset.page);
    }
    window.scrollTo(0, 1400);
}

window.onload = function () {
    createRouteTable();
    let pagination = document.querySelector('.pagination');
    pagination.addEventListener('click', pageBtnHandler);
};