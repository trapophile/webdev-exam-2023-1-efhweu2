const HOST = "http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/";
const apiKey = "?api_key=a049a0ac-2113-478f-a672-b329fce6f952";
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

function showAlert(option) {
    let alert = document.getElementById('alert');
    let message = document.getElementById('alertMessage');
    if (option == 'удаление') {
        message.innerHTML = 'удалена.';
    } else if (option == 'редактирование') {
        message.innerHTML = 'отредактирована.';
    }
    alert.classList.remove('d-none');
    setTimeout(() => {
        alert.classList.add('d-none');
    }, 2000);
}

async function putOrder(id, formData) {
    const responce = await fetch(HOST + `orders/${id}` + apiKey, {
        method: "PUT",
        body: formData,
    });
    console.log(await responce.text());
}

async function getOrders() {
    let responce = await fetch(HOST + 'orders' + apiKey);
    let commit = await responce.json();
    return commit;
}

async function getOrderById(id) {
    let responce = await fetch(HOST + `orders/${id}` + apiKey);
    let commit = await responce.json();
    return commit;
}

async function getRoutes(id) {
    let responce = await fetch(HOST + `routes/${id}` + apiKey);
    let commit = await responce.json();
    return commit;
}

async function getGuides(id) {
    let responce = await fetch(HOST + `guides/${id}` + apiKey);
    let commit = await responce.json();
    return commit;
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
        btn.style.visibility = 'hidden';
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
        btn.style.visibility = 'hidden';
    } else {
        btn = createPageBtn(total, [], text);
    }
    paginationContainer.append(btn);
}

async function showOrderModal(id) {
    const orderModal = new bootstrap.Modal('#orderModal');
    const commit = await getOrderById(id);
    let buttons = document.getElementById('buttons');
    buttons.classList.add('d-none');
    let formDuration = document.getElementById('formDuration');
    let pensionOption = document.getElementById('addition2');
    let interOption = document.getElementById('addition1');
    let formDate = document.getElementById('formDate');
    let formRouteName = document.getElementById('formRouteName');
    let formGuideName = document.getElementById('formGuideName');
    let formTime = document.getElementById('formTime');
    let formCount = document.getElementById('countOfPersons');
    let message = document.getElementById('totalPrice');
    const route = await getRoutes(commit.route_id);
    const guide = await getGuides(commit.guide_id);
    formDuration.value = commit.duration;
    formGuideName.value = guide.name;
    formDate.value = commit.date;
    formRouteName.value = route.name;
    formTime.value = commit.time;
    message.innerHTML = commit.price;
    formCount.value = commit.persons;
    let pricePerHour = guide.pricePerHour;
    if (commit.optionFirst) {
        interOption.checked = true;
    }
    if (commit.optionSecond) {
        pensionOption.checked = true;
    }
    formTime.setAttribute('disabled', 'true');
    formDate.setAttribute('disabled', 'true');
    formCount.setAttribute('disabled', 'true');
    pensionOption.setAttribute('disabled', 'true');
    interOption.setAttribute('disabled', 'true');
    formDuration.setAttribute('disabled', 'true');
    totalPrice(pricePerHour, formDuration.value, 
        formDate.value, formTime.value, formCount.value);
    orderModal.show();
}

