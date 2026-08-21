/* =========================================================
   BLUELINE OFFROAD
   ORDER SLIP SYSTEM
========================================================= */


/* =========================================================
   APPLICATION STATE
========================================================= */

let currentOrderNumber = 1;

let items = [];

let orderHistory = [];


/* =========================================================
   DOM ELEMENTS
========================================================= */

const itemsBody =
    document.getElementById("itemsBody");

const totalValue =
    document.getElementById("totalValue");

const orderNumberElement =
    document.getElementById("orderNumber");

const orderDate =
    document.getElementById("orderDate");

const blueLine =
    document.getElementById("blueLine");

const billTo =
    document.getElementById("billTo");

const preparedBy =
    document.getElementById("preparedBy");

const historyList =
    document.getElementById("historyList");

const historyCount =
    document.getElementById("historyCount");

const historySearch =
    document.getElementById("historySearch");

const statusMessage =
    document.getElementById("statusMessage");


/* =========================================================
   STORAGE KEYS
========================================================= */

const HISTORY_STORAGE_KEY =
    "blueline_order_history";

const ORDER_NUMBER_STORAGE_KEY =
    "blueline_next_order_number";


/* =========================================================
   INITIALIZE APPLICATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


function initializeApp() {

    loadHistory();

    loadNextOrderNumber();

    setToday();

    createNewOrder();

    setupButtons();

    renderHistory();
}


/* =========================================================
   BUTTON EVENTS
========================================================= */

function setupButtons() {

    document
        .getElementById("newOrderBtn")
        .addEventListener(
            "click",
            createNewOrder
        );


    document
        .getElementById("saveOrderBtn")
        .addEventListener(
            "click",
            saveOrder
        );


    document
        .getElementById("printBtn")
        .addEventListener(
            "click",
            printOrder
        );


    document
        .getElementById("pngBtn")
        .addEventListener(
            "click",
            downloadPNG
        );


    document
        .getElementById("pdfBtn")
        .addEventListener(
            "click",
            downloadPDF
        );


    document
        .getElementById("addItemBtn")
        .addEventListener(
            "click",
            addItem
        );


    document
        .getElementById("clearHistoryBtn")
        .addEventListener(
            "click",
            clearHistory
        );


    historySearch
        .addEventListener(
            "input",
            renderHistory
        );
}


/* =========================================================
   DATE
========================================================= */

function setToday() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    orderDate.value =
        `${year}-${month}-${day}`;
}


/* =========================================================
   ORDER NUMBER
========================================================= */

function loadNextOrderNumber() {

    const stored =
        localStorage.getItem(
            ORDER_NUMBER_STORAGE_KEY
        );

    if (stored) {

        currentOrderNumber =
            Number(stored);
    }
}


function getFormattedOrderNumber(number) {

    return String(number)
        .padStart(5, "0");
}


function updateOrderNumberDisplay() {

    orderNumberElement.textContent =
        `OS # ${getFormattedOrderNumber(
            currentOrderNumber
        )}`;
}


/* =========================================================
   NEW ORDER
========================================================= */

function createNewOrder() {

    items = [];

    blueLine.value =
        "Blueline Offroad";

    billTo.value =
        "";

    preparedBy.value =
        "";

    setToday();

    updateOrderNumberDisplay();

    addItem();

    calculateTotal();
}


/* =========================================================
   ADD ITEM
========================================================= */

function addItem() {

    const item = {

        id:
            Date.now() +
            Math.random(),

        qty:
            1,

        unit:
            "PCS",

        description:
            "",

        srp:
            0,

        discounts:
            ""

    };


    items.push(item);

    renderItems();

    calculateTotal();
}


/* =========================================================
   RENDER ITEMS
========================================================= */

