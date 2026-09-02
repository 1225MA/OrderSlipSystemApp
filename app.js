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

const remarks =
    document.getElementById("remarks");

const totalEditHint =
    document.getElementById("totalEditHint");

const orderNumberElement =
    document.getElementById("orderNumber");

const orderDate =
    document.getElementById("orderDate");

const seller =
    document.getElementById("Seller");

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


    totalValue
        .addEventListener(
            "input",
            handleTotalInput
        );


    totalValue
        .addEventListener(
            "change",
            handleTotalInput
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

    seller.value =
        "Blueline Offroad";

    billTo.value =
        "";

    preparedBy.value =
        "";

    remarks.value =
        "";

    totalValue.value =
        "0.00";

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

                  <textarea
                        class="description"
                        placeholder="Item description"
                        data-index="${index}"
                        data-field="description"
                        rows="1"
                    >${escapeHTML(item.description)}</textarea>

                </td>
                <td>

                    <input
                        type="text"
                        inputmode="decimal"
                        class="srp"
                        value="${formatMoney(item.srp)}"
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


    /*
       Format SRP with commas
       after the user finishes editing.
    */

    const srpInputs =
        itemsBody.querySelectorAll(
            ".srp"
        );


    srpInputs.forEach(
        input => {

            input.addEventListener(
                "blur",
                () => {

                    input.value =
                        formatMoney(
                            parseMoney(
                                input.value
                            )
                        );

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


    if (!items[index]) {

        return;
    }


    if (field === "qty") {

        items[index].qty =
            Number(element.value) || 0;

    }

    else if (field === "srp") {

        items[index].srp =
            parseMoney(
                element.value
            );

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

    if (items.length === 1) {

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
========================================================= */

function calculateItemNet(item) {

    let price =
        Number(item.srp) || 0;


    const discountString =
        String(
            item.discounts || ""
        ).trim();


    if (discountString === "") {

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

function areAllPricesZero() {

    if (items.length === 0) {

        return true;
    }


    return items.every(
        item => {

            const srp =
                Number(item.srp) || 0;

            const net =
                calculateItemNet(item);


            return (
                srp === 0 &&
                net === 0
            );
        }
    );
}


function updateTotalEditState() {

    const editable =
        areAllPricesZero();


    totalValue.readOnly =
        !editable;


    totalValue.classList.toggle(
        "total-editable",
        editable
    );


    totalEditHint.textContent =
        editable
            ? "Editable because all SRP and Net Price values are 0.00."
            : "Total is calculated automatically while an item has an SRP or Net Price above 0.00.";


    return editable;
}


function calculateTotal() {

    let calculatedTotal = 0;

    items.forEach(
        item => {

            calculatedTotal +=
                calculateItemNet(item);

        }
    );

    const editable =
        areAllPricesZero();


    if (!editable) {

        totalValue.value =
            formatMoney(calculatedTotal);

    }
    else {

        /*
           Keep the manually entered Total
           when all SRP values are zero.
        */

        const currentValue =
            parseMoney(
                totalValue.value
            );

        totalValue.value =
            formatMoney(currentValue);
    }


    updateTotalEditState();


    return editable
        ? parseMoney(totalValue.value)
        : calculatedTotal;
}


function handleTotalInput() {

    if (!areAllPricesZero()) {

        calculateTotal();

        return;
    }


    const value =
        parseMoney(
            totalValue.value
        );


    totalValue.value =
        formatMoney(value);
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


function parseMoney(value) {

    return Number(
        String(value || "")
            .replace(/,/g, "")
    ) || 0;
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

        seller:
            seller.value,

        orderDate:
            orderDate.value,

        billTo:
            billTo.value,

        preparedBy:
            preparedBy.value,

        remarks:
            remarks.value,

        items:
            JSON.parse(
                JSON.stringify(items)
            ),

        total:
            total,

        savedAt:
            new Date().toISOString()

    };


    const existingIndex =
        orderHistory.findIndex(
            oldOrder =>
                oldOrder.orderNumber ===
                order.orderNumber
        );


    if (existingIndex >= 0) {

        orderHistory[
            existingIndex
        ] = order;

    }

    else {

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

    }

    catch (error) {

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


    if (filtered.length === 0) {

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


    seller.value =
        order.seller ||
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


    remarks.value =
        order.remarks ||
        "";


    items =
        JSON.parse(
            JSON.stringify(
                order.items || []
            )
        );


    if (items.length === 0) {

        addItem();

    }

    else {

        renderItems();


        /*
           Restore the saved manual Total
           when all prices are zero.
        */

        if (
            items.every(
                item => {

                    const srp =
                        Number(item.srp) || 0;

                    return (
                        srp === 0 &&
                        calculateItemNet(item) === 0
                    );

                }
            ) &&
            order.total !== undefined
        ) {

            totalValue.value =
                formatMoney(
                    order.total || 0
                );

        }


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
   PREPARE TOTAL FOR PNG / PDF EXPORT
========================================================= */

function prepareTotalForExport(clonedDocument) {

    const clonedTotal =
        clonedDocument.getElementById("totalValue");

    if (!clonedTotal) {
        return;
    }

    const totalBox =
        clonedDocument.createElement("div");

    totalBox.textContent =
        clonedTotal.value || "0.00";

    totalBox.style.width =
        "100%";

    totalBox.style.height =
        clonedTotal.offsetHeight + "px";

    totalBox.style.boxSizing =
        "border-box";

    totalBox.style.padding =
        "8px 12px";

    totalBox.style.display =
        "flex";

    totalBox.style.alignItems =
        "center";

    totalBox.style.justifyContent =
        "flex-end";

    totalBox.style.textAlign =
        "right";

    totalBox.style.fontFamily =
        "Arial, Helvetica, sans-serif";

    totalBox.style.fontWeight =
        "800";

    totalBox.style.fontSize =
        clonedTotal.style.fontSize ||
        "32px";

    totalBox.style.lineHeight =
        "1";

    totalBox.style.whiteSpace =
        "nowrap";

    totalBox.style.overflow =
        "visible";

    totalBox.style.color =
        "#111";

    totalBox.style.backgroundColor =
        "#f8fbff";

    totalBox.style.border =
        "1px solid #aaa";

    totalBox.style.borderRadius =
        "0";

    clonedTotal.parentNode.replaceChild(
        totalBox,
        clonedTotal
    );
}


/* =========================================================
   PRINT / PDF / PNG EXPORT
========================================================= */

/*
   PRINT

   Uses the browser's normal print system.
   This gives you the same Letter-size pagination
   that you see when printing from the browser.
*/
function printOrder() {

    window.print();

}


/*
   PDF

   IMPORTANT:
   The browser's native Print Preview is used here
   so the PDF follows the exact same pagination as
   the normal Print button.

   In Print Preview:
   - Paper size: Letter
   - Scale: 100%
   - Margins: None
   - Destination: Save as PDF
*/
function downloadPDF() {

    showStatus(
        "Opening Print Preview. Choose Save as PDF."
    );

    setTimeout(
        () => {

            window.print();

        },
        100
    );

}


/*
   PNG EXPORT

   PNG cannot use the browser's native print
   pagination directly.

   Therefore each Letter-size page is rendered
   as a separate PNG.

   Page size:
   8.5 × 11 inches

   The table header is repeated on every page.
*/
async function downloadPNG() {

    let exportArea = null;

    try {

        showStatus(
            "Creating PNG..."
        );


        const originalSlip =
            document.getElementById(
                "orderSlip"
            );


        if (!originalSlip) {

            throw new Error(
                "Order slip not found."
            );

        }


        /*
           Create hidden export container.
        */

        exportArea =
            document.createElement(
                "div"
            );


        exportArea.id =
            "blueline-export-area";


        exportArea.style.position =
            "fixed";


        exportArea.style.left =
            "-100000px";


        exportArea.style.top =
            "0";


        exportArea.style.width =
            "8.5in";


        exportArea.style.background =
            "#ffffff";


        document.body.appendChild(
            exportArea
        );


        /*
           Clone the order slip.
        */

        const source =
            originalSlip.cloneNode(
                true
            );


        source.style.width =
            "8.5in";


        source.style.height =
            "auto";


        source.style.minHeight =
            "0";


        source.style.margin =
            "0";


        source.style.padding =
            "0.42in";


        source.style.boxSizing =
            "border-box";


        source.style.background =
            "#ffffff";


        source.style.boxShadow =
            "none";


        exportArea.appendChild(
            source
        );


        /*
           Remove controls from PNG.
        */

        source.querySelectorAll(
            ".add-item-btn, .delete-item, button"
        ).forEach(
            element => {

                element.style.display =
                    "none";

            }
        );


        /*
           Remove total helper text.
        */

        const totalHint =
            source.querySelector(
                "#totalEditHint"
            );


        if (totalHint) {

            totalHint.style.display =
                "none";

        }


        /*
           Hide empty input values
           so placeholders don't appear.
        */

        source.querySelectorAll(
            "input, textarea"
        ).forEach(
            element => {

                if (
                    String(
                        element.value || ""
                    ).trim() === ""
                ) {

                    element.style.setProperty(
                        "color",
                        "transparent",
                        "important"
                    );

                }

            }
        );


        /*
           Hide empty discount placeholders.
        */

        source.querySelectorAll(
            ".discounts"
        ).forEach(
            element => {

                if (
                    String(
                        element.value || ""
                    ).trim() === ""
                ) {

                    element.placeholder =
                        "";

                }

            }
        );


        /*
           Convert Total input into normal text
           so html2canvas captures it correctly.
        */

        const totalInput =
            source.querySelector(
                "#totalValue"
            );


        if (totalInput) {

            const totalBox =
                document.createElement(
                    "div"
                );


            totalBox.textContent =
                totalInput.value ||
                "0.00";


            totalBox.style.width =
                "100%";


            totalBox.style.height =
                totalInput.offsetHeight +
                "px";


            totalBox.style.boxSizing =
                "border-box";


            totalBox.style.display =
                "flex";


            totalBox.style.alignItems =
                "center";


            totalBox.style.justifyContent =
                "flex-end";


            totalBox.style.textAlign =
                "right";


            totalBox.style.padding =
                "8px 12px";


            totalBox.style.fontFamily =
                "Arial, Helvetica, sans-serif";


            totalBox.style.fontWeight =
                "800";


            totalBox.style.fontSize =
                "inherit";


            totalBox.style.lineHeight =
                "1";


            totalBox.style.whiteSpace =
                "nowrap";


            totalBox.style.overflow =
                "visible";


            totalBox.style.color =
                "#111";


            totalBox.style.background =
                "#f8fbff";


            totalBox.style.border =
                "1px solid #aaa";


            totalBox.style.borderRadius =
                "0";


            totalInput.parentNode.replaceChild(
                totalBox,
                totalInput
            );

        }


        /*
           Wait for browser layout.
        */

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    150
                )
        );


        /*
           Letter size in pixels at 96 DPI.
        */

        const PAGE_WIDTH =
            Math.round(
                8.5 * 96
            );


        const PAGE_HEIGHT =
            Math.round(
                11 * 96
            );


        /*
           Determine the complete rendered height.
        */

        const fullHeight =
            source.scrollHeight;


        /*
           Number of PNG pages.
        */

        const pageCount =
            Math.max(
                1,
                Math.ceil(
                    fullHeight /
                    PAGE_HEIGHT
                )
            );


        /*
           Create one PNG for each Letter page.
        */

        for (
            let pageIndex = 0;
            pageIndex < pageCount;
            pageIndex++
        ) {

            const canvas =
                await html2canvas(
                    source,
                    {

                        scale: 2,

                        useCORS: true,

                        backgroundColor:
                            "#ffffff",

                        width:
                            PAGE_WIDTH,

                        height:
                            Math.min(
                                PAGE_HEIGHT,
                                fullHeight -
                                (
                                    pageIndex *
                                    PAGE_HEIGHT
                                )
                            ),

                        windowWidth:
                            PAGE_WIDTH,

                        windowHeight:
                            PAGE_HEIGHT,

                        scrollX: 0,

                        scrollY:
                            pageIndex *
                            PAGE_HEIGHT

                    }
                );


            /*
               Download this page.
            */

            const link =
                document.createElement(
                    "a"
                );


            link.download =
                `Order-Slip-${getFormattedOrderNumber(
                    currentOrderNumber
                )}-Page-${pageIndex + 1}.png`;


            link.href =
                canvas.toDataURL(
                    "image/png"
                );


            document.body.appendChild(
                link
            );


            link.click();


            document.body.removeChild(
                link
            );


            /*
               Small delay between downloads.
            */

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        500
                    )
            );

        }


        showStatus(
            `${pageCount} PNG page${
                pageCount === 1
                    ? ""
                    : "s"
            } downloaded.`
        );


    }
    catch (error) {

        console.error(
            "PNG export error:",
            error
        );


        showStatus(
            "PNG export failed."
        );

    }


    finally {

        if (exportArea) {

            exportArea.remove();

        }

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