async function editOrderModal(id) {
    const orderModal = new bootstrap.Modal('#orderModal');
    const commit = await getOrderById(id);
    let checkFirst = 0;
    let checkSecond = 0;
    let buttons = document.getElementById('buttons');
    buttons.classList.remove('d-none');
    let formDuration = document.getElementById('formDuration');
    let pensionOption = document.getElementById('addition2');
    let interOption = document.getElementById('addition1');
    let formDate = document.getElementById('formDate');
    let formRouteName = document.getElementById('formRouteName');
    let formGuideName = document.getElementById('formGuideName');
    let formTime = document.getElementById('formTime');
    let formCount = document.getElementById('countOfPersons');
    let message = document.getElementById('totalPrice');
    const route = await getRoutes(commit.route_id);
    const guide = await getGuides(commit.guide_id);
    formDuration.value = commit.duration;
    formGuideName.value = guide.name;
    formDate.value = commit.date;
    formRouteName.value = route.name;
    formTime.value = commit.time;
    message.innerHTML = commit.price;
    formCount.value = commit.persons;
    let pricePerHour = guide.pricePerHour;
    if (commit.optionFirst) {
        interOption.checked = true;
    }
    if (commit.optionSecond) {
        pensionOption.checked = true;
    }
    formTime.removeAttribute('disabled');
    formDate.removeAttribute('disabled');
    formCount.removeAttribute('disabled');
    pensionOption.removeAttribute('disabled');
    interOption.removeAttribute('disabled');
    formDuration.removeAttribute('disabled');
    totalPrice(pricePerHour, formDuration.value, 
        formDate.value, formTime.value, formCount.value);
    let changeHandlers = [formTime, formDate, formDuration, formCount];
    let cklickHandlers = [pensionOption, interOption];
    changeHandlers.forEach(change => {
        change.onchange = function() {
            totalPrice(pricePerHour, formDuration.value, 
                formDate.value, formTime.value, formCount.value);
        };
    });
    cklickHandlers.forEach(cklick => {
        cklick.onclick = function() {
            totalPrice(pricePerHour, formDuration.value, 
                formDate.value, formTime.value, formCount.value);
        };
    });
    let order = document.getElementById('orderForm');
    order.addEventListener('submit', async (event) => {
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
            guide_id: `${guide.id}`,
            optionFirst: `${checkFirst}`,
            optionSecond: `${checkSecond}`,
            persons: `${formCount.value}`,
            price: `${message.textContent}`,
            route_id: `${route.id}`,
            time: `${formTime.value}`,
        };
        const formData = new FormData();
        for (const key in data) {
            formData.append(key, data[key]);
        }
        await putOrder(id, formData);
        orderModal.hide();
        showAlert('редактирование');  
        window.scrollTo(0, 0);
    });
    orderModal.show();
}

async function deleteOrder(id) {
    const responce = await fetch(HOST + `orders/${id}` + apiKey, {
        method: "DELETE",
    });
    console.log(responce.text());
}

async function deleteOrderModal(id) {
    let orderModal = new bootstrap.Modal('#deleteModal');
    let btn = document.getElementById('delFormBtn');
    btn.addEventListener('click', async () => {
        await deleteOrder(id);
        showAlert('удаление');
        orderModal.hide();
    });
    orderModal.show();
}

async function createOrdersTable(page = 1) {
    const table = document.querySelector('.orders-table');
    let item = "";
    let data = await getOrders();
    let total = Math.ceil(data.length / 5);
    createPaginationElems(total, page);
    let start = (page - 1) * 5;
    let end = start + 5;
    let pagedOrders = data.slice(start, end);
    for (let order of pagedOrders) {
        routeName = await getRoutes(order.route_id);
        guideName = await getGuides(order.guide_id);
        item += `
        <tr>
            <th>${routeName.name}</th>
            <td>${guideName.name}</td>
            <td>${order.date}</td>
            <td>${order.time}</td>
            <td>${order.duration}</td>
            <td>${order.persons}</td>
            <td>${order.price}</td>
            <td>
                <i class="bi bi-eye fs-5" data-id="${order.id}"></i>
                <i class="bi bi-pencil-square fs-5" data-id="${order.id}"></i>
                <i class="bi bi-trash3 fs-5" data-id="${order.id}"></i>
            </td>
        </tr>`;
    }
    table.innerHTML = item;
    document.querySelectorAll('.bi-pencil-square').forEach(btn => {
        btn.addEventListener('click', async function () {
            let id = this.getAttribute('data-id');
            await editOrderModal(id);
        });
    });
    document.querySelectorAll('.bi-trash3').forEach(btn => {
        btn.addEventListener('click', async function () {
            let id = this.getAttribute('data-id');
            await deleteOrderModal(id);
        });
    });
    document.querySelectorAll('.bi-eye').forEach(btn => {
        btn.addEventListener('click', async function () {
            let id = this.getAttribute('data-id');
            await showOrderModal(id);
        });
    });
}

function pageBtnHandler(event) {
    if (event.target.dataset.page) {
        createOrdersTable(event.target.dataset.page);
    }
}

window.onload = function () {
    createOrdersTable();
    let pagination = document.querySelector('.pagination');
    pagination.addEventListener('click', pageBtnHandler);
    let delBtn = document.getElementById('delFormBtn');
    delBtn.addEventListener('click', createOrdersTable);
    let uplBtn = document.getElementById('uploadFormBtn');
    uplBtn.addEventListener('click', async function() {
        setTimeout(await createOrdersTable, 500);
    });
};