function renderItems() {

    itemsBody.innerHTML =
        "";


    items.forEach(
        (item, index) => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>

                    <div class="qty-wrapper">

                        <input
                            type="number"
                            min="0"
                            step="1"
                            class="qty-number"
                            value="${item.qty}"
                            data-index="${index}"
                            data-field="qty"
                        >

                        <select
                            class="qty-unit"
                            data-index="${index}"
                            data-field="unit"
                        >

                            <option
                                value="PCS"
                                ${item.unit === "PCS" ? "selected" : ""}
                            >
                                PCS
                            </option>

                            <option
                                value="SET"
                                ${item.unit === "SET" ? "selected" : ""}
                            >
                                SET
                            </option>

                        </select>

                    </div>

                </td>


                <td>

                    <input
                        type="text"
                        class="description"
                        placeholder="Item description"
                        value="${escapeHTML(item.description)}"
                        data-index="${index}"
                        data-field="description"
                    >

                </td>


                <td>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        class="srp"
                        value="${item.srp}"
                        data-index="${index}"
                        data-field="srp"
                    >

                </td>


                <td>

                    <input
                        type="text"
                        class="discounts"
                        placeholder="20, 10, 5"
                        value="${escapeHTML(item.discounts)}"
                        data-index="${index}"
                        data-field="discounts"
                    >

                </td>


                <td>

                    <input
                        type="text"
                        class="net-price"
                        value="${formatMoney(
                            calculateItemNet(item)
                        )}"
                        readonly
                    >

                </td>


                <td>

                    <button
                        type="button"
                        class="delete-item"
                        data-index="${index}"
                    >
                        ×
                    </button>

                </td>

            `;


            itemsBody.appendChild(row);
        }
    );


    attachItemEvents();
}


/* =========================================================
   ITEM EVENTS
========================================================= */

function attachItemEvents() {

    const controls =
        itemsBody.querySelectorAll(
            "[data-field]"
        );


    controls.forEach(
        control => {

            control.addEventListener(
                "input",
                handleItemChange
            );

            control.addEventListener(
                "change",
                handleItemChange
            );
        }
    );


    const deleteButtons =
        itemsBody.querySelectorAll(
            ".delete-item"
        );


    deleteButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            button.dataset.index
                        );

                    deleteItem(index);
                }
            );
        }
    );
}


/* =========================================================
   ITEM CHANGE
========================================================= */

function handleItemChange(event) {

    const element =
        event.target;

    const index =
        Number(
            element.dataset.index
        );

    const field =
        element.dataset.field;


    if (
        !items[index]
    ) {
        return;
    }


    if (
        field === "qty"
    ) {

        items[index].qty =
            Number(element.value) || 0;
    }


    else if (
        field === "srp"
    ) {

        items[index].srp =
            Number(element.value) || 0;
    }


    else {

        items[index][field] =
            element.value;
    }


    updateRowNetPrice(index);

    calculateTotal();
}


/* =========================================================
   DELETE ITEM
========================================================= */

function deleteItem(index) {

    if (
        items.length === 1
    ) {

        showStatus(
            "At least one item is required."
        );

        return;
    }


    items.splice(
        index,
        1
    );


    renderItems();

    calculateTotal();
}


/* =========================================================
   MULTIPLE DISCOUNTS
=========================================================

   Example:

   20, 10, 5

   means:

   Original price = 28,500

   20% discount
   then 10%
   then 5%

   Calculation:

   28,500 × 80%
   × 90%
   × 95%

========================================================= */

function calculateItemNet(item) {

    let price =
        Number(item.srp) || 0;


    const discountString =
        String(
            item.discounts || ""
        ).trim();


    if (
        discountString === ""
    ) {

        return (
            price *
            (Number(item.qty) || 0)
        );
    }


    const discounts =
        discountString
            .split(",")
            .map(
                value =>
                    Number(
                        value.trim()
                    )
            )
            .filter(
                value =>
                    !isNaN(value) &&
                    value >= 0
            );


    discounts.forEach(
        discount => {

            price =
                price *
                (
                    1 -
                    discount / 100
                );
        }
    );


    return (
        price *
        (Number(item.qty) || 0)
    );
}


/* =========================================================
   UPDATE ROW NET PRICE
========================================================= */

function updateRowNetPrice(index) {

    const rows =
        itemsBody.querySelectorAll("tr");


    if (!rows[index]) {
        return;
    }


    const netInput =
        rows[index]
            .querySelector(
                ".net-price"
            );


    if (!netInput) {
        return;
    }


    netInput.value =
        formatMoney(
            calculateItemNet(
                items[index]
            )
        );
}


/* =========================================================
   TOTAL
========================================================= */

function calculateTotal() {

    let total = 0;


    items.forEach(
        item => {

            total +=
                calculateItemNet(
                    item
                );
        }
    );


    totalValue.textContent =
        formatMoney(total);


    return total;
}


/* =========================================================
   MONEY FORMAT
========================================================= */

function formatMoney(number) {

    return Number(
        number || 0
    ).toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}


/* =========================================================
   SAVE ORDER
========================================================= */

function saveOrder() {

    const total =
        calculateTotal();


    const order = {

        id:
            Date.now(),

        orderNumber:
            currentOrderNumber,

        orderNumberFormatted:
            getFormattedOrderNumber(
                currentOrderNumber
            ),

        blueLine:
            blueLine.value,

        orderDate:
            orderDate.value,

        billTo:
            billTo.value,

        preparedBy:
            preparedBy.value,

        items:
            JSON.parse(
                JSON.stringify(items)
            ),

        total:
            total,

        savedAt:
            new Date().toISOString()
    };


    /*
       If the same order number already exists,
       update it instead of creating a duplicate.
    */

    const existingIndex =
        orderHistory.findIndex(
            oldOrder =>
                oldOrder.orderNumber ===
                order.orderNumber
        );


    if (
        existingIndex >= 0
    ) {

        orderHistory[
            existingIndex
        ] = order;

    } else {

        orderHistory.unshift(
            order
        );
    }


    localStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(
            orderHistory
        )
    );


    /*
       Next order number
    */

    currentOrderNumber++;

    localStorage.setItem(
        ORDER_NUMBER_STORAGE_KEY,
        currentOrderNumber
    );


    renderHistory();


    showStatus(
        `Order OS # ${order.orderNumberFormatted} saved.`
    );
}


/* =========================================================
   LOAD HISTORY
========================================================= */

function loadHistory() {

    try {

        const stored =
            localStorage.getItem(
                HISTORY_STORAGE_KEY
            );


        if (stored) {

            orderHistory =
                JSON.parse(
                    stored
                );
        }

    } catch (error) {

        console.error(
            "Could not load order history:",
            error
        );

        orderHistory = [];
    }
}


/* =========================================================
   RENDER HISTORY
========================================================= */

function renderHistory() {

    const search =
        String(
            historySearch.value || ""
        )
        .toLowerCase()
        .trim();


    const filtered =
        orderHistory.filter(
            order => {

                const number =
                    `os # ${order.orderNumberFormatted}`
                    .toLowerCase();

                const customer =
                    String(
                        order.billTo || ""
                    )
                    .toLowerCase();

                return (
                    number.includes(search) ||
                    customer.includes(search)
                );
            }
        );


    historyCount.textContent =
        `${orderHistory.length} ${
            orderHistory.length === 1
                ? "order"
                : "orders"
        }`;


    if (
        filtered.length === 0
    ) {

        historyList.innerHTML = `

            <div class="history-empty">

                ${
                    orderHistory.length === 0
                        ? "No saved orders yet."
                        : "No matching orders found."
                }

            </div>

        `;

        return;
    }


    historyList.innerHTML =
        "";


    filtered.forEach(
        order => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "history-card";


            card.innerHTML = `

                <div class="history-card-top">

                    <div class="history-order-number">

                        OS # ${
                            order.orderNumberFormatted
                        }

                    </div>

                    <div class="history-date">

                        ${formatDate(
                            order.orderDate
                        )}

                    </div>

                </div>


                <div class="history-customer">

                    ${
                        escapeHTML(
                            order.billTo ||
                            "Customer name"
                        )
                    }

                </div>


                <div class="history-total">

                    Total:
                    ${formatMoney(
                        order.total
                    )}

                </div>


                <div class="history-actions">

                    <button
                        class="history-open"
                        data-id="${order.id}"
                        type="button"
                    >
                        Open
                    </button>

                    <button
                        class="history-delete"
                        data-id="${order.id}"
                        type="button"
                    >
                        Delete
                    </button>

                </div>

            `;


            historyList.appendChild(
                card
            );
        }
    );


    attachHistoryEvents();
}


/* =========================================================
   HISTORY EVENTS
========================================================= */

function attachHistoryEvents() {

    const openButtons =
        historyList.querySelectorAll(
            ".history-open"
        );


    openButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    openOrder(
                        Number(
                            button.dataset.id
                        )
                    );
                }
            );
        }
    );


    const deleteButtons =
        historyList.querySelectorAll(
            ".history-delete"
        );


    deleteButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    deleteHistoryOrder(
                        Number(
                            button.dataset.id
                        )
                    );
                }
            );
        }
    );
}


/* =========================================================
   OPEN SAVED ORDER
========================================================= */

function openOrder(id) {

    const order =
        orderHistory.find(
            item =>
                item.id === id
        );


    if (!order) {
        return;
    }


    currentOrderNumber =
        order.orderNumber;


    blueLine.value =
        order.blueLine ||
        "Blueline Offroad";


    orderDate.value =
        order.orderDate ||
        "";


    billTo.value =
        order.billTo ||
        "";


    preparedBy.value =
        order.preparedBy ||
        "";


    items =
        JSON.parse(
            JSON.stringify(
                order.items || []
            )
        );


    if (
        items.length === 0
    ) {

        addItem();

    } else {

        renderItems();

        calculateTotal();
    }


    updateOrderNumberDisplay();


    showStatus(
        `Opened OS # ${order.orderNumberFormatted}.`
    );
}


/* =========================================================
   DELETE HISTORY ORDER
========================================================= */

function deleteHistoryOrder(id) {

    const order =
        orderHistory.find(
            item =>
                item.id === id
        );


    if (!order) {
        return;
    }


    const confirmed =
        confirm(
            `Delete OS # ${order.orderNumberFormatted}?`
        );


    if (!confirmed) {
        return;
    }


    orderHistory =
        orderHistory.filter(
            item =>
                item.id !== id
        );


    localStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(
            orderHistory
        )
    );


    renderHistory();


    showStatus(
        "Order deleted."
    );
}


/* =========================================================
   CLEAR HISTORY
========================================================= */

function clearHistory() {

    if (
        orderHistory.length === 0
    ) {

        showStatus(
            "History is already empty."
        );

        return;
    }


    const confirmed =
        confirm(
            "Delete all saved order history?"
        );


    if (!confirmed) {
        return;
    }


    orderHistory = [];


    localStorage.removeItem(
        HISTORY_STORAGE_KEY
    );


    renderHistory();


    showStatus(
        "Order history cleared."
    );
}


/* =========================================================
   PRINT
========================================================= */

function printOrder() {

    window.print();
}


/* =========================================================
   PNG DOWNLOAD
========================================================= */

async function downloadPNG() {

    const orderSlip =
        document.getElementById(
            "orderSlip"
        );


    try {

        showStatus(
            "Creating PNG..."
        );


        const canvas =
            await html2canvas(
                orderSlip,
                {
                    scale: 2,

                    useCORS: true,

                    backgroundColor:
                        "#ffffff"
                }
            );


        const link =
            document.createElement(
                "a"
            );


        link.download =
            `Order-Slip-${getFormattedOrderNumber(
                currentOrderNumber
            )}.png`;


        link.href =
            canvas.toDataURL(
                "image/png"
            );


        link.click();


        showStatus(
            "PNG downloaded."
        );

    } catch (error) {

        console.error(
            error
        );

        showStatus(
            "PNG export failed."
        );
    }
}


/* =========================================================
   PDF DOWNLOAD
========================================================= */

async function downloadPDF() {

    const orderSlip =
        document.getElementById(
            "orderSlip"
        );


    try {

        showStatus(
            "Creating PDF..."
        );


        const canvas =
            await html2canvas(
                orderSlip,
                {
                    scale: 2,

                    useCORS: true,

                    backgroundColor:
                        "#ffffff"
                }
            );


        const imageData =
            canvas.toDataURL(
                "image/png"
            );


        const {
            jsPDF
        } =
            window.jspdf;


        /*
           Letter size:
           8.5 x 11 inches
        */

        const pdf =
            new jsPDF(
                {
                    orientation:
                        "portrait",

                    unit:
                        "in",

                    format:
                        "letter"
                }
            );


        const pageWidth =
            8.5;

        const pageHeight =
            11;


        /*
           Maintain the original
           Letter-size ratio.
        */

        const imageRatio =
            canvas.height /
            canvas.width;


        let imageWidth =
            pageWidth;


        let imageHeight =
            imageWidth *
            imageRatio;


        /*
           If image becomes too tall,
           scale it down.
        */

        if (
            imageHeight >
            pageHeight
        ) {

            imageHeight =
                pageHeight;

            imageWidth =
                imageHeight /
                imageRatio;
        }


        const x =
            (
                pageWidth -
                imageWidth
            ) / 2;


        const y =
            0;


        pdf.addImage(
            imageData,
            "PNG",
            x,
            y,
            imageWidth,
            imageHeight
        );


        pdf.save(
            `Order-Slip-${getFormattedOrderNumber(
                currentOrderNumber
            )}.pdf`
        );


        showStatus(
            "PDF downloaded."
        );

    } catch (error) {

        console.error(
            error
        );

        showStatus(
            "PDF export failed."
        );
    }
}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-US",
        {
            month:
                "2-digit",

            day:
                "2-digit",

            year:
                "numeric"
        }
    );
}


/* =========================================================
   STATUS
========================================================= */

let statusTimer = null;


function showStatus(message) {

    statusMessage.textContent =
        message;


    statusMessage.style.display =
        "block";


    clearTimeout(
        statusTimer
    );


    statusTimer =
        setTimeout(
            () => {

                statusMessage.style.display =
                    "none";

            },
            2500
        );
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    return String(
        value || ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );
}